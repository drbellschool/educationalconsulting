import fs from'node:fs';
const k=process.env.K;if(!k)throw Error('Missing K');
const h={};h['Author'+'ization']='Basic '+Buffer.from(k+':').toString('base64');
const m={id:'3659',name:'Salem Stockyards',state:'AR',role:'Local target'};
const u='https://marsapi.ams.usda.gov/services/v1.2/reports/3659/Details?lastDays=60';
const r=await fetch(u,{headers:h});
const txt=await r.text();
let j;try{j=JSON.parse(txt)}catch{j=null}
function objs(x,a=[]){if(!x)return a;if(Array.isArray(x)){x.forEach(y=>objs