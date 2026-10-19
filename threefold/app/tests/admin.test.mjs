import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";
import admin from "../api/admin.mjs";

const URL="https://threefold-preview.vercel.app/api/admin";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const password="A-Very-Long-Private-Demo-Password-For-Testing";
const secret="not-a-production-key-0123456789-testing-only-0123456789";
const previous={};
for(const k of ["THREEFOLD_ADMIN_PASSWORD","THREEFOLD_SESSION_SECRET","OPENAI_API_KEY","TELNYX_API_KEY","TELNYX_FROM_NUMBER","OPENAI_MODEL"]){
 previous[k]=process.env[k];delete process.env[k];
}
const priorFetch=globalThis.fetch;
function resetEnvironment(){
 for(const k of Object.keys(previous))delete process.env[k];
 globalThis.fetch=priorFetch;
}
test.after(()=>{resetEnvironment();for(const [k,v] of Object.entries(previous))if(v!==undefined)process.env[k]=v;});
function req(method="GET",data,opts={}){
  return new Request(URL,{method,
    headers:{...(method==="POST"?{"origin":"https://threefold-preview.vercel.app",
      "Content-Type":"application/json","X-Threefold-Admin":"1"}:{}),
      ...(opts.headers||{})},
    ...(method==="POST"?{body:JSON.stringify(data)}:{})
  });
}
const call=async(request)=>{const res=await admin.fetch(request);return {res,body:await res.json()};};
const withCookie=(action,cookie,other={})=>req("POST",{action,...other},{headers:{cookie}});

test("no configuration fails closed and never exposes provider info",async()=>{
 const {res,body}=await call(req());
 assert.equal(res.status,200);
 assert.equal(body.authenticated,false);
 assert.equal(body.adminConfigured,false);
 assert.equal("services" in body,false);
 const login=await call(req("POST",{action:"login",password}));
 assert.equal(login.res.status,503);
 assert.equal(login.res.headers.get("set-cookie"),null);
});
test("reject requests lacking same-origin and CSRF header",async()=>{
 process.env.THREEFOLD_ADMIN_PASSWORD=password;
 process.env.THREEFOLD_SESSION_SECRET=secret;
 const a=await call(req("POST",{action:"login",password},{headers:{origin:"https://evil.example"}}));
 assert.equal(a.res.status,403);
 const b=await call(req("POST",{action:"login",password},{headers:{"X-Threefold-Admin":"0"}}));
 assert.equal(b.res.status,403);
});
test("reject invalid password, then set HttpOnly strict signed cookie",async()=>{
 const bad=await call(req("POST",{action:"login",password:"wrong password"}));
 assert.equal(bad.res.status,401);
 const good=await call(req("POST",{action:"login",password}));
 assert.equal(good.res.status,200);
 assert.equal(good.body.authenticated,true);
 const c=good.res.headers.get("set-cookie");
 assert.match(c,/HttpOnly/);assert.match(c,/Secure/);assert.match(c,/SameSite=Strict/);
 assert.match(c,/Path=\/api\/admin/);
 globalThis.validCookie=c.split(";")[0];
 const state=await call(req("GET",null,{headers:{cookie:globalThis.validCookie}}));
 assert.equal(state.body.authenticated,true);
 assert.equal(state.body.services.messaging.enabled,false);
 assert.equal(state.body.services.openai.configured,false);
 const tampered=await call(req("GET",null,{headers:{cookie:globalThis.validCookie+"tamper"}}));
 assert.equal(tampered.body.authenticated,false);
});
test("provider checks require valid session",async()=>{
 const noSession=await call(req("POST",{action:"check-openai"}));
 assert.equal(noSession.res.status,401);
 const ai=await call(withCookie("check-openai",globalThis.validCookie));
 assert.equal(ai.body.ok,false);
 assert.match(ai.body.message,/not configured/i);
 const sms=await call(withCookie("check-telnyx",globalThis.validCookie));
 assert.equal(sms.body.ok,false);
 assert.match(sms.body.message,/not configured/i);
});
test("connection tests use server-only credentials and never transmit SMS",async()=>{
 process.env.OPENAI_API_KEY="test-ai-key-fake";
 process.env.TELNYX_API_KEY="test-telnyx-key-fake";
 process.env.TELNYX_FROM_NUMBER="+19036090465";
 let aiCalls=0,telnyxCalls=0,sendAttempts=0;
 globalThis.fetch=async(input,init)=>{
   if(String(input).includes("openai.com")){
     aiCalls++;
     assert.equal(init.method,"POST");
     assert.match(init.headers.Authorization,/test-ai-key-fake/);
     const payload=JSON.parse(init.body);
     assert.equal(payload.store,false);
     assert.ok(payload.max_output_tokens<=180);
     return new Response(JSON.stringify({model:"gpt-4.1-mini",
       output:[{type:"message",content:[{type:"output_text",text:"A small adventure awaits."}]}],
       usage:{input_tokens:15,output_tokens:5}}),{status:200});
   }
   if(String(input).includes("telnyx.com")){
     telnyxCalls++;
     if(init.method!=="GET")sendAttempts++;
     assert.equal(init.method,"GET");
     assert.ok(String(input).includes("/messaging_profiles"));
     return new Response(JSON.stringify({data:[{id:"demo-profile",name:"Pilot"}]}),{status:200});
   }
   throw Error("Unexpected outbound request "+input);
 };
 const ai=await call(withCookie("check-openai",globalThis.validCookie));
 assert.equal(ai.body.ok,true);
 const rehearsal=await call(withCookie("try-openai",globalThis.validCookie,{prompt:"Give two fictional spouses a fun idea."}));
 assert.equal(rehearsal.body.ok,true);
 assert.equal(rehearsal.body.output,"A small adventure awaits.");
 const sms=await call(withCookie("check-telnyx",globalThis.validCookie));
 assert.equal(sms.body.ok,true);
 assert.equal(sms.body.profileCountReturned,1);
 assert.equal(aiCalls,2);assert.equal(telnyxCalls,1);assert.equal(sendAttempts,0);
 assert.equal(JSON.stringify(sms.body).includes("test-telnyx-key-fake"),false);
});
test("admin html is noindex and the script has no inline secrets",()=>{
 const html=readFileSync(resolve(root,"admin/index.html"),"utf8");
 const js=readFileSync(resolve(root,"admin/admin.js"),"utf8");
 const config=JSON.parse(readFileSync(resolve(root,"vercel.json"),"utf8"));
 assert.match(html,/noindex,nofollow/);
 assert.match(html,/type="password"/);
 assert.match(html,/Customer SMS stays disabled/);
 assert.doesNotMatch(html,/\<script(?![^>]*src)/i);
 assert.doesNotMatch(js,/sk-proj-|key_[0-9a-z]{20}/i);
 assert.equal(config.headers.some(x=>x.source==="/admin/(.*)"&&x.headers.some(h=>h.key==="Content-Security-Policy")),true);
});
