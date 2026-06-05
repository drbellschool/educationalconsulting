fetch('data/goat-bot.json?v='+Date.now()).then(r=>r.json()).then(d=>{
app.className='shell';
let s=d.status||'Setup';
let b=d.bytes?Number(d.bytes).toLocaleString():'--';
let t=d.time?new Date(d.time).toLocaleString():'--';
let sig=d.ok?'LIVE':'WATCH';
app.innerHTML='<h1>Goat Bot</h1><p class=good>Private USDA market dashboard</p><div class=grid><div class=card>Capital<div class=big>$500</div></div><div class=card>USDA Status<div class=big>'+s+'</div></div><div class=card>Signal<div class=big>'+sig+'</div></div><div class=card>Data Pull<div class=big>'+b+'</div></div></div><p>Last refresh: '+t+'</p>';
});
