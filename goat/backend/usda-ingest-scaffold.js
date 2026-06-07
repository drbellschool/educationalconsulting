/**
 * Goat Bot USDA ingestion scaffold.
 *
 * This file is not wired to the static dashboard yet. It documents the backend
 * job that should run in Apps Script, Cloudflare Worker, Node, or GitHub Actions.
 *
 * Required environment variables:
 * - USDA_API_KEY
 *
 * Flow:
 * 1. Fetch USDA MyMarketNews reports.
 * 2. Normalize rows into usda_price_history.
 * 3. Calculate #2 baseline, #1 upside spread, volatility, and buy/sell signals.
 * 4. Export goat/data/goat-bot.json for the static dashboard.
 */

const TRACKED_REPORTS = [
  { slug: '3659', market: 'Salem Stockyards', state: 'AR' },
  { slug: '2014', market: 'San Angelo Producers', state: 'TX' },
  { slug: '1826', market: 'Pawnee Sale Barn', state: 'OK' }
];

function cwtToPerLb(cwt) {
  return Number(cwt || 0) / 100;
}

function perHeadValue(weight, cwt) {
  return Number(weight || 0) * cwtToPerLb(cwt);
}

function normalizeGoatMarketRow(raw, report) {
  return {
    market_id: report.slug,
    market_name: report.market,
    report_date: raw.report_date || raw.reportDate || null,
    source: 'USDA MyMarketNews',
    class: raw.class || raw.category || '',
    quality: raw.quality || '',
    sex_type: raw.sex_type || raw.sexType || '',
    weight_min: raw.weight_min || raw.weightMin || null,
    weight_max: raw.weight_max || raw.weightMax || null,
    avg_weight: raw.avg_weight || raw.avgWeight || null,
    price_low_cwt: raw.price_low_cwt || raw.low || null,
    price_high_cwt: raw.price_high_cwt || raw.high || null,
    price_avg_cwt: raw.price_avg_cwt || raw.avg || raw.midCwt || null,
    head_count: raw.head_count || raw.headCount || null,
    confidence: 'api',
    created_at: new Date().toISOString()
  };
}

function projectFloorProfit({ purchasePrice, currentWeight, targetWeight, q2Cwt, holdingDays, dailyCost, saleCosts }) {
  const saleWeight = Math.max(Number(currentWeight || 0), Number(targetWeight || 0));
  const saleValue = perHeadValue(saleWeight, q2Cwt);
  const totalCost = Number(purchasePrice || 0) + Number(holdingDays || 0) * Number(dailyCost || 0) + Number(saleCosts || 0);
  return saleValue - totalCost;
}

module.exports = { TRACKED_REPORTS, cwtToPerLb, perHeadValue, normalizeGoatMarketRow, projectFloorProfit };
