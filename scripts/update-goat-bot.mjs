import fs from'node:fs';
let k=process.env.K;if(!k)throw Error('Missing key K');
let ms=[['3659','Salem','AR'],['1826','Pawnee','OK'],['2014','San Angelo','TX']];
let h={};h['Author'+'ization']='Basic '+Buffer.from(k+':').toString('base64');
let now=new Date().toISOString();let markets=[];
for(let m of ms){let id=m[0],name=m[1],state=m[2],url='https://marsapi.ams.usda.gov/services/v1.2/reports/'+id+'/Details?lastDays=30';try{let r=await fetch(url,{