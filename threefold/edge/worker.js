/**
 * Threefold ingress | Cloudflare Worker
 * Telnyx -> Ed25519 verified Worker -> HMAC authenticated Apps Script webhook.
 * All values below come from encrypted Worker secrets, never GitHub Pages.
 *
 * Required env: TELNYX_PUBLIC_KEY (hex, 32 bytes),
 * WEBHOOK_SHARED_SECRET (same as Apps Script), APPS_SCRIPT_URL.
 */
const encoder = new TextEncoder();

function decodeHex(hex) {
  if (!/^[0-9a-f]{64}$/i.test(hex || "")) throw new Error("Invalid Telnyx public key");
  return Uint8Array.from(hex.match(/.{2}/g), x => parseInt(x,16));
}
function decodeB64(s) {
  const bin=atob(s);
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}
function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2,"0")).join("");
}
async function verifySignature(raw, request, publicHex) {
  const signature=request.headers.get("telnyx-signature-ed25519");
  const timestamp=request.headers.get("telnyx-timestamp");
  if (!timestamp || !/^\d{10}$/.test(timestamp) || !signature) return false;
  if (Math.abs(Math.floor(Date.now()/1000)-Number(timestamp)) > 300) return false;
  let signatureBytes;
  try { signatureBytes=decodeB64(signature); } catch { return false; }
  if (signatureBytes.length!==64) return false;
  const key=await crypto.subtle.importKey("raw",decodeHex(publicHex),{name:"Ed25519"},false,["verify"]);
  return crypto.subtle.verify({name:"Ed25519"},key,signatureBytes,encoder.encode(timestamp+"|"+raw));
}
async function signPacket(value, secret) {
  const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return toHex(await crypto.subtle.sign("HMAC",key,encoder.encode(value)));
}
export default {
  async fetch(request, env) {
    const path=new URL(request.url).pathname;
    if(request.method==="GET" && path==="/health") return new Response("Threefold ingress online",{status:200});
    if(request.method!=="POST" || path!=="/telnyx") return new Response("Not found",{status:404});
    if(!env.TELNYX_PUBLIC_KEY || !env.WEBHOOK_SHARED_SECRET || !env.APPS_SCRIPT_URL)
      return new Response("Not configured",{status:503});
    if(Number(request.headers.get("content-length")||"0")>80000)
      return new Response("Payload too large",{status:413});
    try {
      const raw=await request.text();
      if(raw.length>80000) return new Response("Payload too large",{status:413});
      if(!(await verifySignature(raw,request,env.TELNYX_PUBLIC_KEY)))
        return new Response("Invalid signature",{status:401});
      const event=JSON.parse(raw);
      const id=String(event?.data?.id || event?.data?.payload?.id || "");
      if(!/^[a-zA-Z0-9_\-:.]{1,160}$/.test(id)) return new Response("Invalid event",{status:400});
      const timestamp=Math.floor(Date.now()/1000);
      const sig=await signPacket(timestamp+"."+id+"."+raw,env.WEBHOOK_SHARED_SECRET);
      const packet={timestamp,id,raw,sig};
      const response=await fetch(env.APPS_SCRIPT_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(packet),
        redirect:"follow",
        signal:AbortSignal.timeout(3600)
      });
      if(!response.ok) throw new Error("Google backend unavailable");
      const ack=await response.json();
      if(ack.ok!==true) throw new Error("Google queue rejected packet");
      // Acknowledge only once Apps Script has persisted or deduplicated the event.
      return new Response("Accepted",{status:200});
    } catch(err) {
      // 503 tells Telnyx to retry. No phone numbers, secrets, or message text in errors.
      console.error("Threefold ingress failed:",String(err?.message||err));
      return new Response("Temporary delivery failure",{status:503});
    }
  }
};