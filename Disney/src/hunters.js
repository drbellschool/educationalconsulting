import * as cheerio from 'cheerio';

const USER_AGENT = 'BellFamilyDisneyBot/1.0 (+https://lonestarteacher.com/Disney/)';

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': USER_AGENT,
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    return {
      ok: response.ok,
      status: response.status,
      url,
      text: response.ok ? await response.text() : ''
    };
  } catch (error) {
    return { ok: false, status: 0, url, text: '', error: error.message };
  } finally {
    clearTimeout(timeout);
  }
}

function moneyMentions(text) {
  const matches = text.match(/\$\s?\d{2,5}(?:,\d{3})?(?:\.\d{2})?/g) || [];
  return [...new Set(matches)].slice(0, 12);
}

function usefulSnippets(text, terms) {
  const compact = text.replace(/\s+/g, ' ');
  const snippets = [];
  for (const term of terms) {
    const index = compact.toLowerCase().indexOf(term.toLowerCase());
    if (index >= 0) snippets.push(compact.slice(Math.max(0, index - 90), index + 220));
  }
  return [...new Set(snippets)].slice(0, 8);
}

export async function huntPublicSource(source) {
  const result = await fetchText(source.url);
  if (!result.ok) {
    return {
      sourceId: source.id,
      sourceName: source.name,
      sourceUrl: source.url,
      status: 'fetch-failed',
      confidence: 20,
      summary: `Could not fetch source. Status: ${result.status || 'network error'}.`,
      pricesFound: [],
      snippets: []
    };
  }

  const $ = cheerio.load(result.text);
  const title = $('title').first().text().trim() || source.name;
  const bodyText = $('body').text();
  const terms = ['special offer', 'save', 'ticket', 'hotel', 'resort', 'package', 'deal', 'vacation', 'dining'];

  return {
    sourceId: source.id,
    sourceName: source.name,
    sourceUrl: source.url,
    status: 'checked',
    title,
    confidence: source.type.includes('official') ? 70 : 55,
    summary: `Checked ${source.name}. Review snippets and prices before treating anything as bookable.`,
    pricesFound: moneyMentions(bodyText),
    snippets: usefulSnippets(bodyText, terms),
    checkedAt: new Date().toISOString()
  };
}

export function buildEstimatedTripOptions(criteria, sourceFindings) {
  const base = {
    familySize: criteria.familySize,
    travelMode: criteria.travelMode,
    targetBudgetHigh: criteria.targetBudgetHigh || criteria.maxTotalBudget || 3000
  };

  const options = [
    {
      id: 'drive-offsite-one-park-day',
      title: 'Drive + off-site hotel + 1 Disney park day',
      type: 'trip-estimate',
      estimatedTotal: 2850,
      estimatedBreakdown: { gas: 650, lodging: 650, tickets: 1300, food: 450, extras: 200 },
      familyFit: 82,
      dateQuality: 70,
      travelConvenience: 72,
      confidence: 68,
      summary: 'Most realistic path to Disney inside the $2,000–$3,000 target. It keeps the magic, but limits park tickets.',
      action: 'Watch for hotel rooms under $150/night and ticket promos. Book only when the real total stays under $3,000.',
      ...base
    },
    {
      id: 'drive-good-neighbor-two-days',
      title: 'Drive + Good Neighbor hotel + 2 park days',
      type: 'trip-estimate',
      estimatedTotal: 3750,
      estimatedBreakdown: { gas: 650, lodging: 900, tickets: 1900, food: 650, extras: 300 },
      familyFit: 88,
      dateQuality: 75,
      travelConvenience: 75,
      confidence: 62,
      summary: 'Better Disney feel, but likely above budget unless a hotel or ticket discount appears.',
      action: 'Use as stretch target. Alert only if total drops near $3,000.',
      ...base
    },
    {
      id: 'drive-disney-value-promo',
      title: 'Drive + Disney value resort promotion',
      type: 'trip-estimate',
      estimatedTotal: 4300,
      estimatedBreakdown: { gas: 650, lodging: 1300, tickets: 1900, food: 800, extras: 350 },
      familyFit: 92,
      dateQuality: 80,
      travelConvenience: 90,
      confidence: 55,
      summary: 'Best experience, weakest budget fit. This only becomes interesting if Disney posts a major public offer.',
      action: 'Watch official Disney special offers. Do not book unless the full math changes.',
      ...base
    }
  ];

  const priceSignals = sourceFindings.flatMap((finding) => finding.pricesFound || []);
  return options.map((option) => ({ ...option, priceSignals }));
}

export function buildAlertMessages(scoredDeals, criteria) {
  const budget = criteria.targetBudgetHigh || criteria.maxTotalBudget || 3000;
  const alerts = [];

  for (const deal of scoredDeals) {
    if (deal.estimatedTotal && deal.estimatedTotal <= budget) {
      alerts.push({
        level: 'urgent',
        title: 'Disney trip estimate under budget',
        message: `Disney Alert: ${deal.title} is estimated at $${deal.estimatedTotal.toLocaleString()}. Verify prices today before it changes.`,
        dealId: deal.id
      });
    } else if (deal.score >= 85) {
      alerts.push({
        level: 'watch',
        title: 'Strong Disney deal score',
        message: `Disney Watch: ${deal.title} scored ${deal.score}. Review this option.`,
        dealId: deal.id
      });
    }
  }

  return alerts;
}
