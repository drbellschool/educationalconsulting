/* GoatBot plain-language dashboard refresh.
   Loaded after app.js and market-history-loader.js. Overrides dashboard and market pages only. */
(function(){
  function money2(n){return '$'+Number(n||0).toLocaleString(undefined,{maximumFractionDigits:0});}
  function safeNum(n){return Number(n||0);}
  function shortName(name){
    return String(name||'').replace('Livestock Auction - Sheep and Goat Sale','Livestock').replace('Sheep/Goat','Goat').replace('Producers Auction Yards','Producers').replace('Stockyards','Stockyards').trim();
  }
  function active(db){return (typeof activeGoats==='function')?activeGoats(db):(db.goats||[]).filter(g=>g.status!=='sold'&&g.status!=='dead');}
  function rows(db){return (typeof marketRows==='function')?marketRows(db):(db.markets||[]).map(m=>({id:m.id,name:m.name,q2:(m.q2&&m.q2[1])||0,q1:(m.q1&&m.q1[1])||0,spread:((m.q1&&m.q1[1])||0)-((m.q2&&m.q2[1])||0)}));}
  function spreadStatus(r){
    if(safeNum(r.q2)<=0)return {label:'No buy price',cls:'watch',plain:'The starting price is missing. Do not use this market for buy math yet.'};
    if(safeNum(r.q1)<=0)return {label:'No sell price',cls:'avoid',plain:'The finished-goat price is missing. Do not use this market to sell yet.'};
    if(r.spread>=90)return {label:'Best buy/sell gap',cls:'best',plain:'There is enough room between buying young and selling heavier to make this worth studying.'};
    if(r.spread>=40)return {label:'Good profit window',cls:'best',plain:'There may be room for profit after feed, health, and hauling costs.'};
    if(r.spread>=15)return {label:'Small margin',cls:'watch',plain:'Possible profit, but costs can eat this fast.'};
    if(r.spread>=0)return {label:'Tiny margin',cls:'watch',plain:'Too thin unless the goats are very cheap and close by.'};
    return {label:'Avoid',cls:'avoid',plain:'Finished goats are not paying enough above young-goat price here.'};
  }
  function buyRows(db){
    return rows(db).filter(r=>safeNum(r.q2)>0).sort((a,b)=>safeNum(a.q2)-safeNum(b.q2)).slice(0,5);
  }
  function sellRows(db){
    return rows(db).filter(r=>safeNum(r.q1)>0).sort((a,b)=>safeNum(b.q1)-safeNum(a.q1)).slice(0,5);
  }
  function opportunityRows(db){
    return rows(db).map(r=>Object.assign({},r,{status:spreadStatus(r)})).sort((a,b)=>safeNum(b.spread)-safeNum(a.spread));
  }
  function bestBuy(db){let r=buyRows(db)[0];return r?shortName(r.name||r.id):'Waiting on prices';}
  function bestSell(db){let r=sellRows(db)[0];return r?shortName(r.name||r.id):'Waiting on prices';}
  function bestSpread(db){let r=opportunityRows(db).filter(x=>x.status.cls==='best')[0]||opportunityRows(db)[0];return r?safeNum(r.spread):0;}
  function buyTable(db){
    const rs=buyRows(db);
    return `<section class="friendly-card friendly-table"><h2>Best places to buy young goats</h2><p class="muted">Look for 40–60 pound goats where the starting price is low.</p>${table(['Market','Young-goat price','What to do'],rs.map(r=>`<tr><td><b>${shortName(r.name||r.id)}</b></td><td>${money2(r.q2)} per 100 lb</td><td><span class="status-pill ${safeNum(r.q2)<=300?'status-best':'status-watch'}">${safeNum(r.q2)<=300?'Good place to start':'Watch for bargains'}</span></td></tr>`))}</section>`;
  }
  function sellTable(db){
    const rs=sellRows(db);
    return `<section class="friendly-card friendly-table"><h2>Best places to sell heavier goats</h2><p class="muted">Look for 70–90 pound goats where finished-goat prices are strong.</p>${table(['Market','Finished-goat price','What to do'],rs.map(r=>`<tr><td><b>${shortName(r.name||r.id)}</b></td><td>${money2(r.q1)} per 100 lb</td><td><span class="status-pill ${safeNum(r.q1)>=400?'status-best':'status-watch'}">${safeNum(r.q1)>=400?'Strong sell market':'Usable if costs fit'}</span></td></tr>`))}</section>`;
  }
  function opportunityTable(db){
    const rs=opportunityRows(db).slice(0,12);
    return `<section class="friendly-card friendly-table"><h2>Today’s goat flipping snapshot</h2><p class="muted">Buy young where prices are low. Sell older where prices are higher. The gap is the room you have to pay feed, medicine, fuel, and still keep profit.</p>${table(['Market','Buy young price','Sell older price','Room to grow','Plain-English decision'],rs.map(r=>`<tr><td><b>${shortName(r.name||r.id)}</b></td><td>${money2(r.q2)}</td><td>${money2(r.q1)}</td><td><b class="${r.status.cls==='avoid'?'badText':r.status.cls==='watch'?'warnText':'goodText'}">${r.spread>=0?'+':''}${money2(r.spread)}</b></td><td><span class="status-pill status-${r.status.cls}">${r.status.label}</span><br><small>${r.status.plain}</small></td></tr>`))}</section>`;
  }
  function table(headers,rowHtml){
    return `<div class="tableWrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rowHtml.join('')}</tbody></table></div>`;
  }
  function bars(db){
    const rs=opportunityRows(db).slice(0,10);
    const max=Math.max(1,...rs.map(r=>Math.abs(safeNum(r.spread))));
    return `<section class="friendly-card"><h2>Profit window by market</h2><p class="muted">Green means room to buy young and sell heavier. Red means stay away until the market changes.</p><div class="market-bars">${rs.map(r=>`<div class="market-bar"><b>${shortName(r.name||r.id)}</b><div class="bar-track"><div class="bar-fill ${r.spread<0?'bad':''}" style="width:${Math.max(4,Math.min(100,Math.abs(r.spread)/max*100))}%"></div></div><span class="bar-value ${r.spread<0?'badText':'goodText'}">${r.spread>=0?'+':''}${money2(r.spread)}</span></div>`).join('')}</div></section>`;
  }
  function simpleChart(db){
    const rs=opportunityRows(db).slice(0,6);
    const max=Math.max(1,...rs.flatMap(r=>[safeNum(r.q2),safeNum(r.q1)]));
    const groups=rs.map((r,i)=>{let x=55+i*115;let buyH=safeNum(r.q2)/max*150;let sellH=safeNum(r.q1)/max*150;let yBuy=190-buyH;let ySell=190-sellH;return `<rect class="buy" x="${x}" y="${yBuy}" width="28" height="${buyH}" rx="4"></rect><rect class="sell" x="${x+32}" y="${ySell}" width="28" height="${sellH}" rx="4"></rect><text x="${x+14}" y="${yBuy-8}" text-anchor="middle" class="label">${money2(r.q2)}</text><text x="${x+46}" y="${ySell-8}" text-anchor="middle" class="label">${money2(r.q1)}</text><text x="${x+30}" y="222" text-anchor="middle">${shortName(r.name||r.id).split(' ')[0]}</text>`}).join('');
    return `<section class="chart-panel"><h2>Buy young here. Sell older there.</h2><p class="muted">Green bar = young-goat price. Brown bar = heavier finished-goat price.</p><svg class="simple-chart" viewBox="0 0 760 240"><line x1="36" x2="735" y1="190" y2="190"></line>${groups}<circle cx="520" cy="25" r="7" class="buy"></circle><text x="534" y="30">Young goat price</text><rect x="640" y="18" width="14" height="14" rx="3" class="sell"></rect><text x="660" y="30">Older goat price</text></svg></section>`;
  }
  function explainer(){
    return `<section class="explainer-grid"><div class="friendly-card"><h2>What does “good profit window” mean?</h2><p>It means there is enough room between the price to buy a young goat and the price to sell a heavier goat that you might make money after normal costs.</p><div class="plain-formula">Profit = sale money − purchase cost − feed − health care − hauling</div><p class="muted">Do not buy just because the sell price is high. You make money when the gap is big enough and your costs stay controlled.</p></div><div class="friendly-card signal-list"><div class="signal-row"><span class="signal-dot good"></span><div><b>Green: good opportunity</b><span>Worth looking at goats if they are healthy and priced right.</span></div></div><div class="signal-row"><span class="signal-dot watch"></span><div><b>Yellow: be careful</b><span>You might make a little, but one vet bill or long haul can erase profit.</span></div></div><div class="signal-row"><span class="signal-dot bad"></span><div><b>Red: do not buy for flipping</b><span>The market is not giving enough room to buy young and sell heavier.</span></div></div></div></section>`;
  }
  function flipSteps(){
    return `<section class="friendly-card"><h2>How to flip goats</h2><div class="flip-steps"><div class="flip-step"><div class="step-num">1</div><b>Buy young</b><span>Look for healthy 40–60 pound goats where starting prices are low.</span></div><div class="flip-step"><div class="step-num">2</div><b>Grow them</b><span>Feed, deworm, watch health, and add weight without wasting money.</span></div><div class="flip-step"><div class="step-num">3</div><b>Sell heavier</b><span>Aim for 70–90 pounds at a market paying more for finished goats.</span></div><div class="flip-step"><div class="step-num">4</div><b>Keep the spread</b><span>Your profit is whatever remains after purchase, feed, health, and hauling.</span></div></div></section>`;
  }
  function goatWords(){
    return `<section class="friendly-card"><h2>What the goat words mean</h2><div class="goat-word"><div class="goat-pic">🐐</div><div><b>Kid</b><br><span>Young goat, usually under 1 year old. Common buying target.</span></div></div><div class="goat-word"><div class="goat-pic">🐐</div><div><b>Doe</b><br><span>Adult female goat. Can be used for breeding or meat.</span></div></div><div class="goat-word"><div class="goat-pic">🐐</div><div><b>Buck</b><br><span>Adult male goat. Used for breeding or meat.</span></div></div><div class="goat-word"><div class="goat-pic">🐐</div><div><b>Wether</b><br><span>Castrated male goat. Common meat animal.</span></div></div></section>`;
  }
  function tips(){
    return `<section class="friendly-card"><h2>How to think like a goat flipper</h2><div class="tip-list"><div>Buy where the starting price is low.</div><div>Sell where heavier goats are in demand.</div><div>Never ignore feed, health, auction, and fuel costs.</div><div>Do not buy just because a goat looks nice. Buy because the numbers work.</div><div>When the market is thin, wait for a better deal.</div></div></section>`;
  }
  function refreshedDashboard(db){
    document.body.classList.add('goatbot-friendly');
    const act=active(db);
    const buy=bestBuy(db), sell=bestSell(db), spread=bestSpread(db);
    return `<main class="friendly-dashboard"><section class="friendly-hero"><div class="friendly-tile"><div class="icon">🛒</div><div><b>Best place to buy young goats</b><strong>${buy}</strong><span>Lower starting price</span></div></div><div class="friendly-tile sell"><div class="icon">📈</div><div><b>Best place to sell older goats</b><strong>${sell}</strong><span>Higher finished-goat price</span></div></div><div class="friendly-tile profit"><div class="icon">💵</div><div><b>Best profit window</b><strong>${spread>=0?'+':''}${money2(spread)}</strong><span>Room to grow</span></div></div><div class="friendly-tile herd"><div class="icon">🐐</div><div><b>Active herd</b><strong>${act.length} of ${db.settings&&db.settings.capacity?db.settings.capacity:40} goats</strong><span>Keep room for bargains</span></div></div></section>${explainer()}<section class="opportunity-grid">${buyTable(db)}${sellTable(db)}${bars(db)}</section>${flipSteps()}<section class="opportunity-grid wide">${opportunityTable(db)}${simpleChart(db)}</section><section class="learn-grid">${goatWords()}${tips()}</section><div class="friendly-footer">Real goats. Real markets. Clear decisions.<small>Buy young. Grow smart. Sell heavier.</small></div></main>`;
  }
  function refreshedMarket(db){
    document.body.classList.add('goatbot-friendly');
    return `<main class="friendly-dashboard">${explainer()}<section class="opportunity-grid">${buyTable(db)}${sellTable(db)}${bars(db)}</section>${opportunityTable(db)}${simpleChart(db)}</main>`;
  }
  function install(){
    document.body.classList.add('goatbot-friendly');
    window.dashboardPage=refreshedDashboard;
    window.marketPage=refreshedMarket;
    if(typeof window.render==='function'){
      try{window.render();}catch(e){console.warn('GoatBot dashboard refresh render skipped',e);}
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else setTimeout(install,0);
})();
