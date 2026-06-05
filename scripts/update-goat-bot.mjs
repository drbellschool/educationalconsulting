import fs from'node:fs';
let k=process.env.K;if(!k)throw Error('K');
let h={};h['Author'+'ization']='Basic '+Buffer.from(k+':').toString('base64');
let u='https://marsapi.ams.usda.gov/services/v1.2/reports/3659/Details';
let r=await fetch(u,{headers:h});
let t=await r.text();
let o={ok:r.ok,status:r.status,bytes:t.length,time:new Date().toISOString(),business:'Rustic Root Farms',inventory:{capacity:40,head:13,openSlots:27},