/* GoatBot plain-language dashboard refresh v2.
   Overrides dashboard and market pages only. No goat jargon unless explained. */
(function(){
  const money=n=>'$'+Number(n||0).toLocaleString(undefined,{maximumFractionDigits:0});
  const num=n=>Number(n||0);
  const short=n=>String(n||'').replace('Livestock Auction - Sheep and Goat Sale','Livestock').replace('Sheep/Goat','Goat').replace('Producers Auction Yards','Producers').replace('Stockyards','Stockyards').replace('Missouri Weekly Sheep/Goat Auction Summary','Missouri Weekly').trim();
  const active=db=>(typeof activeGoats==='function')?activeGoats(db):(db.goats||[]).filter(g=>g.status!=='sold'&&g.status!=='dead');
  const allRows=db=>((typeof marketRows==='function')?marketRows(db):(db.markets||[]).map(m=>({id:m.id,name:m.name,q2:(m.q2&&m.q2[1])||0,q1:(m.q1&&m.q1[1])||0,spread:((m.q1&&m.q1[1])||0)-((m.q2&&m.q2[1])||0)}))).map(r=>Object.assign({},r,{buy:num(r.q2),sell:num(r.q1),spread:num(r.q1)-num(r.q2)}));
  const buyMarkets=db=>allRows(db).filter(r=>r.buy>0).sort((a,b)=>a.buy-b.buy);
  const sellMarkets=db=>allRows(db).filter(r=>r.sell>0).sort((a,b)=>b.sell-a.sell);
  function bestRoutes(db){
    const buys=buyMarkets(db), sells=sellMarkets(db), out=[];
    buys.slice(0,7).forEach(b=>sells.slice(0,7).forEach(s=>{
      const gap=s.sell-b.buy;
      if(gap>0) out.push({buy:b,sell:s,gap,route:`${short(b.name||b.id)} → ${short(s.name||s.id)}`});
    }));
    return out.sort((a,b)=>b.gap-a.gap).slice(0,8);
  }
  function decision(gap){
    if(gap>=120)return ['Green light to study','best','Big room before feed, medicine, auction fees, and fuel. Still inspect the goats.'];
    if(gap>=70)return ['Good possible flip','best','Enough room to investigate if the goats are healthy and close enough.'];
    if(gap>=35)return ['Thin but possible','watch','Small window. One vet bill, death loss, or long haul can eat this.'];
    if(gap>0)return ['Too tight','watch','Not enough cushion unless the goats are unusually cheap.'];
    return ['Do not buy','avoid','No profit room.'];
  }
  function table(headers,rows){return `<div class="gb-table"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;}
  function sourceCard(db){
    const source=db.marketDataSource==='usda_price_history'?'USDA market history is connected':'Using fallback prices';
    const rows=(db.marketHistory||[]).reduce((a,r)=>a+num(r.count),0) || ((db.usda_price_history||[]).length);
    return `<section class="gb-source"><b>${source}</b><span>${rows?rows+' price rows loaded':'No price history rows found yet'} • Dashboard translates market prices into plain buy/sell decisions.</span></section>`;
  }
  function hero(db){
    const routes=bestRoutes(db), route=routes[0], buys=buyMarkets(db), sells=sellMarkets(db), act=active(db), cap=(db.settings&&db.settings.capacity)||40;
    return `<section class="gb-hero"><div class="gb-hero-copy"><h1>Rustic Root Farms GoatBot</h1><p>Buy young. Grow smart. Sell heavier.</p><small>No acronyms. No guessing. Just: where to buy, where to sell, and whether the gap is worth the risk.</small></div><div class="gb-hero-goats">🐐 🐐 🐐</div></section><section class="gb-tiles"><div class="gb-tile buy"><b>Buy young here</b><strong>${buys[0]?short(buys[0].name||buys[0].id):'Waiting on data'}</strong><span>${buys[0]?money(buys[0].buy)+' per 100 lb young goats':'Need young-goat price'}</span></div><div class="gb-tile sell"><b>Sell heavier here</b><strong>${sells[0]?short(sells[0].name||sells[0].id):'Waiting on data'}</strong><span>${sells[0]?money(sells[0].sell)+' per 100 lb heavier goats':'Need sell price'}</span></div><div class="gb-tile profit"><b>Best visible flip gap</b><strong>${route?'+'+money(route.gap):'$0'}</strong><span>${route?route.route:'Need buy and sell prices'}</span></div><div class="gb-tile herd"><b>Herd room</b><strong>${act.length} of ${cap} goats</strong><span>${cap-act.length} open spaces for bargains</span></div></section>`;
  }
  function explainer(){return `<section class="gb-explain"><div><h2>What am I trying to do?</h2><p><b>Buy young goats cheap.</b> Feed and care for them until they are heavier. Then <b>sell them into the market paying more for heavier goats.</b></p><div class="gb-formula">Profit = sell money − buy cost − feed − medicine − auction fees − hauling</div></div><div class="gb-signals"><div><i class="green"></i><b>Green</b><span>Worth studying today.</span></div><div><i class="yellow"></i><b>Yellow</b><span>Possible, but costs can erase it.</span></div><div><i class="red"></i><b>Red</b><span>Do not buy for a flip.</span></div></div></section>`;}
  function routeTable(db){
    const rs=bestRoutes(db);
    return `<section class="gb-card gb-main"><h2>Best buy-young → sell-heavier routes</h2><p>These compare cheap young-goat markets against stronger heavier-goat markets. This is the part that matters for flipping.</p>${table(['Rank','Buy young at','Sell heavier at','Price gap','Decision'],rs.map((r,i)=>{const d=decision(r.gap);return `<tr><td><b>#${i+1}</b></td><td>${short(r.buy.name||r.buy.id)}<small>${money(r.buy.buy)} per 100 lb</small></td><td>${short(r.sell.name||r.sell.id)}<small>${money(r.sell.sell)} per 100 lb</small></td><td><b class="gb-money">+${money(r.gap)}</b></td><td><span class="gb-pill ${d[1]}">${d[0]}</span><small>${d[2]}</small></td></tr>`}).join('')||[`<tr><td colspan="5">No usable buy/sell route yet. We need both young-goat and heavier-goat prices.</td></tr>`])}</section>`;
  }
  function buySellLists(db){
    const buys=buyMarkets(db).slice(0,6), sells=sellMarkets(db).slice(0,6);
    return `<section class="gb-split"><div class="gb-card"><h2>Cheapest places to buy young goats</h2><p>Target: healthy 40–60 lb goats. Lower is better, but avoid sick or poor animals.</p>${table(['Market','Young price','Plain meaning'],buys.map(r=>`<tr><td><b>${short(r.name||r.id)}</b></td><td>${money(r.buy)}</td><td>${r.buy<=250?'Cheap starting point':r.buy<=320?'Usable starting point':'Expensive; be picky'}</td></tr>`))}</div><div class="gb-card"><h2>Strongest places to sell heavier goats</h2><p>Target: 70–90 lb goats. Higher is better after hauling and auction costs.</p>${table(['Market','Heavier price','Plain meaning'],sells.map(r=>`<tr><td><b>${short(r.name||r.id)}</b></td><td>${money(r.sell)}</td><td>${r.sell>=430?'Strong sell market':r.sell>=360?'Good sell market':'Usable only if close'}</td></tr>`))}</div></section>`;
  }
  function barChart(db){
    const rs=bestRoutes(db).slice(0,6), max=Math.max(1,...rs.map(r=>r.gap));
    return `<section class="gb-card"><h2>Flip gap leaderboard</h2><p>The longer the bar, the more room you have before costs.</p><div class="gb-bars">${rs.map(r=>`<div class="gb-bar"><b>${r.route}</b><div><span style="width:${Math.max(6,r.gap/max*100)}%"></span></div><strong>+${money(r.gap)}</strong></div>`).join('')}</div></section>`;
  }
  function steps(){return `<section class="gb-card"><h2>The simple goat flip plan</h2><div class="gb-steps"><div><b>1. Buy young</b><span>Look for healthy 40–60 lb goats priced below the market average.</span></div><div><b>2. Grow them</b><span>Add weight with feed, clean water, deworming, and careful health checks.</span></div><div><b>3. Sell heavier</b><span>Move them when they hit 70–90 lb and a strong market is paying.</span></div><div><b>4. Keep the gap</b><span>The leftover money after all costs is the actual profit.</span></div></div></section>`;}
  function words(){return `<section class="gb-card"><h2>Goat words in plain English</h2><div class="gb-words"><p><b>Kid:</b> young goat. This is usually what you buy to grow.</p><p><b>Doe:</b> adult female goat.</p><p><b>Buck:</b> adult male goat.</p><p><b>Wether:</b> castrated male goat, often raised for meat.</p><p><b>Per 100 lb:</b> auction price unit. A 50 lb goat at $300 per 100 lb is about $150.</p></div></section>`;}
  function mathBox(db){
    const r=bestRoutes(db)[0];
    if(!r)return '';
    const youngLb=50, olderLb=80, buyEach=youngLb*r.buy.buy/100, sellEach=olderLb*r.sell.sell/100, gross=sellEach-buyEach;
    return `<section class="gb-card gb-math"><h2>Example using today’s best route</h2><p>Buy a 50 lb young goat at ${short(r.buy.name||r.buy.id)} and sell an 80 lb heavier goat at ${short(r.sell.name||r.sell.id)}.</p><div class="gb-calc"><div><span>Estimated buy cost</span><b>${money(buyEach)}</b></div><div><span>Estimated sell money</span><b>${money(sellEach)}</b></div><div><span>Gross room before costs</span><b>+${money(gross)}</b></div></div><small>This is not final profit. Feed, medicine, auction fees, death loss, and hauling still come out.</small></section>`;
  }
  function dashboard(db){document.body.classList.add('goatbot-friendly-v2');return `<main class="gb-wrap">${sourceCard(db)}${hero(db)}${explainer()}${routeTable(db)}${buySellLists(db)}${barChart(db)}${mathBox(db)}${steps()}${words()}<section class="gb-footer">Real goats. Real markets. Clear decisions.</section></main>`;}
  function market(db){document.body.classList.add('goatbot-friendly-v2');return `<main class="gb-wrap">${sourceCard(db)}${explainer()}${routeTable(db)}${buySellLists(db)}${barChart(db)}${mathBox(db)}</main>`;}
  function install(){document.body.classList.add('goatbot-friendly-v2');window.dashboardPage=dashboard;window.marketPage=market;if(typeof window.render==='function'){try{window.render();}catch(e){console.warn('GoatBot dashboard refresh render skipped',e);}}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else setTimeout(install,0);
})();
