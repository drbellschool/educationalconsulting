import OpenAI from 'openai';

export async function runPlanningAgent({ criteria, deals }) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      mode: 'local-only',
      summary: 'OPENAI_API_KEY is not configured yet. The bot used local scoring and source checks only.',
      bestMove: 'Set OPENAI_API_KEY as a GitHub Actions secret to activate the ChatGPT planning agent.',
      watchItems: [
        'Official Disney special offers',
        'Off-site hotels with free breakfast or shuttle',
        'Ticket promos that fit a short driving trip'
      ],
      recommendations: deals.slice(0, 5).map((deal) => ({
        title: deal.title,
        reason: deal.summary,
        suggestedAction: deal.action,
        urgency: 'watch'
      }))
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = {
    criteria,
    deals,
    instructions: [
      'Plan for a family of six driving to Walt Disney World.',
      'Respect the target budget of 2000 to 3000 dollars.',
      'Do not pretend a price is final unless the source explicitly proves it.',
      'Favor realistic, practical suggestions over luxury packages.',
      'Return concise JSON only.'
    ]
  };

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    input: `You are a careful Disney World vacation planning agent. Analyze this JSON and return practical recommendations only.\n\n${JSON.stringify(prompt, null, 2)}`
  });

  return {
    mode: 'openai-agent',
    summary: response.output_text,
    bestMove: 'Review the generated recommendations and verify prices before booking.',
    watchItems: [],
    recommendations: []
  };
}
