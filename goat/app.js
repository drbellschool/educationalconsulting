fetch('data/goat-bot.json').then(function(r){return r.json()}).then(function(d){
var inv=d.inventory||{};
var markets=d.markets||[];
var watch=d.watchlist||[];
app.className='shell';
app.innerHTML='<h1>Goat Bot</h1><div class="card"><h3>Status</h3><div class="big">'+(d.ok?'LIVE':'WATCH')+' '+(d.status||'')+'</div><p>Bytes: '+(d.bytes||'--')+'</p></div><div class="grid"><div class="card"><h3>Markets</h3><div class