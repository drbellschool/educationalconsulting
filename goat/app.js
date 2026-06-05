const a=document.getElementById('app');
const c=(t,v)=>{let d=document.createElement('div');d.className='card';d.textContent=t+': '+v;return d};
fetch('data/goat-bot.json').then(r=>r.json()).then(d=>{let i=d.inventory||{};a.textContent='';a.className='shell';a.append(c('Status',d.ok?'LIVE':'WATCH'),c('API',d.status),c('Bytes',d.bytes),c('Inventory',(i.head||0)+'/'+(i.capacity||40)))})