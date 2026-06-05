import fs from'node:fs';
let k=process.env.K;if(!k)throw Error('K');
let h={};h['Author'+'ization']='Basic '+Buffer.from(k+':').toString('base64');
let u='https://marsapi.ams.usda.gov/services/v1.2/reports/3659/Details';
let r=await fetch(u,{headers:h});
let t=await r.text();
let o={
  ok:r.ok,
  status:r.status,
  bytes:t.length,
  time:new Date().toISOString(),
  markets:[
    {
      id:'3659',
      name:'Salem Stockyards',
      state:'AR',
      ok:r.ok,
      status:r.status,
      bytes:t.length,
      role:'Local target'
    }
  ],
  watchlist:[
    {
      state:'LA',
      name:'Louisiana market',
      status:'Need reliable USDA goat report'
    }
  ],
  inventory:{
    capacity:40,
    head:0
  }
};
fs.writeFileSync('goat/data/goat-bot.json',JSON.stringify(o));
