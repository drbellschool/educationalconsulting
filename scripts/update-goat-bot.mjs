import fs from'node:fs';
let k=process.env.K;if(!k)throw Error('K');
let old={};try{old=JSON.parse(fs.readFileSync('goat/data/goat-bot.json','utf8'))}catch{}
let h={};h['Author'+'ization']='Basic '+Buffer.from(k+':').toString('base64');
let base='https://marsapi.ams.usda.gov/services/v1.2/reports/';
let defs=[['3659','Salem Stockyards','AR'],['1826','Pawnee Sale Barn','OK'],['2014','San Angelo','TX']];
let markets=[];
for(let x of defs){let r=await fetch(base+x[0]+'/Details