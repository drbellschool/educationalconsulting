const DATA_URL = 'data/goat-bot.json?v=' + Date.now();
const STORE_KEY = 'goatBotInventoryV1';

function money(n) {
  n = Number(n || 0);
  return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmt(n) {
  n = Number(n || 0);
  return n.toLocaleString();
}

function dateText(v) {
  if (!v) return '--';
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  return d.toLocaleString();
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days || 0));
  return d;
}

function daysBetween(a, b) {
  const one = new Date(a);
  const two = new Date(b);
  return Math.ceil((two - one) / 86400000);
}

function loadInventory() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveInventory(items) {
  localStorage.setItem(STORE_KEY, JSON.stringify(items));
}

function goatPlan(g) {
  const buyWeight = Number(g.buyWeight || 0);
  const targetWeight = Number(g.targetWeight || buyWeight);
  const gain = Number(g.gain || .25);
  const feed = Number(g.feed || .35);
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

function card(title, value, small) {
  return `
    <div class="kpi">
      <div class="label">${title}</div>
      <div class="big">${value}</div>
      <div class="note">${small || ''}</div>
    </div>
  `;
}

function marketCard(m) {
  return `
    <div class="market">
      <div class="marketName">${m.name || 'Market'}</div>
      <div class="marketMeta">${m.state || '--'} · Report ${m.id || '--'} · ${m.role || 'Market'}</div>
      <div class="metricRow"><span>USDA Status</span><strong>${m.status || '--'}</strong></div>
      <div class="metricRow"><span>Connection</span><strong class="${m.ok ? 'good' : 'badText'}">${m.ok ? 'LIVE' : 'WATCH'}</strong></div>
      <div class="metricRow"><span>Data Pulled</span><strong>${fmt(m.bytes)} bytes</strong></div>
      <div class="metricRow"><span>Signal</span><strong class="warnText">Collecting</strong></div>
    </div>
  `;
}

function renderInventoryRows(items) {
  if (!items.length) {
    return `<tr><td colspan="9" class="note">No goats entered yet. Add your first purchase below.</td></tr>`;
  }

  return items.map((g, i) => {
    const p = goatPlan(g);
    const cls = p.status === 'SELL NOW' ? 'badText' : p.status === 'SELL SOON' ? 'warnText' : 'good';
    return `
      <tr>
        <td>${g.tag}</td>
        <td>${g.buyDate}</td>
        <td>${g.market}</td>
        <td>${g.buyWeight} lb</td>
        <td>${money(g.buyPrice)}</td>
        <td>${g.targetWeight} lb</td>
        <td>${p.targetDate.toLocaleDateString()}</td>
        <td class="${cls}">${p.status}</td>
        <td>${money(p.profit)}</td>
        <td><button class="btn secondary" onclick="removeGoat(${i})">Remove</button></td>
      </tr>
    `;
  }).join('');
}

function render(data) {
  const app = document.getElementById('app');
  const inventory = loadInventory();
  const capacity = data.inventory?.capacity || 40;
  const markets = data.markets || [];
  const watch = data.watchlist || [];
  const head = inventory.length;
  const remaining = Math.max(0, capacity - head);

  app.className = 'shell';
  app.innerHTML = `
    <section class="hero">
      <div>
        <h1>Goat Bot Market Strategy</h1>
        <p class="subtitle">Regional USDA market dashboard, goat inventory planner, and profit forecast.</p>
      </div>

      <div class="statusBox">
        <span class="badge ${data.ok ? '' : 'warn'}">${data.ok ? 'USDA LIVE' : 'WATCH MODE'}</span>
        <div class="statusGrid">
          <div><div class="tinyLabel">API</div><div class="tinyValue">${data.status || '--'}</div></div>
          <div><div class="tinyLabel">Last Refresh</div><div class="tinyValue">${dateText(data.time)}</div></div>
          <div><div class="tinyLabel">Bytes</div><div class="tinyValue">${fmt(data.bytes)}</div></div>
          <div><div class="tinyLabel">Markets</div><div class="tinyValue">${markets.length}</div></div>
        </div>
      </div>
    </section>

    <section class="layout">
      <aside class="sidebar">
        <h3>Strategy Filters</h3>

        <div class="field">
          <label>Starting Capital</label>
          <input value="$500" readonly>
        </div>

        <div class="field">
          <label>Property Capacity</label>
          <input value="${head}/${capacity} goats" readonly>
        </div>

        <div class="field">
          <label>Preferred Local Market</label>
          <select>
            <option>Salem, AR</option>
            <option>Pawnee, OK</option>
            <option>San Angelo, TX Benchmark</option>
          </select>
        </div>

        <div class="field">
          <label>Decision Mode</label>
          <select>
            <option>Conservative</option>
            <option>Growth</option>
            <option>Do Not Overbuy</option>
          </select>
        </div>

        <p class="note">Only official USDA data should drive buy/sell signals. Tiny lots and unreliable reports should stay in watch mode.</p>
      </aside>

      <div>
        <div class="kpis">
          ${card('Bot Signal', 'WATCH', 'Parser is collecting market data before issuing buy signals.')}
          ${card('Inventory', head + '/' + capacity, remaining + ' spaces open')}
          ${card('Live Markets', markets.length, 'Reliable reports only')}
          ${card('Data Pull', fmt(data.bytes), 'Latest USDA response size')}
        </div>

        <section class="grid2">
          <div class="card">
            <h2>Regional Market Board</h2>
            <div class="marketGrid">
              ${markets.map(marketCard).join('')}
            </div>
          </div>

          <div class="card">
            <h2>Current Recommendation</h2>
            <div class="decision">WATCH</div>
            <p class="note">The pipe is live. Next build parses feeder and slaughter goat rows, compares markets, and calculates max bid.</p>
          </div>
        </section>

        <section class="card">
          <h2>Inventory Manager</h2>
          <div class="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Tag</th><th>Buy Date</th><th>Market</th><th>Buy Wt</th><th>Buy Price</th><th>Target Wt</th><th>Target Date</th><th>Status</th><th>Projected Profit</th><th></th>
                </tr>
              </thead>
              <tbody>${renderInventoryRows(inventory)}</tbody>
            </table>
          </div>

          <h3 style="margin-top:18px;">Add Goat / Batch</h3>
          <form id="goatForm" class="formGrid">
            <input name="tag" placeholder="Tag or Batch ID" required>
            <input name="buyDate" type="date" required>
            <input name="market" placeholder="Buy Market" value="Salem, AR">
            <input name="buyWeight" type="number" step="0.1" placeholder="Buy lb" required>
            <input name="buyPrice" type="number" step="0.01" placeholder="Buy $/head" required>
            <input name="targetWeight" type="number" step="0.1" placeholder="Target lb" value="65">
            <input name="gain" type="number" step="0.01" placeholder="Gain/day" value="0.25">
            <input name="feed" type="number" step="0.01" placeholder="Feed $/day" value="0.35">
            <input name="salePrice" type="number" step="0.01" placeholder="Est sale $/head">
            <select name="sellMarket">
              <option>Salem, AR</option>
              <option>Pawnee, OK</option>
              <option>San Angelo, TX</option>
            </select>
            <button class="btn" type="submit">Add Plan</button>
          </form>

          <div class="actions">
            <button class="btn secondary" onclick="clearInventory()">Clear Inventory</button>
            <button class="btn secondary" onclick="exportInventory()">Export JSON</button>
          </div>
        </section>

        <section class="grid2" style="margin-top:18px;">
          <div class="card">
            <h2>Sales Trend</h2>
            <div class="canvasBox">Trend chart begins after market rows are parsed and stored over time.</div>
          </div>

          <div class="card">
            <h2>Watchlist</h2>
            ${watch.length ? watch.map(w => `
              <div class="watchItem">
                <strong>${w.state || '--'} · ${w.name || 'Market'}</strong>
                <div class="note">${w.status || 'Watching for reliable USDA goat data.'}</div>
              </div>
            `).join('') : '<p class="note">No watchlist markets yet.</p>'}
          </div>
        </section>
      </div>
    </section>
  `;

  document.getElementById('goatForm').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const item = Object.fromEntries(fd.entries());
    const current = loadInventory();

    if (current.length >= capacity) {
      alert('Capacity reached. Goat Bot will not plan over ' + capacity + ' goats.');
      return;
    }

    current.push(item);
    saveInventory(current);
    render(data);
  });
}

window.removeGoat = function(index) {
  const items = loadInventory();
  items.splice(index, 1);
  saveInventory(items);
  location.reload();
};

window.clearInventory = function() {
  if (!confirm('Clear inventory?')) return;
  saveInventory([]);
  location.reload();
};

window.exportInventory = function() {
  const blob = new Blob([JSON.stringify(loadInventory(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'goat-inventory.json';
  a.click();
  URL.revokeObjectURL(url);
};

fetch(DATA_URL)
  .then(r => r.json())
  .then(render)
  .catch(err => {
    document.getElementById('app').innerHTML = `<div class="shell"><h1>Goat Bot</h1><p class="badText">Could not load data: ${err.message}</p></div>`;
  });
