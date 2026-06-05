const e=document.getElementById('app');
fetch('data/goat-bot.json?x='+Date.now()).then(r=>r.json()).then(d=>{
const i=d.inventory||{};e.className='shell';e.textContent='Goat Bot LIVE | API '+d.status+' | '+d.bytes+' bytes | Inventory '+(i.head||0)+'/'+(i.capacity||40)+' | '+d.time;
}).catch(()=>e.textContent='Goat Bot data error');