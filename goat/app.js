const a=document.getElementById('app');
const el=(x,c)=>{let e=document.createElement('div');e.className=c||'';e.textContent=x;return e};
const card=(t,v)=>{let d=el('', 'card');d.append(el(t,'muted'),el(v,'big'));return d};
fetch('data/goat-bot.json?v='+Date.now()).then(r=>r.json()).then(d=>{let i=d.inventory||{};a.textContent='';a.className='shell';let top=el('', 'top');let h=el('', '');h.append(el('Goat Bot','title'),el('USDA regional market dashboard','mut