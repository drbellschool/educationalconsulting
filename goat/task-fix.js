// Restores the task page after the Goat Ops finance/health rewrite.
(function(){
  function d(){return new Date().toISOString().slice(0,10)}
  function plus(date,n){const x=new Date(date);x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)}
  function db(){return window.load ? window.load() : JSON.parse(localStorage.getItem('rrfGoatOpsV2')||'{}')}
  function persist(data){if(window.save) window.save(data); else localStorage.setItem('rrfGoatOpsV2',JSON.stringify(data))}
  function goats(data){return (data.goats||[]).filter(g=>g.status!=='sold'&&g.status!=='dead')}
  function goatName(data,id){return ((data.goats||[]).find(g=>g.id===id)||{}).tag||''}
  function taskKey(t){return [t.type,t.goatId||'',t.penId||'',t.dueDate].join('|')}
  function ensureTasks(data){
    data.tasks=data.tasks||[];
    const open=new Set(data.tasks.filter(t=>t.status!=='completed').map(taskKey));
    const add=t=>{if(!open.has(taskKey(t)))data.tasks.push({...t,id:'task-'+Math.random().toString(16).slice(2,8)+'-'+Date.now().toString(36),status:t.dueDate<d()?'overdue':'due',createdAt:new Date().toISOString()})};
    goats(data).forEach(g=>{
      add({type:'weigh',dueDate:g.nextWeighDate||plus(d(),7),priority:'normal',goatId:g.id,penId:g.currentPenId,title:'Weigh '+g.tag,description:'Record weight and update profit/hold/sell math.'});
      add({type:'health',dueDate:g.nextExamDate||plus(d(),7),priority:'normal',goatId:g.id,penId:g.currentPenId,title:'Health exam '+g.tag,description:'Check FAMACHA, appetite, stool, breathing, hooves, behavior, and follow-up date.'});
      if(g.withdrawalEndDate&&g.withdrawalEndDate>=d()) add({type:'withdrawal',dueDate:g.withdrawalEndDate,priority:'urgent',goatId:g.id,penId:g.currentPenId,title:g.tag+' withdrawal check',description:'Do not sell before withdrawal clears.'});
    });
    (data.pens||[]).forEach(p=>add({type:'pen',dueDate:plus(p.lastCleaned||d(),7),priority:'normal',penId:p.id,title:'Clean/check '+p.id,description:p.name||'Pen check'}));
    add({type:'inventory',dueDate:d(),priority:'normal',title:'Check feed, hay, minerals',description:'Confirm enough supply before buying more goats.'});
    return data.tasks;
  }
  function renderTasks(){
    if(location.hash!=='#tasks') return;
    const data=db(); ensureTasks(data); persist(data);
    const pending=(data.tasks||[]).filter(t=>t.status!=='completed').sort((a,b)=>(a.dueDate||'').localeCompare(b.dueDate||''));
    const done=(data.tasks||[]).filter(t=>t.status==='completed').sort((a,b)=>(b.completedAt||'').localeCompare(a.completedAt||'')).slice(0,10);
    const rows=pending.map(t=>`<tr><td>${t.dueDate||''}</td><td>${t.type||''}</td><td>${t.priority||''}</td><td><b>${t.title||''}</b><br><small>${t.description||''}</small></td><td>${goatName(data,t.goatId)} ${t.penId||''}</td><td><button class="btn secondary" data-complete-task="${t.id}">Done</button></td></tr>`).join('');
    const doneRows=done.map(t=>`<tr><td>${t.completedAt?String(t.completedAt).slice(0,10):''}</td><td>${t.type||''}</td><td>${t.title||''}</td><td>${goatName(data,t.goatId)} ${t.penId||''}</td></tr>`).join('');
    const html=`<main><section class="card"><div class="cardTitle"><h2>Tasks</h2><button class="btn secondary" data-refresh-tasks="1">Refresh Tasks</button></div><p class="muted">Tasks are generated from goat weigh dates, health follow-up dates, withdrawal dates, pen checks, and inventory checks.</p><div class="tableWrap"><table><thead><tr><th>Due</th><th>Type</th><th>Priority</th><th>Task</th><th>Goat/Pen</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="6">No open tasks.</td></tr>'}</tbody></table></div></section><section class="card"><h2>Recently Completed</h2><div class="tableWrap"><table><thead><tr><th>Completed</th><th>Type</th><th>Task</th><th>Goat/Pen</th></tr></thead><tbody>${doneRows||'<tr><td colspan="4">No completed tasks yet.</td></tr>'}</tbody></table></div></section></main>`;
    const shell=document.getElementById('app');
    if(shell){const tabs=shell.querySelector('nav.tabs');const header=shell.querySelector('header.topbar');shell.innerHTML=(header?header.outerHTML:'')+(tabs?tabs.outerHTML:'')+html+(window.footer?window.footer():'')}
  }
  document.addEventListener('click',e=>{
    const id=e.target && e.target.getAttribute && e.target.getAttribute('data-complete-task');
    if(id){const data=db();const t=(data.tasks||[]).find(x=>x.id===id);if(t){t.status='completed';t.completedAt=new Date().toISOString();persist(data);renderTasks();}}
    if(e.target && e.target.getAttribute && e.target.getAttribute('data-refresh-tasks')){const data=db();ensureTasks(data);persist(data);renderTasks();}
  });
  window.addEventListener('hashchange',()=>setTimeout(renderTasks,0));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(renderTasks,100));
})();
