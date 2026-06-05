const e=document.getElementById('app');
function add(t,b,p){let d=document.createElement('div');d.className='card';let h=document.createElement('h3');h.textContent=t;let x=document.createElement('div');x.className='big';x.textContent=b;let q=document.createElement('p');q.textContent=p;d.append(h,x,q);return d}
fetch('data/goat-bot.json?x='+Date.now()).then(r=>r.json()).then(d=>{
 e.textContent='';e.className='shell';let h=document.createElement('h1');h.textContent='Goat Bot';