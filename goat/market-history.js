/**
 * Goat Bot Market History Bridge
 *
 * Purpose:
 * - Read usda_price_history rows from the Sheet snapshot.
 * - Convert those rows into the existing db.markets shape used by Goat Bot.
 * - Preserve the hard-coded demo/fallback market values when no USDA history exists.
 *
 * This file is intentionally additive. It does not replace app.js.
 */
(function () {
  const SOURCE_KEY = 'usda_price_history';

  const REPORT_MARKET_ALIAS = {
    salem_ar: 'salem',
    beebe_ar: 'beebe',
    san_angelo_tx: 'sanangelo',
    pawnee_ok: 'pawnee',
    mo_weekly_sheep_goat_summary: 'mo_weekly',
    buffalo_mo_sheep_goat: 'buffalo_mo',
    semo_jackson_mo_sheep_goat: 'semo_mo',
    montgomery_city_mo_sheep_goat: 'montgomery_mo',
    producers_norwood_mo_sheep_goat: 'producers_mo',
    ts_white_diamond_mo_sheep_goat: 'ts_white_mo'
  };

  function toNumber(value) {
    if (value === null || value === undefined || value === '') return 0;
    const n = Number(String(value).replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  function cleanText(value) {
    return String(value || '').trim();
  }

  function parseDateValue(value) {
    if (!value) return 0;
    const t = new Date(value).getTime();
    return Number.isFinite(t) ? t : 0;
  }

  function getWeightBand(row) {
    const min = toNumber(row.weight_min);
    const max = toNumber(row.weight_max);
    const avg = toNumber(row.avg_weight) || ((min && max) ? (min + max) / 2 : 0);

    if (avg && avg < 50) return 0;
    if (avg && avg < 65) return 1;
    return 2;
  }

  function getQualityBucket(row) {
    const joined = [row.quality, row.class, row.sex_type, row.notes].map(cleanText).join(' ').toLowerCase();

    if (joined.indexOf('#1') !== -1 || joined.indexOf('selection 1') !== -1 || joined.indexOf('sel 1') !== -1 || joined.indexOf('choice') !== -1) {
      return 'q1';
    }

    if (joined.indexOf('#2') !== -1 || joined.indexOf('selection 2') !== -1 || joined.indexOf('sel 2') !== -1 || joined.indexOf('medium') !== -1) {
      return 'q2';
    }

    return 'q2';
  }

  function priceValue(row) {
    return toNumber(row.price_avg_cwt) || ((toNumber(row.price_low_cwt) && toNumber(row.price_high_cwt)) ? (toNumber(row.price_low_cwt) + toNumber(row.price_high_cwt)) / 2 : 0);
  }

  function rowsFromDb(db) {
    if (!db) return [];

    if (Array.isArray(db.usda_price_history)) return db.usda_price_history;
    if (Array.isArray(db.usdaPriceHistory)) return db.usdaPriceHistory;

    if (db.tables && Array.isArray(db.tables[SOURCE_KEY])) return db.tables[SOURCE_KEY];
    if (db.tables && Array.isArray(db.tables.usdaPriceHistory)) return db.tables.usdaPriceHistory;

    return [];
  }

  function cloneFallbackMarkets(db) {
    return (db && Array.isArray(db.markets) ? db.markets : []).map(function (m) {
      return {
        id: m.id,
        name: m.name,
        miles: toNumber(m.miles),
        q2: Array.isArray(m.q2) ? m.q2.slice() : [0, 0, 0],
        q1: Array.isArray(m.q1) ? m.q1.slice() : [0, 0, 0],
        note: m.note || '',
        source: m.source || 'fallback_static'
      };
    });
  }

  function latestRowsByMarketBandQuality(rows) {
    const grouped = {};

    rows.forEach(function (row) {
      const price = priceValue(row);
      if (!price) return;

      const marketIdRaw = cleanText(row.market_id);
      if (!marketIdRaw) return;

      const marketId = REPORT_MARKET_ALIAS[marketIdRaw] || marketIdRaw;
      const band = getWeightBand(row);
      const quality = getQualityBucket(row);
      const key = marketId + '|' + quality + '|' + band;
      const rowTime = parseDateValue(row.report_date) || parseDateValue(row.created_at);

      if (!grouped[key] || rowTime >= grouped[key].time) {
        grouped[key] = { row: row, time: rowTime, price: price, marketId: marketId, quality: quality, band: band };
      }
    });

    return grouped;
  }

  function buildMarketHistorySummary(db) {
    const rows = rowsFromDb(db);
    const byMarket = {};

    rows.forEach(function (row) {
      const price = priceValue(row);
      if (!price) return;

      const rawId = cleanText(row.market_id);
      if (!rawId) return;

      const id = REPORT_MARKET_ALIAS[rawId] || rawId;
      if (!byMarket[id]) {
        byMarket[id] = {
          market_id: id,
          market_name: cleanText(row.market_name),
          state: cleanText(row.state),
          count: 0,
          latest_report_date: '',
          latest_created_at: '',
          latest_price_avg_cwt: 0
        };
      }

      byMarket[id].count += 1;

      const dateText = cleanText(row.report_date) || cleanText(row.created_at);
      const rowTime = parseDateValue(dateText);
      const currentTime = parseDateValue(byMarket[id].latest_report_date || byMarket[id].latest_created_at);

      if (rowTime >= currentTime) {
        byMarket[id].latest_report_date = cleanText(row.report_date);
        byMarket[id].latest_created_at = cleanText(row.created_at);
        byMarket[id].latest_price_avg_cwt = price;
      }
    });

    return Object.values(byMarket).sort(function (a, b) {
      return cleanText(a.market_name).localeCompare(cleanText(b.market_name));
    });
  }

  function marketsFromHistory(db) {
    const fallback = cloneFallbackMarkets(db);
    const rows = rowsFromDb(db);

    if (!rows.length) {
      return fallback;
    }

    const latest = latestRowsByMarketBandQuality(rows);
    const marketMap = {};

    fallback.forEach(function (m) {
      marketMap[m.id] = m;
    });

    rows.forEach(function (row) {
      const rawId = cleanText(row.market_id);
      if (!rawId) return;

      const id = REPORT_MARKET_ALIAS[rawId] || rawId;
      if (!marketMap[id]) {
        marketMap[id] = {
          id: id,
          name: cleanText(row.market_name) || id,
          miles: 0,
          q2: [0, 0, 0],
          q1: [0, 0, 0],
          note: 'USDA history market',
          source: 'usda_price_history'
        };
      }
    });

    Object.keys(latest).forEach(function (key) {
      const item = latest[key];
      const market = marketMap[item.marketId];
      if (!market) return;
      market[item.quality][item.band] = item.price;
      market.source = 'usda_price_history';
      market.latestReportDate = cleanText(item.row.report_date);
      market.note = 'USDA history updated ' + (cleanText(item.row.report_date) || cleanText(item.row.created_at) || 'recently');
    });

    return Object.values(marketMap);
  }

  function applyMarketHistory(db) {
    if (!db) return db;

    const historyRows = rowsFromDb(db);
    db.marketHistory = buildMarketHistorySummary(db);

    if (historyRows.length) {
      db.markets = marketsFromHistory(db);
      db.marketDataSource = 'usda_price_history';
    } else {
      db.marketDataSource = db.marketDataSource || 'fallback_static';
    }

    return db;
  }

  window.goatBotApplyMarketHistory = applyMarketHistory;
  window.goatBotBuildMarketHistorySummary = buildMarketHistorySummary;
})();
