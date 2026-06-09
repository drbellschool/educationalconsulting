// Missouri sheep/goat USDA market discovery and daily pull patch.
// Paste this file into the same Apps Script project as Code.gs.
// It discovers USDA Slug IDs from the USDA/MARS report catalog instead of guessing them.

const USDA_MISSOURI_SHEEP_GOAT_WATCHLIST = [
  {
    market_id: 'mo_weekly_sheep_goat_summary',
    market_name: 'Missouri Weekly Sheep and Goat Auction Summary',
    state: 'MO',
    frequency: 'weekly_fri',
    match_terms: ['missouri','weekly','sheep','goat','auction','summary']
  },
  {
    market_id: 'buffalo_mo_sheep_goat',
    market_name: 'Buffalo Livestock Market - Sheep/Goat Auction - Buffalo, MO',
    state: 'MO',
    frequency: 'monthly',
    match_terms: ['buffalo','livestock','sheep','goat','auction']
  },
  {
    market_id: 'semo_jackson_mo_sheep_goat',
    market_name: 'SEMO Livestock Sales - Sheep/Goat Auction - Jackson, MO',
    state: 'MO',
    frequency: 'monthly',
    match_terms: ['semo','livestock','sheep','goat','jackson']
  },
  {
    market_id: 'montgomery_city_mo_sheep_goat',
    market_name: 'Montgomery County Livestock Auction - Sheep/Goat Auction - Montgomery City, MO',
    state: 'MO',
    frequency: 'monthly',
    match_terms: ['montgomery','county','livestock','sheep','goat']
  },
  {
    market_id: 'producers_norwood_mo_sheep_goat',
    market_name: 'Producers Auction Yards - Sheep/Goat Auction - Norwood, MO',
    state: 'MO',
    frequency: 'monthly',
    match_terms: ['producers','auction','yards','sheep','goat','norwood']
  },
  {
    market_id: 'ts_white_diamond_mo_sheep_goat',
    market_name: 'TS White LLC - Sheep/Goat Auction - Diamond, MO',
    state: 'MO',
    frequency: 'monthly',
    match_terms: ['white','sheep','goat','diamond']
  }
];

function setupMissouriReportWatchlistSheet() {
  const ss = SpreadsheetApp.openById(GOAT_BOT_SPREADSHEET_ID);
  let sh = ss.getSheetByName('usda_report_watchlist');
  if (!sh) sh = ss.insertSheet('usda_report_watchlist');
  const headers = ['market_id','market_name','state','frequency','slug','status','matched_title','last_discovered_at','last_pulled_at','notes'];
  sh.getRange(1,1,1,headers.length).setValues([headers]);
  sh.setFrozenRows(1);
  sh.getRange(1,1,1,headers.length).setBackground('#12301f').setFontColor('#ffffff').setFontWeight('bold');
  return sh;
}

function discoverMissouriSheepGoatReports() {
  setupGoatBotSheets();
  const ss = SpreadsheetApp.openById(GOAT_BOT_SPREADSHEET_ID);
  const sh = setupMissouriReportWatchlistSheet();
  const catalog = fetchUsdaReportCatalog_();
  const flat = [];
  walkObjects_(catalog, flat);

  const rows = USDA_MISSOURI_SHEEP_GOAT_WATCHLIST.map(watch => {
    const match = findBestUsdaReportMatch_(flat, watch.match_terms);
    return [
      watch.market_id,
      watch.market_name,
      watch.state,
      watch.frequency,
      match.slug || '',
      match.slug ? 'discovered' : 'needs_manual_slug_review',
      match.title || '',
      new Date().toISOString(),
      '',
      match.slug ? 'Found from USDA report catalog.' : 'No catalog match found. Search terms may need adjustment or report title may differ.'
    ];
  });

  if (sh.getLastRow() > 1) sh.getRange(2,1,sh.getLastRow()-1,10).clearContent();
  sh.getRange(2,1,rows.length,10).setValues(rows);
  return { ok: true, discovered: rows.map(r => ({ market_id: r[0], slug: r[4], status: r[5], title: r[6] })) };
}

function fetchUsdaReportCatalog_() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('USDA_API_KEY');
  if (!apiKey) throw new Error('Missing USDA_API_KEY. Run setUsdaApiKey("YOUR_KEY") first.');
  const url = USDA_API_BASE + '/reports/';
  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    muteHttpExceptions: true,
    headers: { Authorization: 'Basic ' + Utilities.base64Encode(apiKey + ':') }
  });
  const code = response.getResponseCode();
  const text = response.getContentText();
  if (code < 200 || code >= 300) throw new Error('USDA report catalog failed: HTTP ' + code + ' ' + text.slice(0,300));
  return JSON.parse(text);
}

function findBestUsdaReportMatch_(objects, terms) {
  const normalizedTerms = terms.map(normalizeSearchText_).filter(Boolean);
  let best = null;
  let bestScore = -1;
  objects.forEach(o => {
    const hay = normalizeSearchText_(JSON.stringify(o));
    let score = 0;
    normalizedTerms.forEach(term => { if (hay.indexOf(term) !== -1) score++; });
    if (score > bestScore && score >= Math.max(3, normalizedTerms.length - 1)) {
      const slug = extractSlug_(o);
      const title = extractTitle_(o);
      best = { slug, title, score, raw: o };
      bestScore = score;
    }
  });
  return best || { slug: '', title: '', score: 0 };
}

function normalizeSearchText_(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
}

function extractSlug_(o) {
  const keys = ['slug','slug_id','slugId','Slug ID','slugID','report_slug','reportSlug','report_id','reportId','id'];
  for (const k of keys) if (o[k] !== undefined && String(o[k]).match(/^\d{3,5}$/)) return String(o[k]);
  const txt = JSON.stringify(o);
  const m = txt.match(/(?:slug|report)[^0-9]{0,20}(\d{3,5})/i) || txt.match(/\b(\d{3,5})\b/);
  return m ? m[1] : '';
}

function extractTitle_(o) {
  const keys = ['title','report_title','reportTitle','Report Title','report_name','reportName','name','description'];
  for (const k of keys) if (o[k]) return String(o[k]);
  return JSON.stringify(o).slice(0,250);
}

function getMissouriDiscoveredReports_() {
  const ss = SpreadsheetApp.openById(GOAT_BOT_SPREADSHEET_ID);
  let sh = ss.getSheetByName('usda_report_watchlist');
  if (!sh || sh.getLastRow() <= 1) {
    discoverMissouriSheepGoatReports();
    sh = ss.getSheetByName('usda_report_watchlist');
  }
  const rows = sh.getDataRange().getValues();
  const headers = rows[0].map(String);
  return rows.slice(1).filter(r => r[headers.indexOf('slug')]).map(r => ({
    slug: String(r[headers.indexOf('slug')]),
    market_id: String(r[headers.indexOf('market_id')]),
    market_name: String(r[headers.indexOf('market_name')]),
    state: String(r[headers.indexOf('state')]),
    frequency: String(r[headers.indexOf('frequency')])
  }));
}

function runMissouriOnlyUsdaPull() {
  setupGoatBotSheets();
  const ss = SpreadsheetApp.openById(GOAT_BOT_SPREADSHEET_ID);
  const reports = getMissouriDiscoveredReports_();
  const results = reports.map(report => pullUsdaReport_(ss, report));
  upsertDashboardMetric_(ss, 'last_missouri_usda_pull', new Date().toISOString(), JSON.stringify(results));
  updateMissouriLastPulled_(ss, reports);
  return { ok: true, reports: reports.map(r => r.slug), results };
}

function runDailyUsdaPullWithBeebeAndMissouri() {
  setupGoatBotSheets();
  const ss = SpreadsheetApp.openById(GOAT_BOT_SPREADSHEET_ID);
  const started = new Date();
  const baseReports = (typeof USDA_TRACKED_REPORTS !== 'undefined' ? USDA_TRACKED_REPORTS : []).slice();
  const beebe = (typeof USDA_BEEBE_REPORT !== 'undefined' ? [USDA_BEEBE_REPORT] : []);
  const missouri = getMissouriDiscoveredReports_();
  const reports = baseReports.concat(beebe).concat(missouri);
  const seen = {};
  const unique = reports.filter(r => { if (!r.slug || seen[r.slug]) return false; seen[r.slug] = true; return true; });
  const results = unique.map(report => pullUsdaReport_(ss, report));
  upsertDashboardMetric_(ss, 'last_usda_pull', started.toISOString(), JSON.stringify(results));
  upsertDashboardMetric_(ss, 'usda_pull_schedule', 'Daily around 5:00 AM Central, including AR/TX/OK + Beebe + Missouri watchlist', 'Installed by installDailyUsdaPullTriggerFullMarketSet()');
  updateMissouriLastPulled_(ss, missouri);
  return { ok: true, pulledAt: started.toISOString(), includedReports: unique.map(r => r.slug), results };
}

function installDailyUsdaPullTriggerFullMarketSet() {
  ScriptApp.getProjectTriggers().forEach(t => {
    const fn = t.getHandlerFunction && t.getHandlerFunction();
    if (fn === 'runDailyUsdaPull' || fn === 'runDailyUsdaPullWithBeebe' || fn === 'runDailyUsdaPullWithBeebeAndMissouri') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('runDailyUsdaPullWithBeebeAndMissouri')
    .timeBased()
    .everyDays(1)
    .atHour(5)
    .nearMinute(0)
    .inTimezone('America/Chicago')
    .create();
  return { ok: true, message: 'Daily USDA pull installed for about 5:00 AM Central with Missouri markets included.' };
}

function updateMissouriLastPulled_(ss, reports) {
  const sh = ss.getSheetByName('usda_report_watchlist');
  if (!sh) return;
  const values = sh.getDataRange().getValues();
  const headers = values[0].map(String);
  const slugCol = headers.indexOf('slug') + 1;
  const pulledCol = headers.indexOf('last_pulled_at') + 1;
  if (!slugCol || !pulledCol) return;
  reports.forEach(r => {
    for (let i = 2; i <= values.length; i++) {
      if (String(values[i-1][slugCol-1]) === String(r.slug)) sh.getRange(i, pulledCol).setValue(new Date().toISOString());
    }
  });
}
