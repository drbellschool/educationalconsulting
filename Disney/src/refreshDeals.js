import fs from 'fs/promises';
import path from 'path';
import { scoreDeal, labelDeal } from './scoring.js';
import { runPlanningAgent } from './openaiPlanner.js';
import { huntPublicSource, buildEstimatedTripOptions, buildAlertMessages } from './hunters.js';

const root = path.resolve(process.cwd());
const configDir = path.join(root, 'config');
const dataDir = path.join(root, 'data');
const publicDir = path.join(root, 'public');

async function readJson(filePath, fallback = null) {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function sourceFindingToDeal(finding, criteria) {
  const deal = {
    id: `${finding.sourceId}-${new Date().toISOString().slice(0, 10)}`,
    sourceId: finding.sourceId,
    sourceName: finding.sourceName,
    sourceUrl: finding.sourceUrl,
    type: 'source-finding',
    title: finding.status === 'checked' ? `Fresh check: ${finding.sourceName}` : `Needs manual check: ${finding.sourceName}`,
    summary: finding.pricesFound?.length
      ? `${finding.summary} Price signals found: ${finding.pricesFound.join(', ')}.`
      : finding.summary,
    estimatedTotal: null,
    estimatedSavings: null,
    confidence: finding.confidence,
    familyFit: 62,
    dateQuality: 55,
    travelConvenience: criteria.travelMode === 'drive' ? 65 : 50,
    action: finding.status === 'checked'
      ? 'Open this source and verify whether the price signal applies to your dates and family size.'
      : 'Open manually; this source could not be checked automatically.',
    pricesFound: finding.pricesFound || [],
    snippets: finding.snippets || [],
    checkedAt: finding.checkedAt || new Date().toISOString()
  };
  const score = scoreDeal(deal, criteria);
  return { ...deal, score, label: labelDeal(score) };
}

function scoreTripOption(option, criteria) {
  const score = scoreDeal(option, criteria);
  return { ...option, score, label: labelDeal(score), sourceUrl: option.sourceUrl || 'https://disneyworld.disney.go.com/special-offers/' };
}

function renderHtml({ criteria, deals, findings, alerts, agent }) {
  const bestDeal = [...deals].sort((a, b) => b.score - a.score)[0];
  const cards = deals.slice(0, 8).map((deal) => `
    <article class="deal">
      <div class="score">${deal.score}</div>
      <div>
        <h3>${deal.title}</h3>
        <p>${deal.summary}</p>
        ${deal.estimatedTotal ? `<p><strong>Estimated total:</strong> $${deal.estimatedTotal.toLocaleString()}</p>` : ''}
        <p><strong>Status:</strong> ${deal.label}</p>
        <p><strong>Action:</strong> ${deal.action}</p>
        <a class="btn" href="${deal.sourceUrl}" target="_blank" rel="noopener">Open source</a>
      </div>
    </article>
  `).join('\n');

  const alertCards = alerts.length ? alerts.map((alert) => `
    <div class="alert"><strong>${alert.title}</strong><br><span>${alert.message}</span></div>
  `).join('\n') : '<div class="alert"><strong>No urgent deal yet.</strong><br><span>The bot checked sources and did not find a verified under-budget alert. Keep watching.</span></div>';

  const sourceRows = findings.map((finding) => `
    <tr><td><strong>${finding.sourceName}</strong></td><td>${finding.status}</td><td>${(finding.pricesFound || []).join(', ') || 'No direct price signal'}</td><td><a href="${finding.sourceUrl}" target="_blank">Open</a></td></tr>
  `).join('\n');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bell Family Disney Command Center</title>
<style>
:root{--bg:#07111f;--panel:#101b2d;--panel2:#162238;--line:#263856;--text:#f8fafc;--muted:#b6c4d8;--gold:#fbbf24;--blue:#60a5fa;--green:#34d399;--red:#fb7185;--purple:#a78bfa}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:radial-gradient(circle at top left,#1d4ed8 0,transparent 28%),var(--bg);color:var(--text)}main{width:min(1180px,94vw);margin:auto;padding:22px 0 50px}.hero{display:grid;grid-template-columns:1.4fr .8fr;gap:18px}.hero-card,.card{background:rgba(16,27,45,.94);border:1px solid var(--line);border-radius:24px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.25)}.hero-card{background:linear-gradient(135deg,rgba(37,99,235,.95),rgba(124,58,237,.9))}h1{font-size:clamp(34px,5vw,62px);line-height:.98;margin:0 0 12px}h2{margin:0 0 14px}h3{margin:0 0 8px}p,td{color:var(--muted);line-height:1.45}.hero-card p{color:#eef4ff}.badge-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.badge{border:1px solid rgba(255,255,255,.24);background:rgba(255,255,255,.12);padding:8px 10px;border-radius:999px;font-weight:700}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:16px}.two{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}.three{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:14px}.metric{background:var(--panel2);border:1px solid var(--line);border-radius:18px;padding:16px}.metric .num{font-size:30px;font-weight:900;color:white}.metric .label,.small{color:var(--muted);font-size:13px}.bar{height:13px;background:#0b1322;border-radius:999px;border:1px solid var(--line);overflow:hidden}.fill{height:100%;background:linear-gradient(90deg,var(--green),var(--gold));width:var(--w)}.rings{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.ring{--p:50;background:conic-gradient(var(--c) calc(var(--p)*1%),#0b1322 0);border-radius:50%;width:120px;height:120px;display:grid;place-items:center;margin:auto}.ring-inner{width:88px;height:88px;background:var(--panel);border-radius:50%;display:grid;place-items:center;text-align:center;border:1px solid var(--line)}.ring-inner strong{font-size:22px}.phase{display:grid;grid-template-columns:36px 1fr auto;gap:12px;padding:13px;border:1px solid var(--line);border-radius:16px;background:#0c1728;margin:10px 0;align-items:center}.dot{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-weight:900;background:var(--line)}.done .dot{background:var(--green);color:#052e22}.active .dot{background:var(--gold);color:#3b2500}.later .dot{background:#334155}.status{font-weight:900;font-size:13px;padding:6px 9px;border-radius:999px;background:#0b1322;color:var(--muted)}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px;border-bottom:1px solid var(--line);vertical-align:top}th{color:white;background:#0c1728}.deal{border:1px solid var(--line);background:#0c1728;border-radius:16px;padding:14px;margin:10px 0;display:grid;grid-template-columns:72px 1fr;gap:14px}.score{width:60px;height:60px;border-radius:19px;background:linear-gradient(135deg,var(--gold),#f97316);color:#111827;display:grid;place-items:center;font-weight:900;font-size:24px}.button-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}a.btn{display:inline-block;text-decoration:none;color:white;border:1px solid rgba(255,255,255,.25);border-radius:14px;padding:11px 13px;background:rgba(255,255,255,.1);font-weight:800}.btn.primary{background:var(--gold);color:#111827;border:none}.warning{border-left:5px solid var(--gold)}.green{color:var(--green)}.gold{color:var(--gold)}.red{color:var(--red)}.checklist li{margin:9px 0;color:var(--muted)}.checklist strong{color:white}.calc{display:grid;grid-template-columns:1fr 1fr;gap:10px}.calc label{font-size:13px;color:var(--muted)}.calc input{width:100%;margin-top:5px;background:#0b1322;color:white;border:1px solid var(--line);border-radius:12px;padding:10px}.alert{background:#0c1728;border:1px solid var(--line);border-radius:16px;padding:13px;margin:10px 0}.alert strong{color:white}@media(max-width:900px){.hero,.two,.three,.grid,.rings,.calc{grid-template-columns:1fr}.ring{width:108px;height:108px}.ring-inner{width:78px;height:78px}}
</style></head><body><main>
<section class="hero"><div class="hero-card"><h1>Disney Trip Command Center</h1><p>Nightly deal hunter, budget calculator, progress tracker, and ChatGPT planning readout for the Bell family Disney World trip.</p><div class="badge-row"><span class="badge">Family of 6</span><span class="badge">Drive to Orlando</span><span class="badge">4-day target</span><span class="badge">$2K–$3K goal</span></div></div><div class="card warning"><h2>Best Current Move</h2><p>${agent.bestMove || 'Review the top scored option and verify prices.'}</p><p class="small">Last refreshed: ${new Date().toLocaleString()}</p></div></section>
<section class="grid"><div class="metric"><div class="label">Target Budget</div><div class="num">$${criteria.targetBudgetHigh.toLocaleString()}</div><p class="small">Hard ceiling for the bot.</p></div><div class="metric"><div class="label">Best Score</div><div class="num">${bestDeal?.score || 0}</div><p class="small">${bestDeal?.title || 'No deal scored yet'}</p></div><div class="metric"><div class="label">Sources Checked</div><div class="num">${findings.length}</div><p class="small">Public source checks from workflow.</p></div><div class="metric"><div class="label">Alerts</div><div class="num">${alerts.length}</div><p class="small">Dashboard alerts generated.</p></div></section>
<section class="card" style="margin-top:14px"><h2>Progress Rings</h2><div class="rings"><div><div class="ring" style="--p:100;--c:var(--green)"><div class="ring-inner"><strong>100%</strong><span class="small">Criteria</span></div></div></div><div><div class="ring" id="budgetRing" style="--p:0;--c:var(--gold)"><div class="ring-inner"><strong id="budgetPct">0%</strong><span class="small">Budget</span></div></div></div><div><div class="ring" style="--p:65;--c:var(--blue)"><div class="ring-inner"><strong>65%</strong><span class="small">Hunters</span></div></div></div><div><div class="ring" style="--p:${bestDeal?.estimatedTotal && bestDeal.estimatedTotal <= criteria.targetBudgetHigh ? 70 : 30};--c:var(--purple)"><div class="ring-inner"><strong>${bestDeal?.estimatedTotal && bestDeal.estimatedTotal <= criteria.targetBudgetHigh ? '70%' : '30%'}</strong><span class="small">Booking</span></div></div></div></div></section>
<section class="two"><div class="card"><h2>Live Budget Calculator</h2><div class="calc"><label>Gas / driving<input id="gas" type="number" value="650"></label><label>Lodging<input id="lodging" type="number" value="750"></label><label>Tickets<input id="tickets" type="number" value="1800"></label><label>Food<input id="food" type="number" value="650"></label><label>Parking / stroller / extras<input id="extras" type="number" value="350"></label><label>Budget ceiling<input id="budget" type="number" value="3000"></label><label>Target departure<input id="tripDate" type="date"></label><label>Saved so far<input id="savedAmount" type="number" value="0"></label></div><h1 id="totalCost" style="font-size:40px;margin-top:16px">$4,200</h1><p id="budgetVerdict" class="red"><strong>Over budget.</strong></p><div class="bar"><div id="savingsBar" class="fill" style="--w:0%"></div></div><p id="savingsText" class="small">Savings progress</p><h2 id="countdown">Pick a date</h2></div><div class="card"><h2>Trip Order of Operations</h2><div class="phase done"><div class="dot">✓</div><div><strong>Criteria set</strong><br><span class="small">Family, ages, driving, budget.</span></div><span class="status">DONE</span></div><div class="phase active"><div class="dot">2</div><div><strong>Hunt live signals</strong><br><span class="small">Official offers, tickets, hotel links, source snippets.</span></div><span class="status">NOW</span></div><div class="phase active"><div class="dot">3</div><div><strong>Compare versions</strong><br><span class="small">1-day, 2-day, off-site, Good Neighbor, Disney promo.</span></div><span class="status">NOW</span></div><div class="phase later"><div class="dot">4</div><div><strong>Verify final cart price</strong><br><span class="small">The bot alerts; humans verify before booking.</span></div><span class="status">NEXT</span></div></div></section>
<section class="two"><div class="card"><h2>Bot Alerts</h2>${alertCards}</div><div class="card"><h2>ChatGPT Agent Readout</h2><p>${agent.summary || 'Agent summary not available yet.'}</p></div></section>
<section class="two"><div class="card"><h2>Top Deal Candidates</h2>${cards}</div><div class="card"><h2>Source Checks</h2><table><thead><tr><th>Source</th><th>Status</th><th>Price Signals</th><th>Link</th></tr></thead><tbody>${sourceRows}</tbody></table></div></section>
</main><script>
const fields=['gas','lodging','tickets','food','extras','budget','savedAmount','tripDate'];function money(n){return '$'+Math.round(n).toLocaleString();}function save(){fields.forEach(id=>{const el=document.getElementById(id);if(el)localStorage.setItem('disney_'+id,el.value);});}function load(){fields.forEach(id=>{const el=document.getElementById(id);const v=localStorage.getItem('disney_'+id);if(el&&v!==null)el.value=v;});}function update(){const gas=+gasEl.value||0,lodging=+lodgingEl.value||0,tickets=+ticketsEl.value||0,food=+foodEl.value||0,extras=+extrasEl.value||0,budget=+budgetEl.value||3000,saved=+savedAmount.value||0,total=gas+lodging+tickets+food+extras;totalCost.textContent=money(total);if(total<=budget){budgetVerdict.className='green';budgetVerdict.innerHTML='<strong>Candidate trip.</strong> This version fits the ceiling. Verify real prices before booking.';}else{budgetVerdict.className='red';budgetVerdict.innerHTML='<strong>Over budget by '+money(total-budget)+'.</strong> Cut ticket days, lodging, or food plan.';}const pct=Math.min(100,Math.round(saved/budget*100));savingsBar.style.setProperty('--w',pct+'%');savingsText.textContent='Savings progress: '+money(saved)+' of '+money(budget)+' ('+pct+'%)';budgetRing.style.setProperty('--p',pct);budgetPct.textContent=pct+'%';if(tripDate.value){const days=Math.ceil((new Date(tripDate.value+'T00:00:00')-new Date())/86400000);countdown.textContent=days>=0?days+' days until departure':'Trip date passed';}else countdown.textContent='Pick a date';save();}const gasEl=document.getElementById('gas'),lodgingEl=document.getElementById('lodging'),ticketsEl=document.getElementById('tickets'),foodEl=document.getElementById('food'),extrasEl=document.getElementById('extras'),budgetEl=document.getElementById('budget');load();fields.forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('input',update);});update();
</script></body></html>`;
}

async function main() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(publicDir, { recursive: true });

  const criteria = await readJson(path.join(configDir, 'family-criteria.json'));
  const { sources } = await readJson(path.join(configDir, 'sources.json'));

  const findings = await Promise.all(sources.map((source) => huntPublicSource(source)));
  const sourceDeals = findings.map((finding) => sourceFindingToDeal(finding, criteria));
  const tripOptions = buildEstimatedTripOptions(criteria, findings).map((option) => scoreTripOption(option, criteria));
  const deals = [...tripOptions, ...sourceDeals].sort((a, b) => b.score - a.score);
  const alerts = buildAlertMessages(deals, criteria);
  const agent = await runPlanningAgent({ criteria, deals, findings, alerts });

  const output = {
    generatedAt: new Date().toISOString(),
    criteria,
    agent,
    alerts,
    findings,
    deals
  };

  const html = renderHtml({ criteria, deals, findings, alerts, agent });
  await fs.writeFile(path.join(dataDir, 'deals.json'), JSON.stringify(output, null, 2));
  await fs.writeFile(path.join(publicDir, 'index.html'), html);
  await fs.writeFile(path.join(root, 'index.html'), html);

  console.log(`Disney bot refreshed with ${findings.length} source checks, ${deals.length} scored options, and ${alerts.length} alerts.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
