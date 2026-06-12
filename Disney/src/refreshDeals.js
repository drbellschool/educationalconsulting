import fs from 'fs/promises';
import path from 'path';
import { scoreDeal, labelDeal } from './scoring.js';
import { runPlanningAgent } from './openaiPlanner.js';

const root = path.resolve(process.cwd());
const configDir = path.join(root, 'config');
const dataDir = path.join(root, 'data');
const publicDir = path.join(root, 'public');

async function readJson(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  return JSON.parse(text);
}

function buildSeedDeals(criteria, sources) {
  const now = new Date().toISOString();

  return sources.map((source) => {
    const deal = {
      id: `${source.id}-${now.slice(0, 10)}`,
      sourceId: source.id,
      sourceName: source.name,
      sourceUrl: source.url,
      type: source.type,
      title: `Check ${source.name}`,
      summary: source.notes,
      estimatedTotal: null,
      estimatedSavings: null,
      confidence: source.type.includes('official') ? 75 : 55,
      familyFit: source.type.includes('official') ? 70 : 65,
      dateQuality: 55,
      travelConvenience: criteria.travelMode === 'drive' ? 70 : 50,
      action: source.type === 'manual-review-link'
        ? 'Open manually and compare dates. Add real prices to data/manual-deals.json if you find one.'
        : 'Review this source for new Disney World promotions and verify final price.',
      createdAt: now,
      updatedAt: now
    };

    const score = scoreDeal(deal, criteria);
    return { ...deal, score, label: labelDeal(score) };
  }).sort((a, b) => b.score - a.score);
}

function renderHtml({ criteria, deals, agent }) {
  const cards = deals.map((deal) => `
    <article class="card">
      <div class="score">${deal.score}</div>
      <div>
        <h3>${deal.title}</h3>
        <p>${deal.summary}</p>
        <p><strong>Status:</strong> ${deal.label}</p>
        <p><strong>Action:</strong> ${deal.action}</p>
        <a href="${deal.sourceUrl}" target="_blank" rel="noopener">Open source</a>
      </div>
    </article>
  `).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bell Family Disney Bot</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #111827; color: #f9fafb; }
    main { max-width: 1100px; margin: auto; padding: 24px; }
    .hero { background: linear-gradient(135deg, #1d4ed8, #7c3aed); border-radius: 24px; padding: 28px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin: 20px 0; }
    .stat, .card, .agent { background: #1f2937; border: 1px solid #374151; border-radius: 18px; padding: 18px; }
    .card { display: grid; grid-template-columns: 70px 1fr; gap: 16px; align-items: start; }
    .score { width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center; background: #facc15; color: #111827; font-weight: 800; font-size: 22px; }
    a { color: #93c5fd; }
    h1, h2, h3 { margin-top: 0; }
    .muted { color: #cbd5e1; }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <h1>Bell Family Disney Bot</h1>
      <p>Driving trip watcher for Walt Disney World. Built for a family of six with a target budget of $${criteria.targetBudgetLow}–$${criteria.targetBudgetHigh}.</p>
      <p class="muted">Last refreshed: ${new Date().toLocaleString()}</p>
    </section>

    <section class="grid">
      <div class="stat"><h3>Travelers</h3><p>${criteria.familySize}: Adam, wife, and kids ages ${criteria.travelers.childrenAges.join(', ')}</p></div>
      <div class="stat"><h3>Trip Style</h3><p>${criteria.travelMode}, about ${criteria.idealTripDays} days</p></div>
      <div class="stat"><h3>Budget</h3><p>$${criteria.targetBudgetLow}–$${criteria.targetBudgetHigh}</p></div>
      <div class="stat"><h3>Best Strategy</h3><p>Short trip, drive, off-site hotel, limited park days.</p></div>
    </section>

    <section class="agent">
      <h2>ChatGPT Agent Readout</h2>
      <p>${agent.summary}</p>
      <p><strong>Best move:</strong> ${agent.bestMove}</p>
    </section>

    <h2>Deal Watch List</h2>
    ${cards}
  </main>
</body>
</html>`;
}

async function main() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(publicDir, { recursive: true });

  const criteria = await readJson(path.join(configDir, 'family-criteria.json'));
  const { sources } = await readJson(path.join(configDir, 'sources.json'));

  const deals = buildSeedDeals(criteria, sources);
  const agent = await runPlanningAgent({ criteria, deals });

  const output = {
    generatedAt: new Date().toISOString(),
    criteria,
    agent,
    deals
  };

  await fs.writeFile(path.join(dataDir, 'deals.json'), JSON.stringify(output, null, 2));
  await fs.writeFile(path.join(publicDir, 'index.html'), renderHtml({ criteria, deals, agent }));

  console.log(`Disney bot refreshed with ${deals.length} watched sources.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
