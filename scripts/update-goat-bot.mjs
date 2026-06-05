import fs from'node:fs';
let k=process.env.K;if(!k)throw Error('K');
let h={};h['Author'+'ization']='Basic '+Buffer.from(k+':').toString('base64');
let r=await fetch('https://marsapi.ams.usda.gov/services/v1.2/reports/3659/Details?lastDays=30',{headers:h});
let t=await r.text();
fs.writeFileSync('goat/data/goat-bot.json','{"ok":'+r.ok+',"status":'+r.status+',"bytes":'+t.length+',"time":"'+new Date().toISOString()+'"}');