fetch('data/goat-bot.json?v='+Date.now()).then(r=>r.json()).then(d=>{
app.className='shell';
let f=n=>n?Number(n).toLocaleString():'--';
let tm=d.time?new Date(d.time).toLocaleString():'--';
let inv=d.inventory||{capacity:40,head:0};
let ms=d.markets||[];
let wl=d.watchlist||[];
let stat=d.ok?'LIVE':'WATCH';
let mhtml=ms.map(m=>'<div class=card><div class=tag>'+((m.state||'')+' '+(m.role||''))+'</div><h3>'+m.name+'</h3><div class=big>'+((m.ok?'OK ':'ERR ')+(m.status||''))+'</div><p>Report '+(m.id||'')+' • '+f