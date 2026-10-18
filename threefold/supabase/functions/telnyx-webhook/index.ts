// Telnyx signed webhook -> PostgreSQL inbox. Authentication is Ed25519, not Supabase JWT.
import { createClient } from 'npm:@supabase/supabase-js@2';

function requireEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error('Missing backend configuration: ' + name);
  return v;
}
function db() {
  const legacy = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const modern = Deno.env.get('SUPABASE_SECRET_KEYS');
  const secret = modern ? JSON.parse(modern).default : legacy;
  if (!secret) throw new Error('Missing Supabase server secret');
  return createClient(requireEnv('SUPABASE_URL'), secret, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
function fromHex(value: string): Uint8Array {
  if (!/^[0-9a-f]{64}$/i.test(value)) throw Error('Invalid Telnyx public key');
  return Uint8Array.from(value.match(/.{2}/g)!, (x) => parseInt(x, 16));
}
async function verified(request: Request, raw: string): Promise<boolean> {
  const timestamp = request.headers.get('telnyx-timestamp');
  const signature = request.headers.get('telnyx-signature-ed25519');
  if (!timestamp || !/^\d{10}$/.test(timestamp) || !signature) return false;
  if (Math.abs(Math.floor(Date.now()/1000) - Number(timestamp)) > 300) return false;
  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(atob(signature), c=>c.charCodeAt(0));
    if (bytes.length !== 64) return false;
  } catch { return false; }
  const key = await crypto.subtle.importKey(
    'raw', fromHex(requireEnv('TELNYX_PUBLIC_KEY')), { name: 'Ed25519' }, false, ['verify']
  );
  const signed = new TextEncoder().encode(timestamp + '|' + raw);
  return crypto.subtle.verify({ name:'Ed25519' }, key, bytes, signed);
}
Deno.serve(async (request: Request) => {
  if (request.method !== 'POST') return new Response('Not found',{status:404});
  try {
    const body = await request.text();
    if (body.length > 80000) return new Response('Payload too large', {status:413});
    if (!await verified(request,body)) return new Response('Invalid signature', {status:401});
    const event = JSON.parse(body);
    const id = String(event?.data?.id || '');
    const kind = String(event?.data?.event_type || '');
    if (!/^[A-Za-z0-9_\-:.]{1,160}$/.test(id) || !kind) return new Response('Invalid event', {status:400});
    const client=db();
    const {error} = await client.from('threefold_inbound_events').upsert(
      {id,event_type:kind,payload:event,status:'PENDING'},
      {onConflict:'id',ignoreDuplicates:true}
    );
    if(error) throw error;
    return new Response('Accepted',{status:200});
  } catch(err) {
    console.error('Inbound storage failure:', String(err instanceof Error ? err.name : 'error'));
    return new Response('Retry later',{status:503});
  }
});
