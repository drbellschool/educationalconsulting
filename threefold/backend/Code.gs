/**
 * Threefold pilot | Google Sheets-bound Apps Script
 * Copy into the Script editor attached to a PRIVATE Google Sheet.
 * Web app: execute as owner, access Anyone. Webhook accepts signed Worker packets only.
 * Admin interface: use the Sheet's Threefold menu; NEVER expose these functions
 * through public doGet or unauthenticated browser endpoints.
 */
const TF = {
  HEADERS: {
    Participants: ['ID','Phone','Name','Status','Adult Confirmed','Opt In UTC','Opt In Source','Opt Out UTC','Couple ID','Pending Action','Pending Ref','Time Zone','Updated UTC'],
    Couples: ['ID','Person A','Person B','Status','Created UTC'],
    LinkCodes: ['Code','Creator ID','Requester ID','Status','Expires UTC'],
    Events: ['ID','Type','Received UTC','Raw JSON','Status','Error'],
    Messages: ['ID','Participant ID','Couple ID','Direction','Kind','Text','At UTC','Telnyx ID','Visibility'],
    Outbox: ['ID','Participant ID','Phone','Text','Kind','Due UTC','Status','Last Error','Telnyx ID','Created UTC'],
    Reminders: ['ID','Participant ID','Text','Due UTC','Status','Created UTC'],
    Whispers: ['ID','Participant ID','Couple ID','Prompt','Answer','Share Status','Created UTC'],
    Audit: ['ID','At UTC','Actor','Action','Target','Details']
  },
  STOP: /^(STOP|STOPALL|UNSUBSCRIBE|CANCEL|END|QUIT)$/i,
  FROM: '+19036090465',
  TZ: 'America/Chicago'
};

function setupThreefold() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Open a private Google Sheet and run this bound script there.');
  Object.keys(TF.HEADERS).forEach(function(name) {
    let s = ss.getSheetByName(name);
    if (!s) s = ss.insertSheet(name);
    const header = TF.HEADERS[name];
    if (s.getLastRow() > 0 && s.getRange(1,1,1,header.length).getDisplayValues()[0].some(function(x){return x !== '';})) {
      const actual = s.getRange(1,1,1,header.length).getDisplayValues()[0];
      if (JSON.stringify(actual) !== JSON.stringify(header)) throw new Error('Schema mismatch in tab: ' + name);
    } else {
      s.getRange(1,1,1,header.length).setValues([header]).setFontWeight('bold');
      s.setFrozenRows(1);
      s.getRange(1,1,s.getMaxRows(),header.length).setNumberFormat('@');
    }
  });
  PropertiesService.getScriptProperties().setProperty('SHEET_ID',ss.getId());
  const triggers = ScriptApp.getProjectTriggers().filter(function(t){return t.getHandlerFunction() === 'runThreefoldQueue';});
  if (!triggers.length) ScriptApp.newTrigger('runThreefoldQueue').timeBased().everyMinutes(1).create();
  SpreadsheetApp.getUi().alert('Threefold tabs and one-minute queue trigger are installed. Next, set Script Properties from README; do not enter keys into cells.');
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Threefold')
    .addItem('Open private dashboard','openThreefoldAdmin')
    .addItem('Initialize pilot tabs','setupThreefold')
    .addToUi();
}
function openThreefoldAdmin() {
  SpreadsheetApp.getUi().showSidebar(HtmlService.createHtmlOutputFromFile('Admin').setTitle('Threefold · Pilot'));
}

function getThreefoldAdminSummary() {
  const p=rows_('Participants'), c=rows_('Couples'), e=rows_('Events'), o=rows_('Outbox'), r=rows_('Reminders');
  return {
    enrolled: p.filter(function(x){return x.Status==='OPTED_IN';}).length,
    pendingConsent: p.filter(function(x){return x.Status==='PENDING_ADULT';}).length,
    optedOut: p.filter(function(x){return x.Status==='OPTED_OUT';}).length,
    couples: c.filter(function(x){return x.Status==='ACTIVE';}).length,
    eventsPending: e.filter(function(x){return x.Status==='PENDING';}).length,
    outboundPending: o.filter(function(x){return x.Status==='QUEUED';}).length,
    outboundReview: o.filter(function(x){return x.Status==='REVIEW';}).length,
    futureReminders: r.filter(function(x){return x.Status==='PENDING';}).length,
    openaiConfigured: Boolean(prop_('OPENAI_API_KEY')),
    telnyxConfigured: Boolean(prop_('TELNYX_API_KEY')),
    intakeConfigured: Boolean(prop_('WEBHOOK_SHARED_SECRET')),
    updated: now_()
  };
}
function getThreefoldAdminRecent() {
  return rows_('Audit').slice(-18).reverse().map(function(x){
    return {when:x['At UTC'],action:x.Action,target:x.Target,details:x.Details};
  });
}

function doGet() {
  return json_({name:'Threefold Webhook',status:'receiving signed packets only'});
}
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents || e.postData.contents.length>100000) throw new Error('Invalid packet size');
    const packet=JSON.parse(e.postData.contents);
    const secret=prop_('WEBHOOK_SHARED_SECRET');
    if (!secret) throw new Error('Webhook not configured');
    if (!/^[a-zA-Z0-9_\-:.]{1,160}$/.test(String(packet.id||''))) throw new Error('Invalid event ID');
    if (typeof packet.raw !== 'string' || packet.raw.length>80000) throw new Error('Invalid payload');
    const timestamp=Number(packet.timestamp);
    if (!Number.isInteger(timestamp) || Math.abs(Math.floor(Date.now()/1000)-timestamp)>300) throw new Error('Expired packet');
    const data=timestamp+'.'+packet.id+'.'+packet.raw;
    const expected=hex_(Utilities.computeHmacSha256Signature(data,secret));
    if (!same_(expected,String(packet.sig||'').toLowerCase())) throw new Error('Invalid signature');
    const event=JSON.parse(packet.raw);
    const id=String(event.data && event.data.id || event.data && event.data.payload && event.data.payload.id || '');
    if (!id || id!==String(packet.id)) throw new Error('Event ID mismatch');
    const lock=LockService.getScriptLock();
    if (!lock.tryLock(2000)) throw new Error('Queue temporarily busy');
    try {
      if (rows_('Events').some(function(x){return x.ID===id;})) return json_({ok:true,duplicate:true});
      add_('Events',{ID:id,Type:String(event.data.event_type||''),'Received UTC':now_(),'Raw JSON':packet.raw,Status:'PENDING'});
    } finally {lock.releaseLock();}
    return json_({ok:true,queued:true});
  } catch (err) {
    // A non-ok JSON response makes the Worker return 503 so Telnyx retries.
    return json_({ok:false,error:String(err.message||err)});
  }
}

function runThreefoldQueue() {
  const lock=LockService.getUserLock();
  if (!lock.tryLock(1000)) return;
  try {
    processEvents_();
    queueReminders_();
    sendQueued_();
  } finally {lock.releaseLock();}
}

function processEvents_() {
  const pending=rows_('Events').filter(function(x){return x.Status==='PENDING';}).slice(0,12);
  pending.forEach(function(row) {
    try {
      const event=JSON.parse(row['Raw JSON']);
      if(event.data && event.data.event_type==='message.received') {
        const m=event.data.payload||{};
        const from=String(m.from && m.from.phone_number||'');
        const to=String(m.to && m.to[0] && m.to[0].phone_number||'');
        if(!/^\+[1-9]\d{7,14}$/.test(from) || to!== (prop_('TELNYX_FROM_NUMBER')||TF.FROM)) throw new Error('Invalid phone or destination');
        incoming_(from,String(m.text||'').trim().slice(0,2500),String(m.id||row.ID));
      }
      patch_('Events',row._row,{Status:'DONE',Error:''});
    } catch(err) {
      patch_('Events',row._row,{Status:'REVIEW',Error:String(err.message||err).slice(0,300)});
      audit_('SYSTEM','EVENT_REVIEW',row.ID,String(err.message||err).slice(0,150));
    }
  });
}

function incoming_(phone,text,telnyxId) {
  let p=rows_('Participants').find(function(x){return x.Phone===phone;});
  const command=text.toUpperCase().trim();
  if (!p) {
    const id=Utilities.getUuid();
    add_('Participants',{ID:id,Phone:phone,Status:'UNREGISTERED','Adult Confirmed':'NO','Time Zone':TF.TZ,'Updated UTC':now_()});
    p=rows_('Participants').find(function(x){return x.ID===id;});
  }
  if (!p) throw new Error('Unable to load participant');
  add_('Messages',{ID:Utilities.getUuid(),'Participant ID':p.ID,'Couple ID':p['Couple ID'],Direction:'IN',Kind:'SMS',Text:text,'At UTC':now_(),'Telnyx ID':telnyxId,Visibility:'PRIVATE'});

  if(TF.STOP.test(command)) {
    patch_('Participants',p._row,{Status:'OPTED_OUT','Opt Out UTC':now_(),'Pending Action':'','Pending Ref':'','Updated UTC':now_()});
    suppressQueued_(p.ID);
    reply_(p,'Threefold: You are unsubscribed. No further recurring messages will be sent. Reply JOIN to opt in again.','STOP_ACK');
    audit_(p.ID,'STOP','SMS','Consent withdrawn'); return;
  }
  if(command==='HELP') {
    reply_(p,'Threefold help: drbell@lonestarteacher.com. Msg frequency varies; msg & data rates may apply. Reply STOP to unsubscribe.','HELP_ACK');return;
  }
  if(command==='JOIN' || command==='START') {
    patch_('Participants',p._row,{Status:'PENDING_ADULT','Adult Confirmed':'NO','Pending Action':'','Pending Ref':'','Updated UTC':now_()});
    reply_(p,'Threefold: To join recurring relationship prompts, reminders and replies, confirm you are 18+ and agree to the program at lonestarteacher.com/threefold/terms.html. Reply YES to join, or STOP to cancel. Msg/data rates may apply.','CONSENT_REQUEST');
    audit_(p.ID,'JOIN_REQUEST','SMS','Age and consent confirmation requested');return;
  }
  if(command==='YES' && p.Status==='PENDING_ADULT') {
    patch_('Participants',p._row,{Status:'OPTED_IN','Adult Confirmed':'YES','Opt In UTC':now_(),'Opt In Source':'SMS_JOIN_YES','Opt Out UTC':'','Updated UTC':now_()});
    reply_(p,'Welcome to Threefold! You are enrolled. Reply WHISPER for a private prompt, DATE for an adventure or HELP for commands. Msg frequency varies. Reply STOP anytime.','WELCOME');
    audit_(p.ID,'OPT_IN','SMS','Adult attestation and SMS consent');return;
  }
  if(p.Status!=='OPTED_IN') {
    if (p.Status==='PENDING_ADULT') reply_(p,'Please reply YES to confirm you are 18+ and want Threefold SMS, or STOP to cancel.','CONSENT_REQUEST');
    else reply_(p,'To use Threefold, reply JOIN and complete the adult opt-in. Reply HELP for support.','JOIN_REQUEST');
    return;
  }

  if(command==='WHISPER') {newWhisper_(p);return;}
  if(command==='SHARE') {requestShare_(p);return;}
  if(command==='CONFIRM SHARE' && p['Pending Action']==='CONFIRM_SHARE') {confirmShare_(p);return;}
  if(command==='DATE') {
    reply_(p,'Your mini-adventure: Each of you picks an unfamiliar snack or dessert. Taste-test together, rate them, and share one memory the flavor brings back. No phones for 20 minutes.','DATE');return;
  }
  if(command==='LINK') {createLink_(p);return;}
  if(/^LINK [A-Z0-9]{6}$/.test(command)) {requestLink_(p,command.slice(5));return;}
  if(/^APPROVE [A-Z0-9]{6}$/.test(command)) {approveLink_(p,command.slice(8));return;}
  if(/^REMIND /.test(command)) {createReminder_(p,text);return;}
  if(p['Pending Action']==='WHISPER_ANSWER') {saveWhisper_(p,text);return;}
  if(p['Pending Action']==='CONFIRM_SHARE') {
    reply_(p,'Your whisper is still private. Reply CONFIRM SHARE to send it to your linked partner, or WHISPER to start another prompt.','PRIVACY');return;
  }
  converse_(p,text);
}

function reply_(p,text,kind) {
  add_('Outbox',{ID:Utilities.getUuid(),'Participant ID':p.ID,Phone:p.Phone,Text:String(text).slice(0,1250),Kind:kind||'REPLY','Due UTC':now_(),Status:'QUEUED','Created UTC':now_()});
}
function suppressQueued_(pid) {
  rows_('Outbox').filter(function(x){return x['Participant ID']===pid && x.Status==='QUEUED';}).forEach(function(x){patch_('Outbox',x._row,{Status:'SUPPRESSED'});});
}
function newWhisper_(p) {
  const prompts=[
    'What is one small thing your partner did recently that made you feel appreciated?',
    'What is something about your partner you still find irresistibly interesting?',
    'Name an ordinary moment you would love to experience with your partner again.',
    'What is a quality you see in your partner that they may not see in themselves?',
    'What is a small surprise you would love to plan together?'
  ];
  const prompt=prompts[Math.floor(Math.random()*prompts.length)], id=Utilities.getUuid();
  add_('Whispers',{ID:id,'Participant ID':p.ID,'Couple ID':p['Couple ID'],Prompt:prompt,'Share Status':'PRIVATE','Created UTC':now_()});
  patch_('Participants',p._row,{'Pending Action':'WHISPER_ANSWER','Pending Ref':id,'Updated UTC':now_()});
  reply_(p,'Love Whisper (private): '+prompt+' Reply with your answer. It stays private unless you choose to share it.','WHISPER');
}
function saveWhisper_(p,text) {
  const w=rows_('Whispers').find(function(x){return x.ID===p['Pending Ref'] && x['Participant ID']===p.ID;});
  if(!w) throw new Error('Whisper not found');
  patch_('Whispers',w._row,{Answer:text.slice(0,900)});
  patch_('Participants',p._row,{'Pending Action':'','Pending Ref':'','Updated UTC':now_()});
  reply_(p,'Saved privately. To share this whisper with your linked partner, reply SHARE. You will be asked to confirm before anything is sent.','WHISPER_SAVED');
}
function requestShare_(p) {
  if(!p['Couple ID']) {reply_(p,'Your answer is private. To connect with your partner, both of you must join independently; then one of you can reply LINK.','PRIVACY');return;}
  const w=rows_('Whispers').filter(function(x){return x['Participant ID']===p.ID && x.Answer && x['Share Status']==='PRIVATE';}).slice(-1)[0];
  if(!w) {reply_(p,'No completed private Love Whisper is ready. Reply WHISPER to create one.','PRIVACY');return;}
  patch_('Participants',p._row,{'Pending Action':'CONFIRM_SHARE','Pending Ref':w.ID,'Updated UTC':now_()});
  reply_(p,'Sharing preview: "'+w.Answer.slice(0,420)+'" Reply CONFIRM SHARE to send this to your linked partner. Otherwise it stays private.','SHARE_PREVIEW');
}
function confirmShare_(p) {
  const w=rows_('Whispers').find(function(x){return x.ID===p['Pending Ref'] && x['Participant ID']===p.ID && x['Share Status']==='PRIVATE';});
  const c=rows_('Couples').find(function(x){return x.ID===p['Couple ID'] && x.Status==='ACTIVE';});
  const partnerId=c && (c['Person A']===p.ID?c['Person B']:c['Person A']);
  const partner=rows_('Participants').find(function(x){return x.ID===partnerId && x.Status==='OPTED_IN';});
  if(!w||!partner) {reply_(p,'No active linked partner could receive this whisper. Nothing was shared.','PRIVACY');return;}
  reply_(partner,'A Love Whisper shared by your partner: '+w.Answer.slice(0,850),'SHARED_WHISPER');
  patch_('Whispers',w._row,{'Share Status':'SHARED'});
  patch_('Participants',p._row,{'Pending Action':'','Pending Ref':'','Updated UTC':now_()});
  reply_(p,'Shared with your linked partner. Only this specific answer was sent.','SHARE_DONE');
  audit_(p.ID,'SHARE_WHISPER',w.ID,'Explicit double confirmation');
}
function createLink_(p) {
  if(p['Couple ID']) {reply_(p,'You already have an active linked partner. Contact support if this needs to change.','LINK');return;}
  const code=Utilities.getUuid().replace(/-/g,'').slice(0,6).toUpperCase();
  add_('LinkCodes',{Code:code,'Creator ID':p.ID,Status:'NEW','Expires UTC':new Date(Date.now()+30*60000).toISOString()});
  reply_(p,'Your private link code is '+code+'. Your partner must independently opt in by texting JOIN, then text LINK '+code+'. The code expires in 30 minutes. Nothing private is shared automatically.','LINK');
}
function requestLink_(p,code) {
  if(p['Couple ID']) {reply_(p,'You already have a linked partner.','LINK');return;}
  const link=rows_('LinkCodes').find(function(x){return x.Code===code && x.Status==='NEW' && new Date(x['Expires UTC']).getTime()>Date.now();});
  if(!link || link['Creator ID']===p.ID) {reply_(p,'That code is invalid, expired or yours. Ask your partner to text LINK for a new one.','LINK');return;}
  const creator=rows_('Participants').find(function(x){return x.ID===link['Creator ID'] && x.Status==='OPTED_IN' && !x['Couple ID'];});
  if(!creator) {reply_(p,'The link request is unavailable.','LINK');return;}
  patch_('LinkCodes',link._row,{'Requester ID':p.ID,Status:'AWAITING_APPROVAL'});
  reply_(creator,'A Threefold participant ending in '+p.Phone.slice(-4)+' requests to link with you. Reply APPROVE '+code+' to confirm, or ignore. No private messages will be shared.','LINK');
  reply_(p,'Request sent. Your partner must approve the code before linking.','LINK');
}
function approveLink_(p,code) {
  if(p['Couple ID']) {reply_(p,'You are already linked.','LINK');return;}
  const link=rows_('LinkCodes').find(function(x){return x.Code===code && x['Creator ID']===p.ID && x.Status==='AWAITING_APPROVAL' && new Date(x['Expires UTC']).getTime()>Date.now();});
  const other=link && rows_('Participants').find(function(x){return x.ID===link['Requester ID'] && x.Status==='OPTED_IN' && !x['Couple ID'];});
  if(!link || !other) {reply_(p,'Request invalid or expired.','LINK');return;}
  const id=Utilities.getUuid();
  add_('Couples',{ID:id,'Person A':p.ID,'Person B':other.ID,Status:'ACTIVE','Created UTC':now_()});
  patch_('Participants',p._row,{'Couple ID':id,'Updated UTC':now_()});
  patch_('Participants',other._row,{'Couple ID':id,'Updated UTC':now_()});
  patch_('LinkCodes',link._row,{Status:'USED'});
  reply_(p,'You are linked! Your personal conversations remain private. You control what you share.','LINKED');
  reply_(other,'Your Threefold link is approved! Personal chats remain private; sharing requires your explicit action.','LINKED');
  audit_(p.ID,'COUPLE_LINKED',id,'Mutual opted-in confirmation');
}
function createReminder_(p,text) {
  const m=/^REMIND\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s*\|\s*(.{1,300})$/i.exec(text);
  if(!m) {reply_(p,'Format: REMIND 2026-11-02 19:00 | Ask about date-night plans. Times are Central for this pilot.','REMINDER');return;}
  const due=new Date(m[1]+'T'+m[2]+':00');
  if(isNaN(due.getTime())||Utilities.formatDate(due,TF.TZ,'yyyy-MM-dd HH:mm')!==m[1]+' '+m[2]||due.getTime()<Date.now()+300000||due.getTime()>Date.now()+365*86400000) {
    reply_(p,'That date/time is invalid, too soon or more than one year away. Use Central time at least five minutes ahead.','REMINDER');return;
  }
  add_('Reminders',{ID:Utilities.getUuid(),'Participant ID':p.ID,Text:m[3].slice(0,300),'Due UTC':due.toISOString(),Status:'PENDING','Created UTC':now_()});
  reply_(p,'Reminder saved for '+m[1]+' at '+m[2]+' Central. Reply STOP anytime to cancel future texts.','REMINDER');
}
function queueReminders_() {
  const people=rows_('Participants');
  rows_('Reminders').filter(function(x){return x.Status==='PENDING' && new Date(x['Due UTC']).getTime()<=Date.now();}).slice(0,20).forEach(function(r){
    const p=people.find(function(x){return x.ID===r['Participant ID'] && x.Status==='OPTED_IN';});
    if(p) reply_(p,'Your Threefold reminder: '+r.Text,'REMINDER_DUE');
    patch_('Reminders',r._row,{Status:p?'QUEUED':'CANCELLED'});
  });
}
function converse_(p,text) {
  if (!prop_('OPENAI_API_KEY')) {
    reply_(p,'The conversational companion is not activated yet. Reply WHISPER or DATE to try the pilot experiences.','AI_OFF');return;
  }
  const previous=rows_('Messages').filter(function(x){return x['Participant ID']===p.ID && x.Kind==='AI' && x.Visibility==='PRIVATE';}).slice(-8);
  const input=previous.map(function(m){return {role:m.Direction==='OUT'?'assistant':'user',content:m.Text.slice(0,1100)};});
  input.push({role:'user',content:text.slice(0,1000)});
  const payload={
    model:prop_('OPENAI_MODEL')||'gpt-4.1-mini',
    store:false,
    max_output_tokens:260,
    instructions:'You are Threefold, an adult opt-in relationship adventure companion. Be warm, playful, practical, SMS-short (under 650 characters). Start with connection and shared novelty (Aron), attend to bids/repair (Gottman), and respect autonomy, desire and boundaries (Schnarch). Integrate faith only when the user invites it. Ask at most one thoughtful question. Never claim to be therapy or a licensed counselor. Never coerce sexual activity or pressure reconciliation, and never assume a partner has consented to an activity. For threats, abuse, or immediate danger prioritize safety and human help. Do not reveal another person''s private information, imply you can access the partner''s private messages, or claim to have sent a reminder without a confirmed action. Avoid collecting unnecessary sensitive details.',
    input:input
  };
  const res=UrlFetchApp.fetch('https://api.openai.com/v1/responses',{
    method:'post',contentType:'application/json',muteHttpExceptions:true,
    headers:{Authorization:'Bearer '+prop_('OPENAI_API_KEY')},
    payload:JSON.stringify(payload)
  });
  if(res.getResponseCode()<200||res.getResponseCode()>=300) throw new Error('OpenAI returned HTTP '+res.getResponseCode());
  const body=JSON.parse(res.getContentText());
  const answer=(body.output||[]).filter(function(x){return x.type==='message';}).reduce(function(acc,x){
    return acc.concat((x.content||[]).filter(function(y){return y.type==='output_text';}).map(function(y){return y.text;}));
  },[]).join(' ').trim().slice(0,650);
  if(!answer) throw new Error('OpenAI returned no text');
  add_('Messages',{ID:Utilities.getUuid(),'Participant ID':p.ID,'Couple ID':p['Couple ID'],Direction:'IN',Kind:'AI',Text:text.slice(0,1000),'At UTC':now_(),Visibility:'PRIVATE'});
  add_('Messages',{ID:Utilities.getUuid(),'Participant ID':p.ID,'Couple ID':p['Couple ID'],Direction:'OUT',Kind:'AI',Text:answer,'At UTC':now_(),Visibility:'PRIVATE'});
  reply_(p,answer,'AI');
}
function sendQueued_() {
  const key=prop_('TELNYX_API_KEY');
  if(!key) return;
  const people=rows_('Participants');
  rows_('Outbox').filter(function(x){return x.Status==='QUEUED' && new Date(x['Due UTC']).getTime()<=Date.now();}).slice(0,8).forEach(function(o){
    const p=people.find(function(x){return x.ID===o['Participant ID'];});
    const exceptional=['STOP_ACK','HELP_ACK','JOIN_REQUEST','CONSENT_REQUEST'];
    if(!p || (p.Status!=='OPTED_IN' && exceptional.indexOf(o.Kind)===-1)) {patch_('Outbox',o._row,{Status:'SUPPRESSED'});return;}
    // Mark REVIEW before calling the network so an uncertain result cannot duplicate-send.
    patch_('Outbox',o._row,{Status:'REVIEW','Last Error':'Sending; verify in Telnyx before retrying manually'});
    try {
      const res=UrlFetchApp.fetch('https://api.telnyx.com/v2/messages',{
        method:'post',contentType:'application/json',muteHttpExceptions:true,
        headers:{Authorization:'Bearer '+key},
        payload:JSON.stringify({from:prop_('TELNYX_FROM_NUMBER')||TF.FROM,to:o.Phone,text:o.Text})
      });
      const status=res.getResponseCode(), body=JSON.parse(res.getContentText()||'{}');
      if(status<200||status>=300) throw new Error('Telnyx HTTP '+status+': '+JSON.stringify(body.errors||[]).slice(0,180));
      patch_('Outbox',o._row,{Status:'SENT','Last Error':'','Telnyx ID':String(body.data&&body.data.id||'')});
      add_('Messages',{ID:Utilities.getUuid(),'Participant ID':p.ID,'Couple ID':p['Couple ID'],Direction:'OUT',Kind:o.Kind,Text:o.Text,'At UTC':now_(),'Telnyx ID':String(body.data&&body.data.id||''),Visibility:o.Kind==='SHARED_WHISPER'?'SHARED':'PRIVATE'});
    } catch(err) {
      patch_('Outbox',o._row,{'Last Error':String(err.message||err).slice(0,300)});
      audit_('SYSTEM','OUTBOX_REVIEW',o.ID,'Manually inspect Telnyx before retry');
    }
  });
}
function audit_(actor,action,target,details) {
  add_('Audit',{ID:Utilities.getUuid(),'At UTC':now_(),Actor:actor,Action:action,Target:target,Details:details||''});
}
function prop_(name) {return PropertiesService.getScriptProperties().getProperty(name)||'';}
function now_() {return new Date().toISOString();}
function json_(o) {return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function rows_(name) {
  const s=sheet_(name);
  if(s.getLastRow()<2) return [];
  const h=TF.HEADERS[name],v=s.getRange(2,1,s.getLastRow()-1,h.length).getDisplayValues();
  return v.map(function(a,i){const row={_row:i+2};h.forEach(function(k,j){row[k]=a[j];});return row;});
}
function sheet_(name) {
  const id=prop_('SHEET_ID');
  if(!id) throw new Error('Run setupThreefold first');
  const s=SpreadsheetApp.openById(id).getSheetByName(name);
  if(!s) throw new Error('Missing sheet '+name);
  return s;
}
function add_(name,obj) {
  const s=sheet_(name);
  const v=TF.HEADERS[name].map(function(k){return cell_(obj[k]===undefined?'':obj[k]);});
  s.getRange(s.getLastRow()+1,1,1,v.length).setValues([v]);
}
function patch_(name,row,obj) {
  const s=sheet_(name),head=TF.HEADERS[name];
  Object.keys(obj).forEach(function(k){
    const j=head.indexOf(k);
    if(j<0) throw new Error('Unknown column '+k);
    s.getRange(row,j+1).setValue(cell_(obj[k]));
  });
}
function cell_(x) {
  const s=String(x===null||x===undefined?'':x).slice(0,30000);
  return /^[\s]*[=+\-@]/.test(s) ? "'"+s : s;
}
function hex_(bytes) {return bytes.map(function(n){return ('0'+(n&255).toString(16)).slice(-2);}).join('');}
function same_(a,b) {
  if(a.length!==b.length) return false;
  let d=0;for(let i=0;i<a.length;i++) d|=a.charCodeAt(i)^b.charCodeAt(i);
  return d===0;
}