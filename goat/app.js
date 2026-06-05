const e=document.getElementById('app');
fetch('data/goat-bot.json?v='+Date.now()).then(r=>r.json()).then(d=>{
const i=d.inventory||{};
e.className='shell';
e.innerHTML='<h1>Goat Bot</h1><p class="good">USDA market command center</p><div class="card"><h3>Status</h3><div class="big">'+(d.ok?'LIVE':'WATCH')+'</div><p>API: '+(d.status||'--')+'<br>Bytes: '+(d.bytes||'--')+'<br>Refresh: '+(d.time||'--')+'</p></div><div class="grid"><div