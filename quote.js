const QUOTE_ENDPOINT='https://script.google.com/macros/s/AKfycbwTzIrILD45IdEkBrju0S0YxSXBSC8J6qKUmVx39nSQu2JezDVoaSAjMu8gG7hfTbe_4w/exec';
const CONTACT_EMAIL='drbell@lonestarteacher.com';
const STUDENT_RATE=1.25;
const SETUP_FEE=300;
const DATA_FEE=300;
const MANAGED_FEE=500;
const COMPETITOR_RATE=2.79;
const params=new URLSearchParams(window.location.search);

function money(n){return '$'+Number(n||0).toLocaleString(undefined,{maximumFractionDigits:2});}
function formData(){return Object.fromEntries(new FormData(document.getElementById('quoteForm')).entries());}
function setField(id,v){const el=document.getElementById(id);if(el&&v){el.value=v;}}
function getParam(){for(const key of arguments){const v=params.get(key);if(v)return v;}return '';}
function isManaged(d){return d.support==='managed'||d.campusLead==='managed';}
function isDistrict(d){return (d.type||'').includes('District');}

function calculate(d){
  const students=Number(d.students||0);
  if(isDistrict(d))return {bookCall:true,students};
  const annualLicense=students*STUDENT_RATE;
  const setupFee=SETUP_FEE;
  const dataConnectionFee=d.dataConnection==='yes'?DATA_FEE:0;
  const managedFee=isManaged(d)?MANAGED_FEE:0;
  const yearOneTotal=annualLicense+setupFee+dataConnectionFee+managedFee;
  const renewalEstimate=annualLicense+managedFee;
  const competitorLicense=students*COMPETITOR_RATE;
  const licenseSavings=competitorLicense-annualLicense;
  return {bookCall:false,students,annualLicense,setupFee,dataConnectionFee,managedFee,yearOneTotal,renewalEstimate,competitorLicense,licenseSavings};
}

function googleNotice(d){
  if(d.googleWorkspace==='yes')return '';
  if(d.googleWorkspace==='no')return '<div class="notice bad">HallPass is designed around Google Workspace. If your school does not use Google, this needs a walkthrough before quoting.</div>';
  return '<div class="notice">Google Workspace needs to be confirmed before implementation.</div>';
}

function supportNote(d){
  if(isManaged(d))return 'Lone Star Teacher-managed support: teachers and campus staff can email Lone Star Teacher directly for routine support and changes.';
  return 'Campus-managed support: teachers send questions or changes to the campus lead. The campus lead can contact Lone Star Teacher for support.';
}

function renderCompetition(q){
  const box=document.getElementById('competitionBox');
  if(!box)return;
  if(q.bookCall){box.innerHTML='<strong>Competition estimate</strong><p class="small">District or multi-campus comparison should be reviewed on a walkthrough.</p>';return;}
  if(!q.students){box.innerHTML='<strong>Competition estimate</strong><p class="small">Enter student enrollment to compare against a common $2.79/student digital hall pass price.</p>';return;}
  box.innerHTML='<strong>Competition estimate</strong><p class="small">At $2.79/student, another digital hall pass may cost about <b>'+money(q.competitorLicense)+'/year</b>.</p><p class="small">HallPass license at $1.25/student: <b>'+money(q.annualLicense)+'/year</b>.</p><p class="small"><b>Estimated license savings: '+money(q.licenseSavings)+'/year</b>.</p>';
}

function renderEstimate(showMessage){
  const d=formData();
  const q=calculate(d);
  const result=document.getElementById('result');
  renderCompetition(q);
  if(q.bookCall){
    d.estimate='Book Call';d.yearOneTotal='Book Call';d.renewalEstimate='Book Call';
    result.innerHTML='<span>Estimated Year 1 total</span><strong>Book Call</strong><p class="small">District or multi-campus pricing needs a walkthrough.</p>';
  }else{
    Object.assign(d,q);
    d.estimate=q.yearOneTotal;
    result.innerHTML='<span>Estimated Year 1 total</span><strong>'+money(q.yearOneTotal)+'</strong><p class="small">Renewal estimate: '+money(q.renewalEstimate)+'/year. HallPass license: '+money(q.annualLicense)+' at $1.25/student.</p><div class="line"><span>Annual license</span><span>'+money(q.annualLicense)+'</span></div><div class="line"><span>Setup fee</span><span>'+money(q.setupFee)+'</span></div><div class="line"><span>Direct data/API connection</span><span>'+money(q.dataConnectionFee)+'</span></div><div class="line"><span>Managed support</span><span>'+money(q.managedFee)+'/year</span></div>'+googleNotice(d);
  }
  d.supportRoutingNotes=supportNote(d);
  d.notesForCrm='Rate=$1.25; Students='+d.students+'; AnnualLicense='+d.annualLicense+'; SetupFee='+d.setupFee+'; DataConnectionFee='+d.dataConnectionFee+'; ManagedFee='+d.managedFee+'; Year1='+d.yearOneTotal+'; Renewal='+d.renewalEstimate+'; CompetitorRate=$2.79; LicenseSavings='+d.licenseSavings+'; GoogleWorkspace='+d.googleWorkspace+'; CampusLead='+d.campusLead+'; LeadName='+(d.leadName||'')+'; LeadEmail='+(d.leadEmail||'')+'; DataConnection='+d.dataConnection+'; Support='+d.support+'; SupportRouting='+d.supportRoutingNotes+'; UserNotes='+(d.notes||'');
  const subject=encodeURIComponent('HallPass quote request - '+(d.campus||'Campus'));
  const body=encodeURIComponent(Object.entries(d).map(([k,v])=>k+': '+v).join('\n'));
  document.getElementById('emailLink').href='mailto:'+CONTACT_EMAIL+'?subject='+subject+'&body='+body;
  if(showMessage){const msg=document.getElementById('message');msg.className='notice';msg.style.display='block';msg.textContent='Submitting quote request...';}
  return d;
}

function applyPrefill(){
  setField('lead',getParam('lead','leadid','id'));
  setField('name',getParam('name','principal'));
  setField('email',getParam('email'));
  setField('district',getParam('district'));
  setField('campus',getParam('campus','school'));
  setField('students',getParam('students','enrollment'));
  setField('type',getParam('type','campustype'));
  setField('city',getParam('city'));
  setField('region',getParam('region','esc'));
  setField('features',getParam('features'));
  const campus=getParam('campus','school'), district=getParam('district'), students=getParam('students','enrollment');
  if(campus||district||students){
    document.getElementById('headline').textContent='Confirm your HallPass estimate.';
    document.getElementById('leadText').textContent='We pre-filled what we could from public campus directory information. Please confirm Google Workspace, support routing, and enrollment.';
    const notice=document.getElementById('prefillNotice');
    notice.style.display='block';
    notice.textContent='Pre-filled quote for '+(campus||'your campus')+(district?' in '+district:'')+(students?' using an estimated enrollment of '+Number(students).toLocaleString()+' students.':'.');
  }
  renderEstimate(false);
}

const form=document.getElementById('quoteForm');
form.addEventListener('input',()=>renderEstimate(false));
form.addEventListener('change',()=>renderEstimate(false));
form.addEventListener('reset',()=>setTimeout(()=>renderEstimate(false),0));
form.addEventListener('submit',async e=>{
  e.preventDefault();
  const d=renderEstimate(true);
  d.timestamp=new Date().toISOString();
  d.sourceUrl=window.location.href;
  d.notes=d.notesForCrm;
  const msg=document.getElementById('message');
  try{
    await fetch(QUOTE_ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify(d)});
    msg.className='notice ok';msg.style.display='block';msg.textContent='Quote request submitted. Adam will follow up.';
  }catch(err){
    msg.className='notice';msg.style.display='block';msg.textContent='The estimate was calculated, but submission failed. Please email Dr. Bell.';
  }
});

applyPrefill();
