fetch('data/goat-bot.json?v=' + Date.now())
  .then(r => r.json())
  .then(d => {
    const inv = d.inventory || {};
    const markets = d.markets || [];
    const watch = d.watchlist || [];

    app.className = 'shell';
    app.innerHTML = `
      <h1>Goat Bot</h1>
      <p class="good">USDA regional market command center</p>

      <div class="card">
        <h3>Bot Status</h3>
        <div class="big">${d.ok ? 'LIVE' : 'WATCH'}</div>
        <p>API Status: ${d.status || '--'}<br>
        Bytes Pulled: ${d.bytes || '--'}<br>
        Last Refresh: ${d.time || '--'}</p>
      </div>

      <div class="grid">
        <div class="card">
          <h3>Markets Online</h3>
          <div class="big">${markets.length}</div>
        </div>

        <div class="card">
          <h3>Inventory</h3>
          <div class="big">${inv.head || 0}/${inv.capacity || 40}</div>
        </div>

        <div class="card">
          <h3>Watchlist</h3>
          <div class="big">${watch.length}</div>
        </div>
      </div>

      <div class="card">
        <h3>Next Build</h3>
        <p>Regional market comparison, trend history, goat inventory plans, sale countdowns, and projected profit.</p>
      </div>
    `;
  });
