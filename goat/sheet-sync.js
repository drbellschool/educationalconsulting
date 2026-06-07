// Goat Bot Google Sheets sync adapter.
// 1. Deploy goat/apps-script/Code.gs as a Google Apps Script web app.
// 2. Paste the deployed web app URL below.
// 3. The dashboard will use Google Sheets as source of truth and localStorage as offline fallback.

window.GOAT_BOT_SHEET_ID = '1KZp48FXcTXRcidyNKtla0IgJDhz-z2ge0mAlYQv7yvg';
window.GOAT_BOT_API_URL = 'https://script.google.com/macros/s/AKfycbwieToeZ8LeTQXAN6zkmec4nQWcKR9NBrH4yA0oJwprwsRtMShPnMZsP1sP8RStPmkzfQ/exec'; // Example: https://script.google.com/macros/s/AKfycb.../exec

async function goatBotFetchSheetSnapshot() {
  if (!window.GOAT_BOT_API_URL) return null;
  const res = await fetch(window.GOAT_BOT_API_URL + '?action=exportJson', { method: 'GET' });
  if (!res.ok) throw new Error('Goat Bot sheet export failed: ' + res.status);
  return await res.json();
}

async function goatBotSaveSheetSnapshot(db) {
  if (!window.GOAT_BOT_API_URL) return { ok: false, offline: true };
  const res = await fetch(window.GOAT_BOT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'saveSnapshot', db })
  });
  if (!res.ok) throw new Error('Goat Bot sheet save failed: ' + res.status);
  return await res.json();
}

function goatBotSheetLink() {
  return 'https://docs.google.com/spreadsheets/d/' + window.GOAT_BOT_SHEET_ID + '/edit';
}

window.goatBotFetchSheetSnapshot = goatBotFetchSheetSnapshot;
window.goatBotSaveSheetSnapshot = goatBotSaveSheetSnapshot;
window.goatBotSheetLink = goatBotSheetLink;
