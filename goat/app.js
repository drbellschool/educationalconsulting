const e=document.getElementById('app');
fetch('data/goat-bot.json?x='+Date.now()).then(r=>r.json()).then(d=>{
let m=d.markets||[],i=d.inventory||{};
e.className='shell';
e.innerHTML='<h1>Goat Bot</h1><p class="good">USDA market command center</p><div class="grid"><div class="card"><h3>Status</h3><div class="big">'+(d.ok?'LIVE':'WATCH')+'</div><p>API '+d.status+'<br>'+d.bytes+' bytes</p></div><div class="card"><h3>Inventory</h3><div class="big">'+(i.head||0)+'/'+(i.capacity||40)+'</div></div><div class="card"><h