/**
 * Goat Bot Market History Loader
 *
 * Loaded after app.js. This keeps the working Goat Bot page intact, then hydrates
 * USDA market history from the Google Sheet export when it is available.
 */
(function () {
  const STORE_KEY = 'rrfGoatOpsV2';

  function readLocalDb() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    } catch (err) {
      return null;
    }
  }

  function writeLocalDb(db) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(db));
    } catch (err) {
      console.warn('Goat Bot market history local write failed:', err);
    }
  }

  function sheetTables(snapshot) {
    if (!snapshot) return {};
    if (snapshot.tables && typeof snapshot.tables === 'object') return snapshot.tables;
    return snapshot;
  }

  function mergeSheetMarketTables(db, snapshot) {
    const tables = sheetTables(snapshot);
    if (!db) db = {};

    const names = [
      'usda_price_history',
      'usda_raw_reports',
      'usda_report_watchlist',
      'dashboard_aggregates',
      'api_update_log',
      'market_forecasts'
    ];

    names.forEach(function (name) {
      if (Array.isArray(tables[name])) db[name] = tables[name];
    });

    db.sheetHydratedAt = new Date().toISOString();
    return db;
  }

  function injectMarketStatus(db) {
    try {
      if ((location.hash || '#dashboard') !== '#market') return;
      const main = document.querySelector('main');
      if (!main || document.getElementById('marketHistoryStatus')) return;

      const rows = Array.isArray(db && db.usda_price_history) ? db.usda_price_history : [];
      const latest = rows.reduce(function (best, row) {
        const date = row.report_date || row.created_at || '';
        return String(date) > String(best) ? String(date) : best;
      }, '');

      const source = rows.length ? 'USDA price history from Google Sheet' : 'Fallback static market assumptions';
      const detail = rows.length
        ? rows.length + ' USDA price rows loaded' + (latest ? ' • latest: ' + latest : '')
        : 'No rows found in usda_price_history yet. The page is showing the original built-in market numbers.';

      const div = document.createElement('section');
      div.id = 'marketHistoryStatus';
      div.className = 'card';
      div.innerHTML = '<div class="cardTitle"><h2>Market data source</h2><span class="badge">' + source + '</span></div><p class="muted">' + detail + '</p>';
      main.insertBefore(div, main.firstChild);
    } catch (err) {
      console.warn('Goat Bot market status insert failed:', err);
    }
  }

  function installLoadWrapper() {
    if (window.__goatBotMarketHistoryLoaderInstalled) return true;
    if (typeof window.load !== 'function') return false;
    if (typeof window.goatBotApplyMarketHistory !== 'function') return false;

    const originalLoad = window.load;

    window.load = function () {
      const db = originalLoad.apply(this, arguments);
      const applied = window.goatBotApplyMarketHistory(db);
      setTimeout(function () { injectMarketStatus(applied); }, 0);
      return applied;
    };

    window.__goatBotMarketHistoryLoaderInstalled = true;
    return true;
  }

  async function hydrateFromSheet() {
    if (window.__goatBotMarketHistoryHydrated) return;
    if (typeof window.goatBotFetchSheetSnapshot !== 'function') return;
    if (typeof window.goatBotApplyMarketHistory !== 'function') return;

    window.__goatBotMarketHistoryHydrated = true;

    try {
      const snapshot = await window.goatBotFetchSheetSnapshot();
      let db = readLocalDb();

      if (!db && typeof window.load === 'function') {
        db = window.load();
      }

      db = mergeSheetMarketTables(db || {}, snapshot);
      db = window.goatBotApplyMarketHistory(db);
      writeLocalDb(db);

      if (typeof window.render === 'function') {
        window.render();
      }
      injectMarketStatus(db);
    } catch (err) {
      console.warn('Goat Bot market history sheet hydration failed:', err);
      const db = readLocalDb();
      injectMarketStatus(db || {});
    }
  }

  function boot() {
    const ok = installLoadWrapper();
    if (ok) hydrateFromSheet();
    return ok;
  }

  let tries = 0;
  const timer = setInterval(function () {
    tries += 1;
    if (boot() || tries > 50) {
      clearInterval(timer);
    }
  }, 100);

  window.addEventListener('hashchange', function () {
    setTimeout(function () {
      const db = readLocalDb();
      injectMarketStatus(db || {});
    }, 50);
  });
})();
