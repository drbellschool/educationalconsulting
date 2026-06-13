import OpenAI from 'openai';

function fallbackAgent({ deals, alerts }) {
  const best = [...deals].sort((a, b) => b.score - a.score)[0];
  return {
    mode: 'local-only',
    summary: 'OPENAI_API_KEY is not configured or the agent could not run. The bot used local scoring, source checks, and alert rules.',
    bestMove: best ? `Review ${best.title}. Current score: ${best.score}.` : 'No deal candidates scored yet.',
    watchItems: [
      'Official Disney special offers',
      'Ticket promos that fit a short driving trip',
      'Off-site hotels that sleep six and include breakfast',
      'Total trip estimates under $3,000'
    ],
    recommendations: deals.slice(0, 5).map((deal) => ({
      title: deal.title,
      reason: deal.summary,
      suggestedAction: deal.action,
      urgency: alerts.some((alert) => alert.dealId === deal.id) ? 'urgent' : 'watch'
    }))
  };
}

export async function runPlanningAgent({ criteria, deals, findings = [], alerts = [] }) {
  if (!process.env.OPENAI_API_KEY) return fallbackAgent({ deals, alerts });

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = {
    criteria,
    deals: deals.slice(0, 12),
    findings,
    alerts,
    instructions: [
      'You are a practical Disney World vacation planning agent for a family of six driving from the Texarkana/Genoa area.',
      'Respect the target budget of 2000 to 3000 dollars.',
      'Never claim a price is final unless the evidence proves it.',
      'Prioritize realistic options: off-site lodging, short stay, 1 to 2 park days, free breakfast, and low-crowd windows.',
      'Create a useful progress update Adam and Alissa can act on today.',
      'If there is an under-budget candidate, say it clearly and tell them to verify before booking.',
      'Return concise JSON only.'
    ]
  };

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: `Analyze this Disney deal-hunter report and return JSON with keys: summary, bestMove, watchItems, recommendations, textAlertDraft.\n\n${JSON.stringify(prompt, null, 2)}`
    });

    let parsed;
    try {
      parsed = JSON.parse(response.output_text);
    } catch {
      parsed = null;
    }

    if (parsed) {
      return {
        mode: 'openai-agent',
        summary: parsed.summary || response.output_text,
        bestMove: parsed.bestMove || 'Review the top deal and verify prices before booking.',
        watchItems: parsed.watchItems || [],
        recommendations: parsed.recommendations || [],
        textAlertDraft: parsed.textAlertDraft || ''
      };
    }

    return {
      mode: 'openai-agent-text',
      summary: response.output_text,
      bestMove: 'Review the generated recommendations and verify prices before booking.',
      watchItems: [],
      recommendations: [],
      textAlertDraft: ''
    };
  } catch (error) {
    return {
      ...fallbackAgent({ deals, alerts }),
      mode: 'openai-error-fallback',
      summary: `OpenAI agent failed, so local scoring was used. Error: ${error.message}`
    };
  }
}
