import fs from'node:fs';
let k=process.env.K;if(!k)throw Error('Missing key K');
let ms=[['3659','Salem','AR'],['1826','Pawnee','OK'],['2014','San Angelo','TX']];
let auth='Basic '+Buffer.from(k+':').toString('base64');
let now=new Date().toISOString(),markets=[];
for(let [id,name,state] of ms){let url=`https://marsapi.ams.usda.gov/services/v1.2/reports/${id}/Details?lastDays=30`;try{let r=await