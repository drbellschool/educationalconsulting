// Adds Beebe Livestock Auction (AMS 3672) to the daily USDA pull without disturbing the original Code.gs.
// Paste this file into the same Apps Script project as Code.gs.

const USDA_BEEBE_REPORT = {
  slug: '3672',
  market_id: 'beebe',
  market_name: 'Beebe Livestock Auction - Sheep and Goat Sale',
  state: 'AR',
  pricing_note: 'Mostly Per Unit / No Wt. Treat as per-head pricing unless later normalized differently.'
};

function runDailyUsdaPullWithBeebe() {
  setupGoatBotSheets();
  const ss = SpreadsheetApp.openById(GOAT_BOT_SPREADSHEET_ID);
  const started = new Date();
  const baseReports = (typeof USDA_TRACKED_REPORTS !== 'undefined' ? USDA_TRACKED_REPORTS : []).slice();
  const reports = baseReports.concat([USDA_BEEBE_REPORT]);
  const results = reports.map(report => pullUsdaReport_(ss, report));
  upsertDashboardMetric_(ss, 'last_usda_pull', started.toISOString(), JSON.stringify(results));
  upsertDashboardMetric_(ss, 'usda_pull_schedule', 'Daily around 5:00 AM Central, including Beebe AMS 3672', 'Installed by installDailyUsdaPullTriggerWithBeebe()');
  return { ok: true, pulledAt: started.toISOString(), includedReports: reports.map(r => r.slug), results };
}

function runBeebeOnlyUsdaPull() {
  setupGoatBotSheets();
  const ss = SpreadsheetApp.openById(GOAT_BOT_SPREADSHEET_ID);
  const result = pullUsdaReport_(ss, USDA_BEEBE_REPORT);
  upsertDashboardMetric_(ss, 'last_beebe_pull', new Date().toISOString(), JSON.stringify(result));
  return result;
}

function installDailyUsdaPullTriggerWithBeebe() {
  ScriptApp.getProjectTriggers().forEach(t => {
    const fn = t.getHandlerFunction && t.getHandlerFunction();
    if (fn === 'runDailyUsdaPull' || fn === 'runDailyUsdaPullWithBeebe') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('runDailyUsdaPullWithBeebe')
    .timeBased()
    .everyDays(1)
    .atHour(5)
    .nearMinute(0)
    .inTimezone('America/Chicago')
    .create();
  return { ok: true, message: 'Daily USDA pull installed for about 5:00 AM Central and now includes Beebe AMS 3672.' };
}
