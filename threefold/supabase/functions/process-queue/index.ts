// Private threefold queue runner. Invoke only from Supabase Cron with x-threefold-job-secret.
// Uses server-only Supabase credentials; never expose secrets to GitHub Pages.
import { createClient } from 'npm:@supabase/supabase-js@2';
type Item = Record<string, any>;
const C = {
  participant:'threefold_participants', couple:'threefold_couples',
  link:'threefold_link_codes', message:'threefold_messages',
  whisper:'threefold_whispers', reminder:'threefold_reminders',
  event:'threefold_inbound_events', outbox:'threefold_outbox',
  audit:'threefold_audit'
};
const from = Deno.env.get('TELNYX_FROM_NUMBER') || '+19036090465';
const T = (n:string) => C[n as keyof typeof C];
function env(n:string):string {
  const v=Deno.env.get(n);if(!v) throw Error('Missing setting '+n);return v;
}
function database() {
  const modern=Deno.env.get('SUPABASE_SECRET_KEYS');
  const secret=modern?JSON.parse(modern).default:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!secret) throw Error('Supabase secret unavailable');
  return createClient(env('SUPABASE_URL'),secret,{auth:{autoRefreshToken:false,persistSession:false}});
}
const db=database();
function checked(result:any):any {
  if(result.error) throw new Error(result.error.message);
  return result.data;
}
async function add(table:string, value:Item):Promise<Item>{
  return checked(await db.from(T(table)).insert(value).select().single());
}
async function update(table:string, id:string, values:Item):Promise<Item>{
  return checked(await db.from(T(table)).update(values).eq('id',id).select().single());
}
async function find(table:string, column:string, value:string):Promise<Item|null>{
  return checked(await db.from(T(table)).select('*').eq(column,value).maybeSingle());
}
async function getParticipant(phone:string):Promise<Item>{
  let p=await find('participant','phone',phone);
  if(!p) {
    try {p=await add('participant',{phone});}
    catch {p=await find('participant','phone',phone);}
  }
  if(!p) throw Error('Participant could not be loaded');
  return p;
}
async function out(p:Item, text:string, kind='REPLY'):Promise<void>{
  await add('outbox',{participant_id:p.id,phone:p.phone,body:text.slice(0,1300),kind});
}
async function audit(p:Item|null,action:string, context=''):Promise<void>{
  await add('audit',{participant_id:p?.id||null,action,context:context.slice(0,240)});
}
async function incoming(phone:string,text:string,providerId:string):Promise<void>{
  const p=await getParticipant(phone);
  const cmd=text.toUpperCase().trim();
  await add('message',{participant_id:p.id,couple_id:p.couple_id,direction:'IN',kind:'SMS',
    body:text.slice(0,2500),provider_message_id:providerId,visibility:'PRIVATE'});
  if(/^(STOP|STOPALL|UNSUBSCRIBE|END|CANCEL|QUIT)$/.test(cmd)){
    await update('participant',p.id,{status:'OPTED_OUT',opted_out_at:new Date().toISOString(),
      pending_action:null,pending_ref:null,updated_at:new Date().toISOString()});
    checked(await db.from(T('outbox')).update({status:'SUPPRESSED'})
      .eq('participant_id',p.id).eq('status','QUEUED'));
    checked(await db.from(T('reminder')).update({status:'CANCELLED'})
      .eq('participant_id',p.id).eq('status','PENDING'));
    await out(p,'Threefold: You are unsubscribed. No more recurring texts. Reply JOIN if you wish to enroll again.','STOP_ACK');
    await audit(p,'STOP','Consent withdrawn');return;
  }
  if(cmd==='HELP'){
    await out(p,'Threefold help: drbell@lonestarteacher.com. Message frequency varies; message and data rates may apply. Reply STOP to unsubscribe.','HELP_ACK');return;
  }
  if(cmd==='JOIN' || cmd==='START'){
    await update('participant',p.id,{status:'PENDING_ADULT',adult_confirmed:false,
      pending_action:null,pending_ref:null,updated_at:new Date().toISOString()});
    await out(p,'Threefold: You can join recurring relationship prompts, reminders and replies. Confirm you are 18+ and accept lonestarteacher.com/threefold/terms.html. Reply YES to enroll or STOP to cancel. Msg/data rates may apply.','CONSENT_REQUEST');
    await audit(p,'JOIN_REQUEST','Adult and SMS permission requested');return;
  }
  if(cmd==='YES' && p.status==='PENDING_ADULT'){
    await update('participant',p.id,{status:'OPTED_IN',adult_confirmed:true,
      consented_at:new Date().toISOString(),consent_source:'SMS_JOIN_YES',opted_out_at:null});
    await out(p,'Welcome to Threefold! Reply WHISPER, DATE, LINK or HELP. Conversations stay private unless you explicitly share. Msg frequency varies. Reply STOP anytime.','WELCOME');
    await audit(p,'OPT_IN','SMS JOIN followed by adult affirmation');return;
  }
  if(p.status!=='OPTED_IN'){
    await out(p,p.status==='PENDING_ADULT'?
      'To join, please reply YES to confirm you are 18+ and consent to Threefold recurring SMS, or STOP to cancel.':
      'To use Threefold, text JOIN and complete the independent adult opt-in. Reply HELP for support.','JOIN_REQUEST');
    return;
  }
  if(cmd==='WHISPER'){await whisperPrompt(p);return;}
  if(cmd==='SHARE'){await requestShare(p);return;}
  if(cmd==='CONFIRM SHARE' && p.pending_action==='CONFIRM_SHARE'){await confirmShare(p);return;}
  if(cmd==='DATE'){
    await out(p,'Tonight’s mini-adventure: each of you picks a dessert neither has tried before. Taste-test together, compare favorites and share a memory one flavor brings back. Phones away for 20 minutes.','DATE');return;
  }
  if(cmd==='LINK'){await createLink(p);return;}
  if(/^LINK [A-Z0-9]{6}$/.test(cmd)){await requestLink(p,cmd.slice(5));return;}
  if(/^APPROVE [A-Z0-9]{6}$/.test(cmd)){await approveLink(p,cmd.slice(8));return;}
  if(/^REMIND\s/i.test(text)){await setReminder(p,text);return;}
  if(p.pending_action==='WHISPER_ANSWER'){await saveWhisper(p,text);return;}
  if(p.pending_action==='CONFIRM_SHARE'){
    await out(p,'Your Whisper is still private. Reply CONFIRM SHARE to send this one response, or WHISPER to start a different prompt.','PRIVACY');return;
  }
  await converse(p,text);
}
async function whisperPrompt(p:Item) {
  const prompts=[
    'What is one small thing your partner did recently that made you feel appreciated?',
    'What is something about your partner that still makes you curious?',
    'Which ordinary moment together would you love to repeat?',
    'What strength does your partner have that they may overlook?',
    'What is a small surprise you would enjoy planning together?'
  ];
  const index=crypto.getRandomValues(new Uint32Array(1))[0]%prompts.length;
  const w=await add('whisper',{participant_id:p.id,couple_id:p.couple_id,prompt:prompts[index]});
  await update('participant',p.id,{pending_action:'WHISPER_ANSWER',pending_ref:w.id});
  await out(p,'Love Whisper (private): '+w.prompt+' Reply with your answer. It is not shared unless you choose to send it.','WHISPER');
}
async function saveWhisper(p:Item,text:string) {
  const w=await find('whisper','id',p.pending_ref);
  if(!w || w.participant_id!==p.id) throw Error('Private Whisper missing');
  await update('whisper',w.id,{answer:text.slice(0,900)});
  await update('participant',p.id,{pending_action:null,pending_ref:null});
  await out(p,'Saved privately. Reply SHARE if you want to preview and explicitly send this Whisper to your linked partner.','WHISPER_SAVED');
}
async function requestShare(p:Item) {
  if(!p.couple_id){await out(p,'Your response is private. Both people must enroll independently before linking: text LINK for instructions.','PRIVACY');return;}
  const data=checked(await db.from(T('whisper')).select('*').eq('participant_id',p.id)
    .eq('status','PRIVATE').not('answer','is',null).order('created_at',{ascending:false}).limit(1));
  const w=data?.[0];if(!w){await out(p,'Nothing to share yet. Text WHISPER to create a private response.','PRIVACY');return;}
  await update('participant',p.id,{pending_action:'CONFIRM_SHARE',pending_ref:w.id});
  await out(p,'Sharing preview: "'+String(w.answer).slice(0,420)+'" Reply CONFIRM SHARE to send it to your linked partner.','SHARE_PREVIEW');
}
async function confirmShare(p:Item) {
  const w=await find('whisper','id',p.pending_ref);
  const pair=p.couple_id?await find('couple','id',p.couple_id):null;
  const pid=pair && pair.status==='ACTIVE'?
    (pair.partner_a===p.id?pair.partner_b:pair.partner_a):null;
  const partner=pid?await find('participant','id',pid):null;
  if(!w||w.participant_id!==p.id||w.status!=='PRIVATE'||!partner||partner.status!=='OPTED_IN'){
    await out(p,'Sharing failed: no active consenting partner was found. Your answer remains private.','PRIVACY');return;
  }
  await out(partner,'A Love Whisper shared by your partner: '+String(w.answer).slice(0,880),'SHARED_WHISPER');
  await update('whisper',w.id,{status:'SHARED'});
  await update('participant',p.id,{pending_action:null,pending_ref:null});
  await out(p,'Your chosen Whisper was shared. Your other conversations remain private.','SHARE_DONE');
  await audit(p,'SHARE_WHISPER',w.id);
}
async function createLink(p:Item) {
  if(p.couple_id){await out(p,'You are already linked to a partner. Contact support to change a link.','LINK');return;}
  const codes='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const numbers=crypto.getRandomValues(new Uint8Array(6));
  const code=Array.from(numbers,x=>codes[x%codes.length]).join('');
  await add('link',{code,creator_id:p.id,expires_at:new Date(Date.now()+30*60000).toISOString()});
  await out(p,'Your 30-minute link code is '+code+'. Your partner must independently JOIN, then text LINK '+code+'. Linking never shares private messages automatically.','LINK');
}
async function requestLink(p:Item,code:string) {
  if(p.couple_id){await out(p,'You already have a partner linked.','LINK');return;}
  const l=await find('link','code',code);
  const creator=l?await find('participant','id',l.creator_id):null;
  if(!l||l.status!=='NEW'||new Date(l.expires_at).getTime()<=Date.now()||
    l.creator_id===p.id||!creator||creator.status!=='OPTED_IN'||creator.couple_id){
    await out(p,'Invalid or expired link code. Ask your partner to text LINK again.','LINK');return;
  }
  await update('link',l.id,{requester_id:p.id,status:'AWAITING_APPROVAL'});
  await out(creator,'A Threefold member ending in '+p.phone.slice(-4)+' requests to link. Reply APPROVE '+code+' to confirm. Private messages stay private.','LINK');
  await out(p,'Your link request was sent for approval.','LINK');
}
async function approveLink(p:Item,code:string) {
  if(p.couple_id){await out(p,'You already have a linked partner.','LINK');return;}
  const l=await find('link','code',code);
  const partner=l?.requester_id?await find('participant','id',l.requester_id):null;
  if(!l||l.creator_id!==p.id||l.status!=='AWAITING_APPROVAL'||
    new Date(l.expires_at).getTime()<=Date.now()||!partner||
    partner.status!=='OPTED_IN'||partner.couple_id){
    await out(p,'Link request invalid or expired.','LINK');return;
  }
  const pair=await add('couple',{partner_a:p.id,partner_b:partner.id});
  await update('participant',p.id,{couple_id:pair.id});
  await update('participant',partner.id,{couple_id:pair.id});
  await update('link',l.id,{status:'USED'});
  await out(p,'You are linked! Each person’s private chats remain separate. Sharing always requires an explicit choice.','LINKED');
  await out(partner,'Your couple link is approved. Your personal texts remain private.','LINKED');
  await audit(p,'LINKED',pair.id);
}
async function setReminder(p:Item,text:string) {
  // Explicit offset avoids DST ambiguity. Natural-language calendar parsing comes later.
  const m=/^REMIND\s+(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2}))\s*\|\s*(.{1,300})$/i.exec(text);
  if(!m){await out(p,'Format: REMIND 2026-11-02T19:00:00-06:00 | Ask about date night. Include your time-zone offset.','REMINDER');return;}
  const ms=Date.parse(m[1]);
  if(!Number.isFinite(ms)||ms<Date.now()+5*60000||ms>Date.now()+365*86400000){
    await out(p,'Reminder needs a valid date 5 minutes to 1 year ahead.','REMINDER');return;
  }
  await add('reminder',{participant_id:p.id,due_at:new Date(ms).toISOString(),body:m[2]});
  await out(p,'Reminder saved for '+m[1]+'. You can stop all future texts by replying STOP.','REMINDER');
}
async function openai(text:string, prior:Item[]):Promise<string>{
  const key=Deno.env.get('OPENAI_API_KEY');
  if(!key) return 'Threefold’s AI companion is not activated yet. Reply WHISPER or DATE to try the pilot activities.';
  const context=prior.reverse().map(m=>({role:m.kind==='AI_REPLY'?'assistant':'user',content:String(m.body).slice(0,1000)}));
  context.push({role:'user',content:text.slice(0,1000)});
  const response=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},
    body:JSON.stringify({
      model:Deno.env.get('OPENAI_MODEL')||'gpt-4.1-mini',store:false,max_output_tokens:250,
      instructions:'You are Threefold, an adult opt-in relationship adventure companion, not a counselor. Be brief (under 650 chars), engaging, curious and nonjudgmental. Emphasize shared novelty (Aron), bids and repair (Gottman), and autonomy and differentiated desire (Schnarch). Integrate faith naturally only if the participant invites it. Do not pressure any partner into sex, forgiveness, or sharing private messages. Avoid gathering sensitive details. Never imply access to another participant’s private chat. For threats, violence or abuse prioritize immediate safety and real-world support. Ask one question at most.',
      input:context
    })
  });
  if(!response.ok) throw Error('OpenAI response failed: HTTP '+response.status);
  const payload=await response.json();
  return (payload.output||[]).flatMap((o:any)=>o.type==='message'?
    (o.content||[]).filter((c:any)=>c.type==='output_text').map((c:any)=>c.text):[])
    .join(' ').trim().slice(0,650)||'Tell me a little more about what you are hoping to experience together.';
}
async function converse(p:Item,text:string) {
  const prior=checked(await db.from(T('message')).select('kind,body')
    .eq('participant_id',p.id).in('kind',['AI_USER','AI_REPLY'])
    .order('created_at',{ascending:false}).limit(8));
  const reply=await openai(text,prior);
  await add('message',{participant_id:p.id,couple_id:p.couple_id,
    direction:'IN',kind:'AI_USER',body:text.slice(0,1000),visibility:'PRIVATE'});
  await add('message',{participant_id:p.id,couple_id:p.couple_id,
    direction:'OUT',kind:'AI_REPLY',body:reply,visibility:'PRIVATE'});
  await out(p,reply,'AI');
}
async function processIncoming() {
  const events=checked(await db.rpc('threefold_claim_events',{p_limit:12}));
  for(const e of events||[]){
    try {
      if(e.event_type==='message.received'){
        const m=e.payload?.data?.payload;
        const phone=String(m?.from?.phone_number||'');
        const dest=String(m?.to?.[0]?.phone_number||'');
        if(!/^\+[1-9]\d{7,14}$/.test(phone)||dest!==from) throw Error('Phone mismatch');
        await incoming(phone,String(m?.text||'').trim().slice(0,2500),String(m?.id||e.id));
      }
      await update('event',e.id,{status:'DONE',processed_at:new Date().toISOString(),error:null});
    }catch(err){
      await update('event',e.id,{status:'REVIEW',error:String(err).slice(0,300)});
      console.error('Inbound event flagged for human review:',e.id);
    }
  }
}
async function processReminders() {
  const rows=checked(await db.from(T('reminder')).select('*').eq('status','PENDING')
    .lte('due_at',new Date().toISOString()).order('due_at').limit(15));
  for(const r of rows||[]){
    const p=await find('participant','id',r.participant_id);
    if(p?.status==='OPTED_IN') await out(p,'Your Threefold reminder: '+r.body,'REMINDER_DUE');
    await update('reminder',r.id,{status:p?.status==='OPTED_IN'?'QUEUED':'CANCELLED'});
  }
}
async function processOutbound() {
  const queue=checked(await db.rpc('threefold_claim_outbox',{p_limit:12}));
  for(const o of queue||[]){
    try {
      const p=await find('participant','id',o.participant_id);
      const exceptional=['STOP_ACK','HELP_ACK','JOIN_REQUEST','CONSENT_REQUEST'];
      if(!p||(p.status!=='OPTED_IN'&&!exceptional.includes(o.kind))){
        await update('outbox',o.id,{status:'SUPPRESSED'});continue;
      }
      const telnyxKey=Deno.env.get('TELNYX_API_KEY');
      if(!telnyxKey){ // Preserve queued messages until credentials are available.
        await update('outbox',o.id,{status:'QUEUED'});break;
      }
      // PROCESSING is held if a network call's outcome is uncertain. No blind retry.
      const response=await fetch('https://api.telnyx.com/v2/messages',{
        method:'POST',headers:{'Authorization':'Bearer '+telnyxKey,'Content-Type':'application/json'},
        body:JSON.stringify({from,to:o.phone,text:o.body})
      });
      if(!response.ok) throw Error('Telnyx HTTP '+response.status);
      const result=await response.json();
      await update('outbox',o.id,{status:'SENT',provider_message_id:String(result?.data?.id||'')});
      await add('message',{participant_id:p.id,couple_id:p.couple_id,
        direction:'OUT',kind:o.kind,body:o.body,
        visibility:o.kind==='SHARED_WHISPER'?'SHARED':'PRIVATE',
        provider_message_id:String(result?.data?.id||'')});
    }catch(err){
      await update('outbox',o.id,{status:'REVIEW',error:String(err).slice(0,250)});
      console.error('Outbound message marked REVIEW:',o.id);
    }
  }
}
Deno.serve(async (request:Request)=>{
  if(request.method!=='POST') return new Response('Not found',{status:404});
  const expected=Deno.env.get('THREEFOLD_JOB_SECRET');
  const given=request.headers.get('x-threefold-job-secret');
  if(!expected||!given||given.length!==expected.length) return new Response('Forbidden',{status:403});
  let diff=0;for(let i=0;i<expected.length;i++)diff|=expected.charCodeAt(i)^given.charCodeAt(i);
  if(diff) return new Response('Forbidden',{status:403});
  try {
    await processIncoming();await processReminders();await processOutbound();
    return Response.json({ok:true});
  } catch(err) {
    console.error('Threefold queue failed:',err instanceof Error?err.message:'unknown');
    return new Response('Queue failure',{status:503});
  }
});
