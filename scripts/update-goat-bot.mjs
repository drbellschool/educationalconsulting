import fs from'node:fs';
let k=process.env.K;if(!k)throw Error('K');
let defs=[['3659','Salem Stockyards','AR','Local target'],['1826','Pawnee Sale Barn','OK','Regional compare'],['2014','San Angelo','TX','Benchmark']];
let old={};try{old=JSON.parse(fs.readFileSync('goat/data/goat-bot.json','utf8'))}catch{}
let markets=[];
for(let d of defs){let [id,name,state,role]=d;let u=new URL('https://marsapi.ams.usda.gov/services/v1.2/reports/'+id+'/Details?lastDays