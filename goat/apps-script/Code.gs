const GOAT_BOT_SPREADSHEET_ID = '1KZp48FXcTXRcidyNKtla0IgJDhz-z2ge0mAlYQv7yvg';
const USDA_API_BASE = 'https://marsapi.ams.usda.gov/services/v1.2';

const USDA_TRACKED_REPORTS = [
  { slug: '3659', market_id: 'salem', market_name: 'Salem Stockyards', state: 'AR' },
  { slug: '2014', market_id: 'sanangelo', market_name: 'San Angelo Producers', state: 'TX' },
  { slug: '1826', market_id: 'pawnee', market_name: 'Pawnee Sale Barn', state: 'OK' }
];

const GOAT_BOT_HEADERS = {
  settings: ['key','value','description'],
  pens: ['id','pen_code','name','stage_type','max_goats','current_goat_count','last_cleaned_at','next_cleaning_due','notes'],
  batches: ['id','batch_code','purchase_date','source_market','source_seller','planned_head_count','actual_head_count','status','quality_assumption','intake_pen_id','current_stage','target_sale_date','actual_sale_date','total_purchase_cost','total_feed_cost','total_med_cost','total_other_cost','projected_floor_profit','projected_target_profit','projected_upside_bonus','actual_revenue','actual_net_profit','notes'],
  goats: ['id','tag_id','batch_id','source','purchase_date','purchase_price','intake_weight','current_weight','sex','quality_assumption','current_quality_score','likely_sale_quality','current_pen_id','next_weigh_date','next_exam_date','medication_status','withdrawal_status','withdrawal_end_date','projected_floor_profit','projected_target_profit','projected_upside_bonus','actual_sale_result','actual_net_profit','notes','status','target_weight'],
  pen_movements: ['id','goat_id','batch_id','from_pen_id','to_pen_id','movement_date','movement_reason','moved_by','notes'],
  weight_logs: ['id','goat_id','batch_id','weight_date','weight','avg_daily_gain_since_last','weighed_by','notes'],
  health_exams: ['id','goat_id','exam_date','exam_type','body_condition_score','famacha_score','appetite','stool_notes','respiratory_notes','hoof_notes','temperature','injury_notes','overall_status','follow_up_date','examined_by','notes'],
  medicine_logs: ['id','goat_id','medicine_inventory_id','medicine_name','dose','dose_unit','route','reason','date_given','given_by','withdrawal_days','withdrawal_end_date','follow_up_due','notes'],
  vaccine_logs: ['id','goat_id','vaccine_name','dose','route','date_given','booster_due','withdrawal_days','withdrawal_end_date','given_by','notes'],
  withdrawal_periods: ['id','goat_id','source_type','source_log_id','start_date','end_date','status','sale_blocked','notes'],
  daily_tasks: ['id','task_date','due_date','task_type','priority','goat_id','batch_id','pen_id','title','description','status','completed_at','completed_by','notes'],
  alerts: ['id','alert_type','severity','goat_id','batch_id','pen_id','market_id','title','message','status','created_at','resolved_at'],
  feed_inventory: ['id','item_name','item_type','quantity_on_hand','unit','cost_per_unit','supplier','reorder_level','estimated_days_remaining','last_purchase_date','notes'],
  medicine_inventory: ['id','item_name','category','quantity_on_hand','unit','expiration_date','default_dose','default_withdrawal_days','supplier','reorder_level','notes'],
  expense_ledger: ['id','expense_date','category_id','batch_id','goat_id','pen_id','vendor','description','amount','payment_method','receipt_url','tax_deductible','notes','allocation_type','allocated_goat_ids'],
  tax_categories: ['id','category_name','schedule_f_line_hint','description','active'],
  sales: ['id','sale_date','sale_location_id','batch_id','goat_id','sale_weight','sale_quality','gross_sale_price','auction_fee','commission_fee','yardage_fee','transport_cost','net_sale_price','actual_profit','buyer','notes'],
  sale_locations: ['id','name','type','city','state','zip','round_trip_miles','default_commission_rate','notes'],
  usda_price_history: ['id','market_id','report_slug','report_date','source','class','quality','sex_type','weight_min','weight_max','avg_weight','price_low_cwt','price_high_cwt','price_avg_cwt','head_count','confidence','raw_payload_url','created_at'],
  usda_raw_reports: ['id','pull_date','market_id','market_name','report_slug','status','http_code','request_url','raw_json','notes'],
  manual_market_uploads: ['id','upload_date','market','auction_date','file_name','drive_file_url','status','ocr_text','review_notes','extracted_rows_json','approved_for_market_history'],
  market_forecasts: ['id','market_id','forecast_date','weight_class','quality','price_7day','price_30day','price_60day','trend_signal','volatility_score','recommendation','notes'],
  profit_summaries: ['id','summary_date','scope_type','scope_id','revenue','expenses','net_profit','floor_profit','target_profit','upside_bonus','cash_at_risk','inventory_value','notes'],
  dashboard_aggregates: ['metric','value','notes']
};

function setupGoatBotSheets() {
  const ss = SpreadsheetApp.openById(GOAT_BOT_SPREADSHEET_ID);
  Object.keys(GOAT_BOT_HEADERS).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    const headers = GOAT_BOT_HEADERS[name];
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setBackground('#12301f').setFontColor('#ffffff').setFontWeight('bold');
    sh.autoResizeColumns(1, headers.length);
  });
  seedStaticRows_(ss);
  return { ok: true, message: 'Goat Bot sheets initialized', spreadsheetId: GOAT_BOT_SPREADSHEET_ID };
}

function installDailyUsdaPullTrigger() {
  deleteDailyUsdaPullTrigger();
  ScriptApp.newTrigger('runDailyUsdaPull')
    .timeBased()
    .everyDays(1)
    .atHour(5)
    .nearMinute(0)
    .inTimezone('America/Chicago')
    .create();
  return { ok: true, message: 'Daily USDA pull installed for about 5:00 AM Central.' };
}

function deleteDailyUsdaPullTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction && t.getHandlerFunction() === 'runDailyUsdaPull') ScriptApp.deleteTrigger(t);
  });
  return { ok: true, message: 'Existing USDA pull triggers removed.' };
}

function setUsdaApiKey(apiKey) {
  if (!apiKey) throw new Error('Missing API key.');
  PropertiesService.getScriptProperties().setProperty('USDA_API_KEY', apiKey);
  return { ok: true, message: 'USDA API key saved in Apps Script properties.' };
}

function runDailyUsdaPull() {
  setupGoatBotSheets();
  const ss = SpreadsheetApp.openById(GOAT_BOT_SPREADSHEET_ID);
  const started = new Date();
  const results = USDA_TRACKED_REPORTS.map(report => pullUsdaReport_(ss, report));
  upsertDashboardMetric_(ss, 'last_usda_pull', started.toISOString(), JSON.stringify(results));
  upsertDashboardMetric_(ss, 'usda_pull_schedule', 'Daily around 5:00 AM Central', 'Installed by installDailyUsdaPullTrigger()');
  return { ok: true, pulledAt: started.toISOString(), results };
}

function pullUsdaReport_(ss, report) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('USDA_API_KEY');
  if (!apiKey) {
    const msg = 'Missing USDA_API_KEY. Run setUsdaApiKey("YOUR_KEY") in Apps Script first.';
    appendUsdaRaw_(ss, report, 'missing_api_key', '', '', msg);
    return { report: report.slug, ok: false, error: msg };
  }
  const candidates = [
    `${USDA_API_BASE}/reports/${report.slug}?allSections=true`,
    `${USDA_API_BASE}/reports/${report.slug}/Details?lastDays=14`,
    `${USDA_API_BASE}/reports/${report.slug}?lastDays=14&allSections=true`
  ];
  let lastError = '';
  for (const url of candidates) {
    try {
      const response = UrlFetchApp.fetch(url, {
        method: 'get',
        muteHttpExceptions: true,
        headers: { Authorization: 'Basic ' + Utilities.base64Encode(apiKey + ':') }
      });
      const code = response.getResponseCode();
      const text = response.getContentText();
      if (code >= 200 && code < 300) {
        appendUsdaRaw_(ss, report, 'pulled', code, url, text);
        const rows = normalizeUsdaRows_(report, text, url);
        appendUsdaPriceRows_(ss, rows);
        return { report: report.slug, market: report.market_name, ok: true, httpCode: code, rows: rows.length };
      }
      lastError = `HTTP ${code}: ${text.slice(0, 250)}`;
    } catch (err) {
      lastError = String(err && err.message ? err.message : err);
    }
  }
  appendUsdaRaw_(ss, report, 'failed', '', candidates[0], lastError);
  return { report: report.slug, market: report.market_name, ok: false, error: lastError };
}

function normalizeUsdaRows_(report, text, url) {
  let parsed;
  try { parsed = JSON.parse(text); } catch (err) { return []; }
  const flat = [];
  walkObjects_(parsed, flat);
  return flat
    .map(o => normalizeUsdaObject_(report, o, url))
    .filter(r => r && (r.price_low_cwt || r.price_high_cwt || r.price_avg_cwt));
}

function walkObjects_(value, out) {
  if (Array.isArray(value)) value.forEach(v => walkObjects_(v, out));
  else if (value && typeof value === 'object') {
    out.push(value);
    Object.keys(value).forEach(k => walkObjects_(value[k], out));
  }
}

function normalizeUsdaObject_(report, o, url) {
  const txt = JSON.stringify(o).toLowerCase();
  if (txt.indexOf('goat') === -1 && txt.indexOf('kid') === -1) return null;
  const low = pickNumber_(o, ['price_low','price_low_cwt','low','min_price','priceMin','Low']);
  const high = pickNumber_(o, ['price_high','price_high_cwt','high','max_price','priceMax','High']);
  const avg = pickNumber_(o, ['price_avg','price_avg_cwt','avg','average','weighted_avg','Average']);
  if (!low && !high && !avg) return null;
  return {
    id: Utilities.getUuid(),
    market_id: report.market_id,
    report_slug: report.slug,
    report_date: pickText_(o, ['report_date','report_begin_date','date','Report Date']) || new Date().toISOString().slice(0,10),
    source: 'USDA MyMarketNews API',
    class: pickText_(o, ['class','class_description','category','Commodity','commodity']) || '',
    quality: pickText_(o, ['quality','grade','description','Description']) || '',
    sex_type: pickText_(o, ['sex','sex_type','type']) || '',
    weight_min: pickNumber_(o, ['weight_min','min_weight','weightLow','Weight Low']),
    weight_max: pickNumber_(o, ['weight_max','max_weight','weightHigh','Weight High']),
    avg_weight: pickNumber_(o, ['avg_weight','average_weight','weight','Weight']),
    price_low_cwt: low,
    price_high_cwt: high,
    price_avg_cwt: avg || ((low && high) ? (low + high) / 2 : ''),
    head_count: pickNumber_(o, ['head_count','receipts','volume','head','Head']),
    confidence: 'api_needs_review',
    raw_payload_url: url,
    created_at: new Date().toISOString()
  };
}

function pickText_(o, keys) {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null && o[k] !== '') return String(o[k]);
  return '';
}

function pickNumber_(o, keys) {
  for (const k of keys) {
    if (o[k] !== undefined && o[k] !== null && o[k] !== '') {
      const n = Number(String(o[k]).replace(/[^0-9.\-]/g, ''));
      if (!isNaN(n)) return n;
    }
  }
  return '';
}

function appendUsdaRaw_(ss, report, status, httpCode, url, rawOrNotes) {
  appendRowDirect_(ss, 'usda_raw_reports', {
    id: Utilities.getUuid(), pull_date: new Date().toISOString(), market_id: report.market_id, market_name: report.market_name,
    report_slug: report.slug, status, http_code: httpCode, request_url: url,
    raw_json: status === 'pulled' ? rawOrNotes : '', notes: status === 'pulled' ? '' : rawOrNotes
  });
}

function appendUsdaPriceRows_(ss, rows) {
  rows.forEach(row => appendRowDirect_(ss, 'usda_price_history', row));
}

function addManualMarketUpload(row) {
  setupGoatBotSheets();
  const ss = SpreadsheetApp.openById(GOAT_BOT_SPREADSHEET_ID);
  const record = {
    id: row.id || Utilities.getUuid(),
    upload_date: row.upload_date || new Date().toISOString(),
    market: row.market || 'Bowie Sheep & Goat',
    auction_date: row.auction_date || '',
    file_name: row.file_name || '',
    drive_file_url: row.drive_file_url || '',
    status: row.status || 'needs_review',
    ocr_text: row.ocr_text || '',
    review_notes: row.review_notes || '',
    extracted_rows_json: normalizeValue_(row.extracted_rows_json || ''),
    approved_for_market_history: row.approved_for_market_history || 'no'
  };
  appendRowDirect_(ss, 'manual_market_uploads', record);
  return { ok: true, upload: record };
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'exportJson';
  if (action === 'setup') return json_(setupGoatBotSheets());
  if (action === 'installDailyUsda') return json_(installDailyUsdaPullTrigger());
  if (action === 'runDailyUsdaPull') return json_(runDailyUsdaPull());
  if (action === 'ping') return json_({ ok: true, app: 'Goat Bot Sheets API', spreadsheetId: GOAT_BOT_SPREADSHEET_ID });
  return json_(exportJson_());
}

function doPost(e) {
  const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  const action = body.action || 'saveSnapshot';
  if (action === 'saveSnapshot') return json_(saveSnapshot_(body.db || body));
  if (action === 'append') return json_(appendRow_(body.sheet, body.row));
  if (action === 'manualMarketUpload') return json_(addManualMarketUpload(body.row || body));
  if (action === 'runDailyUsdaPull') return json_(runDailyUsdaPull());
  return json_({ ok: false, error: 'Unknown action: ' + action });
}

function exportJson_() {
  setupGoatBotSheets();
  const ss = SpreadsheetApp.openById(GOAT_BOT_SPREADSHEET_ID);
  const out = { ok: true, spreadsheetId: GOAT_BOT_SPREADSHEET_ID, exportedAt: new Date().toISOString(), tables: {} };
  Object.keys(GOAT_BOT_HEADERS).forEach(name => {
    const sh = ss.getSheetByName(name);
    const values = sh.getDataRange().getValues();
    out.tables[name] = rowsToObjects_(values);
  });
  return out;
}

function saveSnapshot_(db) {
  setupGoatBotSheets();
  const ss = SpreadsheetApp.openById(GOAT_BOT_SPREADSHEET_ID);
  const mapping = {
    pens: db.pens || [], batches: db.batches || [], goats: db.goats || [], pen_movements: db.movements || [], weight_logs: db.weights || [], health_exams: db.health || [], medicine_logs: db.medicine || [], expense_ledger: db.expenses || [], sales: db.sales || [], daily_tasks: db.tasks || [], alerts: db.alerts || []
  };
  Object.keys(mapping).forEach(sheetName => writeObjects_(ss, sheetName, mapping[sheetName]));
  writeSettings_(ss, db.settings || {});
  return { ok: true, savedAt: new Date().toISOString(), spreadsheetId: GOAT_BOT_SPREADSHEET_ID };
}

function appendRow_(sheetName, rowObj) {
  setupGoatBotSheets();
  const ss = SpreadsheetApp.openById(GOAT_BOT_SPREADSHEET_ID);
  appendRowDirect_(ss, sheetName, rowObj);
  return { ok: true, sheet: sheetName };
}

function appendRowDirect_(ss, sheetName, rowObj) {
  if (!GOAT_BOT_HEADERS[sheetName]) throw new Error('Unknown sheet: ' + sheetName);
  const sh = ss.getSheetByName(sheetName);
  const headers = GOAT_BOT_HEADERS[sheetName];
  const row = headers.map(h => rowObj && rowObj[h] !== undefined ? rowObj[h] : aliasValue_(rowObj || {}, h));
  sh.appendRow(row.map(normalizeValue_));
}

function writeObjects_(ss, sheetName, objects) {
  const sh = ss.getSheetByName(sheetName);
  const headers = GOAT_BOT_HEADERS[sheetName];
  sh.clearContents();
  const rows = [headers].concat((objects || []).map(o => headers.map(h => normalizeValue_(o[h] !== undefined ? o[h] : aliasValue_(o, h)))));
  sh.getRange(1, 1, rows.length, headers.length).setValues(rows);
  sh.getRange(1, 1, 1, headers.length).setBackground('#12301f').setFontColor('#ffffff').setFontWeight('bold');
}

function writeSettings_(ss, settings) {
  const sh = ss.getSheetByName('settings');
  const rows = [['key','value','description']].concat(Object.keys(settings).map(k => [k, settings[k], 'Saved from Goat Bot dashboard']));
  sh.clearContents();
  sh.getRange(1, 1, rows.length, 3).setValues(rows);
  sh.getRange(1, 1, 1, 3).setBackground('#12301f').setFontColor('#ffffff').setFontWeight('bold');
}

function upsertDashboardMetric_(ss, metric, value, notes) {
  const sh = ss.getSheetByName('dashboard_aggregates');
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === metric) {
      sh.getRange(i + 1, 2, 1, 2).setValues([[value, notes || '']]);
      return;
    }
  }
  sh.appendRow([metric, value, notes || '']);
}

function aliasValue_(o, h) {
  const aliases = { tag_id: 'tag', current_pen_id: 'currentPenId', purchase_date: 'purchaseDate', purchase_price: 'purchasePrice', intake_weight: 'intakeWeight', current_weight: 'currentWeight', quality_assumption: 'qualityAssumption', current_quality_score: 'currentQuality', likely_sale_quality: 'likelyQuality', next_weigh_date: 'nextWeighDate', next_exam_date: 'nextExamDate', withdrawal_end_date: 'withdrawalEndDate', target_weight: 'targetWeight', batch_code: 'code', source_market: 'source', target_sale_date: 'targetSaleDate', sale_date: 'saleDate', sale_weight: 'saleWeight', sale_quality: 'saleQuality', net_sale_price: 'netSalePrice', actual_profit: 'actualProfit', from_pen_id: 'fromPenId', to_pen_id: 'toPenId', movement_date: 'date', movement_reason: 'reason', weight_date: 'date', exam_date: 'date', exam_type: 'type', medicine_name: 'medicine', date_given: 'date', withdrawal_days: 'withdrawalDays', expense_date: 'date', category_id: 'category', allocation_type: 'allocationType', allocated_goat_ids: 'allocatedGoatIds' };
  return aliases[h] && o[aliases[h]] !== undefined ? o[aliases[h]] : '';
}

function rowsToObjects_(values) {
  if (!values || values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter(r => r.some(c => c !== '')).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function normalizeValue_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return v;
}

function seedStaticRows_(ss) {
  const pens = ss.getSheetByName('pens');
  if (pens.getLastRow() <= 1) {
    pens.getRange(2,1,8,9).setValues([
      ['pen-1','BAY-1','Intake / Quarantine A','quarantine',5,0,'','','New arrivals only. 14-day quarantine.'],
      ['pen-2','BAY-2','Intake / Quarantine B','quarantine',5,0,'','','Second intake batch or quarantine overflow.'],
      ['pen-3','BAY-3','Recovery / Problem Pen','recovery',5,0,'','','Keep open whenever possible.'],
      ['pen-4','BAY-4','Starter Grow-Out A','starter',5,0,'','','Cleared goats, feed ramp-up.'],
      ['pen-5','BAY-5','Starter Grow-Out B','starter',5,0,'','','Second starter bay.'],
      ['pen-6','BAY-6','Mid Grow-Out','mid',5,0,'','','Main gain stage.'],
      ['pen-7','BAY-7','Finish Pen','finish',5,0,'','','Final conditioning.'],
      ['pen-8','BAY-8','Sale-Ready Staging','sale_stage',5,0,'','','Last 3–7 days before sale.']
    ]);
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
