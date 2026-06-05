import fs from 'node:fs';
const key=process.env.USDA_API_KEY;
if(!key) throw new Error('Missing USDA_API_KEY secret');
const reports=[['3659','Salem, AR'],['1826','Pawnee, OK'],['2014','San Angelo, TX']];
const auth='Basic '+Buffer.from(key+':').toString('base64');
const now=new Date().toISOString();
const out={ok:true,generatedAt:now,status:'USDA refresh complete',recommendation:'Watch mode until enough sales are collected for backtesting.',confidence:'Setup',