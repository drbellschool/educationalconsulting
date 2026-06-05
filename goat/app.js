const DATA_URL = 'data/goat-bot.json?v=' + Date.now();
const STORE_KEY = 'rrfGoatInventoryV2';

function $(id) {
  return document.getElementById(id);
}

function money(n) {
  n = Number(n || 0);
  return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function num(n) {
  return Number(n || 0).toLocaleString();
}

function dateText(v) {
  if (!v) return '--';
  const d = new Date(v);
  return isNaN(d) ? String(v) : d.toLocaleString();
}

function loadLocalInventory() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalInventory(items) {
  localStorage.setItem(STORE_KEY, JSON.stringify(items));
}

function baseInventory(data) {
  const local = loadLocalInventory();
  if (local.length) return local;
  return data.inventoryRows || [];
}

function daysBetween(a, b) {
  return Math.ceil((new Date(b) - new Date(a)) / 86400000);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days || 0));
  return d;
}

function goatPlan(g) {
  const buyWeight = Number(g.buyWeight || 0);
  const targetWeight = Number(g.targetWeight || buyWeight);
  const gain = Number(g.gain || 0.25);
  const feed = Number(g.feed || 0.35);
  const buyPrice = Number(g.buyPrice || 0);
  const salePrice = Number(g.salePrice || 0);

  const poundsNeeded = Math.max(0, targetWeight - buyWeight);
  const holdDays = gain > 0 ? Math.ceil(poundsNeeded / gain) : 0;
  const targetDate = addDays(g.buyDate || new Date(), holdDays);
  const feedCost = holdDays * feed;
  const profit = salePrice - buyPrice - feedCost;
  const daysLeft = daysBetween(new Date(), targetDate);

  let status = 'HOLD';
  if (daysLeft <= 0) status = 'SELL NOW';
  else if (daysLeft <= 14) status = 'SELL SOON';

  return { holdDays, targetDate, feedCost, profit, daysLeft, status };
}

function totalProjectedProfit(items) {
  return items.reduce((sum, g) => sum + goatPlan(g).profit, 0);
}

function openModal(title, body) {
  $('modalRoot').innerHTML = `
    <div class="modalShade" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modalHeader">
          <div>
            <h2>${title}</h2>
          </div>
          <button class="closeBtn" onclick="closeModal()">Close</button>
        </div>
        ${body}
      </div>
    </div>
  `;
}

function closeModal(e) {
  if (e && e.target.className !== 'modalShade') return;
  $('modalRoot').innerHTML = '';
}

window.closeModal = closeModal;

function kpi(title, value, sub, action) {
  return `
    <div class="card clickCard" onclick="${action || ''}">
      <div class="label">${title}</div>
      <div class="big">${value}</div>
      <div class="sub">${sub || ''}</div>
    </div>
  `;
}

function marketCard(m) {
  const feeder = m.feeder || {};
  const slaughter = m.slaughter || {};
  const spread = m.spread ?? null;

  return `
    <div class="marketCard clickCard" onclick="showMarket('${m.id}')">
      <div class="marketName">${m.name || 'Market'}</div>
      <div class="marketMeta">${m.state || '--'} · Report ${m.id || '--'} · ${m.role || ''}</div>
      <div class="row"><span>Status</span><strong class="${m.ok ? 'good' : 'warnText'}">${m.ok ? 'Live' : 'Watch'}</strong></div>
      <div class="row"><span>Feeder</span><strong>${feeder.perHead ? money(feeder.perHead) : '--'}</strong></div>
      <div class="row"><span>Slaughter</span><strong>${slaughter.perHead ? money(slaughter.perHead) : '--'}</strong></div>
      <div class="row"><span>Spread</span><strong class="${spread > 45 ? 'good' : 'warnText'}">${spread === null ? '--' : money(spread)}</strong></div>
    </div>
  `;
}

function inventoryRows(items) {
  if (!items.length) {
    return `<tr><td colspan="8" class="helpText">No goats entered yet.</td></tr>`;
  }

  return items.map((g, i) => {
    const p = goatPlan(g);
    const cls = p.status === 'SELL NOW' ? 'badText' : p.status === 'SELL SOON' ? 'warnText' : 'good';

    return `
      <tr>
        <td>${g.tag || 'Batch'}</td>
        <td>${g.market || '--'}</td>
        <td>${g.buyWeight || '--'} lb</td>
        <td>${money(g.buyPrice)}</td>
        <td>${g.targetWeight || '--'} lb</td>
        <td>${p.targetDate.toLocaleDateString()}</td>
        <td class="${cls}">${p.status}</td>
        <td>${money(p.profit)}</td>
        <td><button class="btn secondary" onclick="removeGoat(${i})">Remove</button></td>
      </tr>
    `;
  }).join('');
}

function render(data) {
  window.goatData = data;

  const items = baseInventory(data);
  const capacity = data.inventory?.capacity || 40;
  const head = items.length || data.inventory?.head || 0;
  const openSlots = Math.max(0, capacity - head);
  const projectedProfit = totalProjectedProfit(items) || data.inventory?.projectedProfit || 0;
  const markets = data.markets || [];
  const decision = data.decision || {};

  $('app').className = 'shell';
  $('app').innerHTML = `
    <section class="topbar">
      <div class="brand">
        <h1>Rustic Root Farms Goat Bot</h1>
        <p>Goat trading dashboard for inventory, market spreads, and sale timing.</p>
      </div>

      <div class="statusPill ${data.ok ? '' : 'watch'}">
        ${data.ok ? 'USDA LIVE' : 'WATCH MODE'} · API ${data.status || '--'}
      </div>
    </section>

    <section class="grid kpiGrid">
      ${kpi('Farm Status', decision.headline || 'Hold and collect', decision.summary || 'Monitoring goat inventory and market spread.', 'showDecision()')}
      ${kpi('Inventory', head + '/' + capacity, openSlots + ' spaces open', 'showInventory()')}
      ${kpi('Projected Profit', money(projectedProfit), 'Modeled from current goat plans', 'showInventory()')}
      ${kpi('Best Market', decision.bestMarket || 'Salem baseline', 'Click for market board', 'showMarkets()')}
    </section>

    <section class="grid mainGrid">
      <div class="card">
        <div class="cardTitle">
          <h2>Regional Market Board</h2>
          <span class="badge">Click market</span>
        </div>
        <div class="marketGrid">
          ${markets.map(marketCard).join('') || '<p class="helpText">No market data yet.</p>'}
        </div>
      </div>

      <div class="card clickCard" onclick="showDecision()">
        <div class="cardTitle">
          <h2>Today’s Decision</h2>
          <span class="badge warn">No overbuying</span>
        </div>
        <div class="decision">${decision.headline || 'WATCH'}</div>
        <p class="helpText">${decision.summary || 'Goat Bot is collecting market and inventory data before issuing a buy signal.'}</p>
        <div class="row"><span>Last Refresh</span><strong>${dateText(data.time)}</strong></div>
        <div class="row"><span>Data Mode</span><strong>${data.mode || 'Live / demo mix'}</strong></div>
      </div>
    </section>

    <section class="grid threeGrid">
      <div class="card clickCard" onclick="showInventory()">
        <div class="cardTitle">
          <h3>Active Goat Plans</h3>
          <span class="badge">${head} head</span>
        </div>
        <div class="miniList">
          ${items.slice(0, 5).map(g => {
            const p = goatPlan(g);
            return `<div class="miniItem"><strong>${g.tag}</strong> · ${p.status}<br><span class="helpText">Target ${g.targetWeight} lb · ${money(p.profit)} projected</span></div>`;
          }).join('')}
        </div>
        <div class="actions">
          <button class="btn" onclick="event.stopPropagation(); showAddGoat()">Add Goat / Batch</button>
        </div>
      </div>

      <div class="card clickCard" onclick="showMarketRows()">
        <div class="cardTitle">
          <h3>Parsed Auction Rows</h3>
          <span class="badge">${(data.marketRows || []).length} rows</span>
        </div>
        <p class="helpText">This is where the real USDA rows appear after the parser runs.</p>
        <div class="row"><span>Live Source</span><strong>Salem first</strong></div>
        <div class="row"><span>Next</span><strong>OK/TX parser</strong></div>
      </div>

      <div class="card clickCard" onclick="showWatchlist()">
        <div class="cardTitle">
          <h3>Watchlist</h3>
          <span class="badge warn">${(data.watchlist || []).length}</span>
        </div>
        <p class="helpText">Louisiana stays watch-only until we verify reliable USDA goat rows.</p>
      </div>
    </section>
  `;
}

function showDecision() {
  const d = window.goatData || {};
  const decision = d.decision || {};
  openModal('Rustic Root Farms Decision', `
    <p class="helpText">${decision.summary || 'No decision summary yet.'}</p>
    <div class="row"><span>Headline</span><strong>${decision.headline || 'WATCH'}</strong></div>
    <div class="row"><span>Best Market</span><strong>${decision.bestMarket || '--'}</strong></div>
    <div class="row"><span>Mode</span><strong>${d.mode || '--'}</strong></div>
  `);
}

function showMarkets() {
  const d = window.goatData || {};
  openModal('Regional Market Board', `
    <div class="marketGrid">
      ${(d.markets || []).map(marketCard).join('')}
    </div>
  `);
}

function showMarket(id) {
  const d = window.goatData || {};
  const m = (d.markets || []).find(x => String(x.id) === String(id)) || {};
  openModal(m.name || 'Market', `
    <div class="row"><span>State</span><strong>${m.state || '--'}</strong></div>
    <div class="row"><span>Report ID</span><strong>${m.id || '--'}</strong></div>
    <div class="row"><span>Status</span><strong>${m.status || '--'}</strong></div>
    <div class="row"><span>Rows Parsed</span><strong>${m.rows || '--'}</strong></div>
    <div class="row"><span>Feeder Avg</span><strong>${m.feeder?.perHead ? money(m.feeder.perHead) : '--'}</strong></div>
    <div class="row"><span>Slaughter Avg</span><strong>${m.slaughter?.perHead ? money(m.slaughter.perHead) : '--'}</strong></div>
    <div class="row"><span>Spread</span><strong>${m.spread === null || m.spread === undefined ? '--' : money(m.spread)}</strong></div>
    <p class="helpText">${m.signal || 'No signal yet.'}</p>
  `);
}

function showInventory() {
  const d = window.goatData || {};
  const items = baseInventory(d);

  openModal('Goat Inventory Plans', `
    <div class="actions">
      <button class="btn" onclick="showAddGoat()">Add Goat / Batch</button>
      <button class="btn secondary" onclick="exportInventory()">Export</button>
      <button class="btn danger" onclick="clearInventory()">Clear Local</button>
    </div>
    <div class="tableWrap" style="margin-top:12px;">
      <table>
        <thead>
          <tr>
            <th>Tag</th><th>Market</th><th>Buy Wt</th><th>Buy Price</th><th>Target</th><th>Target Date</th><th>Status</th><th>Profit</th><th></th>
          </tr>
        </thead>
        <tbody>${inventoryRows(items)}</tbody>
      </table>
    </div>
  `);
}

function showAddGoat() {
  openModal('Quick Add Goat / Batch', `
    <form id="addGoatForm" class="formGrid">
      <div class="field"><label>Tag / Batch</label><input name="tag" required placeholder="RR-14"></div>
      <div class="field"><label>Buy Date</label><input name="buyDate" type="date" required></div>
      <div class="field"><label>Buy Market</label><input name="market" value="Salem, AR"></div>
      <div class="field"><label>Buy Weight</label><input name="buyWeight" type="number" step="0.1" required></div>
      <div class="field"><label>Buy Price</label><input name="buyPrice" type="number" step="0.01" required></div>
      <div class="field"><label>Target Weight</label><input name="targetWeight" type="number" step="0.1" value="65"></div>
      <div class="field"><label>Est Sale Price</label><input name="salePrice" type="number" step="0.01"></div>
      <div class="field"><label>Gain / Day</label><input name="gain" type="number" step="0.01" value="0.25"></div>
      <div class="field"><label>Feed / Day</label><input name="feed" type="number" step="0.01" value="0.35"></div>
      <button class="btn" type="submit">Save Plan</button>
    </form>
  `);

  $('addGoatForm').addEventListener('submit', e => {
    e.preventDefault();
    const item = Object.fromEntries(new FormData(e.target).entries());
    const d = window.goatData || {};
    const current = baseInventory(d).slice();
    const capacity = d.inventory?.capacity || 40;

    if (current.length >= capacity) {
      alert('Capacity reached. Goat Bot will not plan over ' + capacity + ' goats.');
      return;
    }

    current.push(item);
    saveLocalInventory(current);
    closeModal();
    render(d);
  });
}

function showMarketRows() {
  const d = window.goatData || {};
  const rows = d.marketRows || [];

  openModal('Parsed USDA Auction Rows', `
    <div class="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Market</th><th>Category</th><th>Description</th><th>Head</th><th>Avg Wt</th><th>Avg CWT</th><th>$/Head</th>
          </tr>
        </thead>
        <tbody>
          ${rows.length ? rows.slice(0, 50).map(r => `
            <tr>
              <td>${r.market}</td>
              <td>${r.category}</td>
              <td>${r.description || ''}</td>
              <td>${r.head || '--'}</td>
              <td>${r.avgWeight || '--'}</td>
              <td>${r.avgCwt ? money(r.avgCwt) : '--'}</td>
              <td>${r.estimatedPerHead ? money(r.estimatedPerHead) : '--'}</td>
            </tr>
          `).join('') : '<tr><td colspan="7" class="helpText">No parsed rows yet. Run the parser workflow next.</td></tr>'}
        </tbody>
      </table>
    </div>
  `);
}

function showWatchlist() {
  const d = window.goatData || {};
  const watch = d.watchlist || [];
  openModal('Market Watchlist', `
    <div class="miniList">
      ${watch.map(w => `<div class="miniItem"><strong>${w.state || '--'} · ${w.name || 'Market'}</strong><br><span class="helpText">${w.status || ''}</span></div>`).join('')}
    </div>
  `);
}

function removeGoat(index) {
  const d = window.goatData || {};
  const current = baseInventory(d).slice();
  current.splice(index, 1);
  saveLocalInventory(current);
  render(d);
  showInventory();
}

function clearInventory() {
  if (!confirm('Clear local inventory?')) return;
  saveLocalInventory([]);
  closeModal();
  render(window.goatData || {});
}

function exportInventory() {
  const blob = new Blob([JSON.stringify(baseInventory(window.goatData || {}), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rustic-root-goat-inventory.json';
  a.click();
  URL.revokeObjectURL(url);
}

window.showDecision = showDecision;
window.showMarkets = showMarkets;
window.showMarket = showMarket;
window.showInventory = showInventory;
window.showAddGoat = showAddGoat;
window.showMarketRows = showMarketRows;
window.showWatchlist = showWatchlist;
window.removeGoat = removeGoat;
window.clearInventory = clearInventory;
window.exportInventory = exportInventory;

fetch(DATA_URL)
  .then(r => r.json())
  .then(render)
  .catch(err => {
    $('app').innerHTML = `
      <div class="shell">
        <div class="card">
          <h1>Goat Bot Error</h1>
          <p class="badText">${err.message}</p>
        </div>
      </div>
    `;
  });
