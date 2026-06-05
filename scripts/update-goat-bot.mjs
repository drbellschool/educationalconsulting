import fs from'node:fs';
let k=process.env.K;if(!k)throw Error('Missing key');
let u='https://marsapi.ams.usda.gov/services/v1.2/reports/3659/Details?lastDays=30';
let h={};h['Author'+'ization']='Basic '+Buffer.from(k+':').toString('base64');
let r=await fetch(u,{headers:h});let t=await r.text();
fs.mkdirSync('goat/data',{recursive:true});
fs.writeFileSync('goat/data/goat-bot.json',JSON.stringify({ok:r.ok,status