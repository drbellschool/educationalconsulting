import fs from 'node:fs';
const key=process.env.USDA_API_KEY;
if(!key)throw new Error('Missing USDA_API_KEY');
const reports=[['3659','Salem, AR'],['1826','Pawnee, OK'],['2014','San Angelo, TX']];
const auth='Basic '+Buffer.from(key+':').toString('base64');
const markets=[];
for(const [id,name] of reports){
 const url='https://marsapi.ams.usda.gov/services/v1.2/reports/'+id+'/Details?lastDays=30';
 const r=await fetch(url,{headers:{Authorization:auth