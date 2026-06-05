import fs from 'node:fs';
const key=process.env.USDA_API_KEY;if(!key)throw Error('Missing USDA_API_KEY');
const reports=[['3659','Salem, AR'],['1826','Pawnee, OK'],['2014','San Angelo, TX']];
const auth='Basic '+Buffer.from(key+':').toString('base64');
const markets=[];
for(const rep of reports){const id=rep[0],name=rep[1];try{const r=await fetch('https://marsapi.ams.usda.gov/services/v1.2/reports/'+id+'/Details