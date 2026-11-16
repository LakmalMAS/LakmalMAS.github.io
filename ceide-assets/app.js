'use strict';

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg = name => '<svg aria-hidden="true"><use href="#i-'+name+'"/></svg>';
const asset = name => 'ceide-assets/'+name;
const external = 'target="_blank" rel="noopener noreferrer"';
const key = 'ceide.studio.v1';
const safeUrl = value => {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; }
  catch { return ''; }
};
let persist = true;
let state = {lessons:{}, quizzes:{}, saved:[], projects:[]};
try {
  const stored=JSON.parse(localStorage.getItem(key) || 'null');
  if (stored && typeof stored === 'object') {
    state.lessons=stored.lessons && typeof stored.lessons==='object' ? stored.lessons : {};
    state.quizzes=stored.quizzes && typeof stored.quizzes==='object' ? stored.quizzes : {};
    state.saved=Array.isArray(stored.saved) ? stored.saved.filter(id=>studios.some(s=>s.id===id)) : [];
    state.projects=Array.isArray(stored.projects) ? stored.projects.filter(p=>p && typeof p.id==='string' && typeof p.title==='string' && projectTypes.includes(p.category)) : [];
  }
} catch { persist=false; }
function save() {
  try { localStorage.setItem(key, JSON.stringify(state)); persist=true; }
  catch { persist=false; }
}

let toastTimer;
function note(message) {
  $('#toast').textContent=message;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{$('#toast').textContent='';},3300);
}
const storageNote = () => persist ? 'Saved in this browser. Export an HTML copy to share your portfolio.' : 'Browser storage is unavailable. Changes last for this visit. Export your portfolio before leaving.';
const dialogs = $$('.dialog');
let lastFocus;
function show(dialog, focus) {
  const open=dialogs.find(d=>d.open);
  if (open===dialog) {
    if(focus) $(focus,dialog)?.focus();
    return;
  }
  if (open) { open.close(); }
  else { lastFocus=document.activeElement; }
  dialog.showModal();
  if(focus) $(focus,dialog)?.focus();
}
dialogs.forEach(dialog=>{
  $('[data-close]',dialog).addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{
    if(e.target!==dialog) return;
    const bounds=dialog.getBoundingClientRect();
    if(e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close',()=>{
    if(dialogs.some(d=>d.open)) return;
    if(location.hash==='#studio') history.replaceState(null,'',location.pathname+location.search);
    if(lastFocus?.isConnected) lastFocus.focus({preventScroll:true});
  });
});

const courseDialog=$('#course-dialog');
const projectDialog=$('#project-dialog');
const studioDialog=$('#studio-dialog');
const searchDialog=$('#search-dialog');
let courseFilter='All courses', projectFilter='All projects', studioFilter='All studios';
let activeCourse, activeLesson=0, studioTab='Overview';
const finished=course=>(Array.isArray(state.lessons[course.id])?state.lessons[course.id]:[]).filter((i,idx,a)=>Number.isInteger(i)&&i>=0&&i<course.lessons.length&&a.indexOf(i)===idx);
const courseDone=c=>finished(c).length===c.lessons.length && Boolean(state.quizzes[c.id]);
const courseAction=c=>courseDone(c)?'Review course':finished(c).length?'Continue course':'Start course';
const artwork=(file, alt='', loading='lazy')=>'<img src="'+asset(file)+'" alt="'+esc(alt)+'" loading="'+loading+'" decoding="async" width="768" height="390">';
const filterBar=(container,choices,starting,update)=>{
  container.innerHTML=choices.map(name=>'<button class="filter" type="button" aria-pressed="'+(name===starting)+'" data-choice="'+esc(name)+'">'+esc(name)+'</button>').join('');
  container.addEventListener('click',e=>{
    const button=e.target.closest('button');
    if(!button) return;
    $$('button',container).forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    update(button.dataset.choice);
  });
};
function renderCourses() {
  const list=courses.filter(c=>courseFilter==='All courses'||c.tool===courseFilter);
  $('#course-count').textContent=list.length+' '+(list.length===1?'course':'courses');
  $('#course-grid').innerHTML=list.map(c=>{
    const done=finished(c).length;
    return '<article class="course-card"><div class="course-art">'+artwork(c.art+'.webp')+'<span class="art-label">'+esc(c.tool)+'</span></div><div class="course-body"><p class="card-meta">'+c.level+' · '+c.time+' min · '+c.lessons.length+' lessons</p><h3>'+esc(c.title)+'</h3><p>'+esc(c.description)+'</p>'+(done?'<progress class="course-progress" value="'+done+'" max="'+c.lessons.length+'" aria-label="'+done+' of '+c.lessons.length+' lessons complete"></progress>':'')+'<button type="button" class="text-link" data-course="'+c.id+'" aria-label="'+courseAction(c)+': '+esc(c.title)+'">'+courseAction(c)+svg('arrow')+'</button></div></article>';
  }).join('');
}
function openCourse(id) {
  const course=courses.find(c=>c.id===id);
  if(!course) return;
  activeCourse=course;
  const next=course.lessons.findIndex((_,i)=>!finished(course).includes(i));
  activeLesson=next<0?course.lessons.length:next;
  renderLesson();
  show(courseDialog,'[data-close]');
}
function renderLesson(focus) {
  const c=activeCourse, done=finished(c), lesson=c.lessons[activeLesson];
  const quizPassed=Boolean(state.quizzes[c.id]);
  const side=[...c.lessons.map(l=>l[0]),'Knowledge check'].map((title,i)=>{
    const check=done.includes(i)||(i===c.lessons.length&&quizPassed);
    return '<button class="lesson-tab" type="button" data-lesson="'+i+'"'+(i===activeLesson?' aria-current="step"':'')+'><span>'+ (check?svg('check'):'0'+(i+1)) +'</span>'+esc(title)+(check?'<span class="sr-only"> (complete)</span>':'')+'</button>';
  }).join('');
  let panel;
  if(lesson) {
    panel='<p class="card-meta">LESSON '+(activeLesson+1)+' / '+c.lessons.length+'</p><h3 tabindex="-1" id="lesson-title">'+esc(lesson[0])+'</h3><p>'+esc(lesson[1])+'</p><ol>'+lesson[2].map(step=>'<li>'+esc(step)+'</li>').join('')+'</ol><p class="lesson-exercise"><strong>Try it:</strong> '+esc(lesson[3])+'</p><button type="button" class="button button-dark" data-complete>'+(done.includes(activeLesson)?'Continue':'Mark complete &amp; continue')+svg('arrow')+'</button>';
  } else {
    panel='<p class="card-meta">KNOWLEDGE CHECK</p><h3 tabindex="-1" id="lesson-title">Check what you learned</h3><form id="quiz-form"><fieldset class="quiz"><legend>'+esc(c.quiz[0])+'</legend>'+c.quiz[1].map((text,i)=>'<label><input type="radio" name="answer" value="'+i+'"'+(quizPassed&&i===c.quiz[2]?' checked':'')+' required>'+esc(text)+'</label>').join('')+'</fieldset><button class="button button-dark" type="submit">Check answer '+svg('check')+'</button><p class="quiz-message" id="quiz-message" role="status">'+(quizPassed?'Correct. '+esc(c.quiz[3]):'')+'</p></form>';
  }
  $('#course-content').innerHTML='<p class="card-meta">'+esc(c.tool)+' · '+c.level+' · '+c.time+' MIN</p><h2 id="course-dialog-title">'+esc(c.title)+'</h2><p class="dialog-intro">'+esc(c.description)+'</p><div class="course-layout"><nav class="lesson-list" aria-label="Course lessons">'+side+'</nav><section class="lesson-panel" aria-labelledby="lesson-title">'+panel+'</section></div><div class="course-footer"><p class="micro result-count">'+done.length+' / '+c.lessons.length+' LESSONS COMPLETE'+(courseDone(c)?' · COURSE COMPLETE':'')+'</p><a class="text-link" href="'+references[c.tool]+'" '+external+'>Official '+esc(c.tool)+' resources '+svg('up')+'</a></div>';
  if(focus) $(focus,courseDialog)?.focus({preventScroll:true});
}
courseDialog.addEventListener('click',e=>{
  const nav=e.target.closest('[data-lesson]');
  if(nav) { activeLesson=Number(nav.dataset.lesson); renderLesson('[aria-current="step"]'); return; }
  if(!e.target.closest('[data-complete]')) return;
  const oldButton=$('[data-course="'+activeCourse.id+'"]');
  state.lessons[activeCourse.id]=[...new Set([...finished(activeCourse),activeLesson])];
  save();
  activeLesson++;
  renderCourses();
  if(lastFocus===oldButton) lastFocus=$('[data-course="'+activeCourse.id+'"]');
  renderLesson('#lesson-title');
});
courseDialog.addEventListener('submit',e=>{
  if(e.target.id!=='quiz-form') return;
  e.preventDefault();
  const value=new FormData(e.target).get('answer'), c=activeCourse;
  if(value===null) return;
  if(Number(value)!==c.quiz[2]) { $('#quiz-message').textContent='Try another answer. You can revisit the lessons on the left or above.'; return; }
  const oldButton=$('[data-course="'+c.id+'"]');
  state.quizzes[c.id]=true;
  save();
  renderCourses();
  if(lastFocus===oldButton) lastFocus=$('[data-course="'+c.id+'"]');
  renderLesson('#quiz-form button');
});

const personalArt={'Game design':'level','3D art':'prop',Animation:'motion',VFX:'lighting'};
const allProjects=()=>[...exampleProjects,...state.projects.map(p=>({...p,maker:'My Studio',kind:'On this device',image:personalArt[p.category]+'.webp',alt:'',detail:p.summary,url:safeUrl(p.url),urlLabel:'View project link'}))];
function renderProjects() {
  const list=allProjects().filter(p=>projectFilter==='All projects'||p.category===projectFilter);
  $('#project-count').textContent=list.length+' '+(list.length===1?'project':'projects');
  $('#project-grid').innerHTML=list.length?list.map(p=>'<article class="project-card"><div class="project-art">'+artwork(p.image,p.alt)+'<span class="art-label">'+esc(p.kind)+'</span></div><div class="project-body"><p class="card-meta">'+esc(p.category)+' / '+esc(p.maker)+'</p><h3>'+esc(p.title)+'</h3><p>'+esc(p.summary.length>170?p.summary.slice(0,167)+'…':p.summary)+'</p><button class="text-link" type="button" data-project="'+esc(p.id)+'" aria-label="View '+esc(p.title)+'">View project '+svg('up')+'</button></div></article>').join(''):'<p class="empty">No projects in this category yet. Add a project to see it here on this device.</p>';
}
function openProject(id) {
  const p=allProjects().find(item=>item.id===id);
  if(!p) return;
  $('#project-content').innerHTML='<div class="project-detail"><p class="card-meta">'+esc(p.category)+' / '+esc(p.maker)+'</p><h2 id="project-dialog-title">'+esc(p.title)+'</h2>'+artwork(p.image,p.alt,'eager')+'<p>'+esc(p.summary)+'</p>'+(p.detail!==p.summary?'<p>'+esc(p.detail)+'</p>':'')+(p.url?'<a class="button button-dark" href="'+esc(p.url)+'" '+external+'>'+esc(p.urlLabel)+' '+svg('up')+'</a>':'')+'</div>';
  show(projectDialog,'[data-close]');
}

function renderStudios() {
  const term=$('#studio-search').value.trim().toLowerCase();
  const list=studios.filter(s=>(studioFilter==='All studios'||s.category===studioFilter||(studioFilter==='Saved'&&state.saved.includes(s.id)))&&[s.name,s.location,s.focus,s.category].join(' ').toLowerCase().includes(term));
  $('#studio-count').textContent=list.length+' '+(list.length===1?'studio':'studios');
  $('#studio-grid').innerHTML=list.length?list.map(s=>'<article class="studio-card" id="studio-'+s.id+'" tabindex="-1"><div class="studio-top"><span class="studio-badge '+s.tone+'" aria-hidden="true">'+s.initials+'</span><button type="button" class="icon-button save-studio" data-save="'+s.id+'" aria-label="'+(state.saved.includes(s.id)?'Remove bookmark for ':'Save ')+esc(s.name)+'" aria-pressed="'+state.saved.includes(s.id)+'">'+svg('bookmark')+'</button></div><div><p class="card-meta">'+s.category+' · '+esc(s.location)+'</p><h3>'+esc(s.name)+'</h3><p>'+esc(s.focus)+'</p></div><a class="text-link" href="'+s.url+'" '+external+'>Official careers '+svg('up')+'</a></article>').join(''):'<p class="empty">'+(studioFilter==='Saved'&&!term?'Save a studio with its bookmark button to find it here.':'No studios match. Try a different search or filter.')+'</p>';
}
function toggleSave(id,where) {
  const adding=!state.saved.includes(id), s=studios.find(item=>item.id===id);
  if(!s) return;
  if(adding) state.saved.push(id); else state.saved=state.saved.filter(x=>x!==id);
  save();
  renderStudios();
  if(where==='dialog') { renderStudio(); $('.studio-tabs [aria-pressed="true"]',studioDialog)?.focus(); }
  else { ($('[data-save="'+id+'"]')||$('#studio-filters [aria-pressed="true"]'))?.focus({preventScroll:true}); }
  note(adding?(persist?'Saved ':'Added for this visit: ')+s.name:'Bookmark removed');
}

function studioHeader() {
  return '<p class="card-meta">YOUR WORKSPACE</p><h2 id="studio-title">My Studio</h2><p class="dialog-intro">'+storageNote()+'</p><div class="studio-tabs" aria-label="Workspace views">'+['Overview','Portfolio','Saved studios'].map(t=>'<button type="button" class="filter" data-studio-tab="'+t+'" aria-pressed="'+(t===studioTab)+'">'+t+'</button>').join('')+'</div>';
}
function renderStudio(removeId) {
  let content;
  if(studioTab==='Portfolio') {
    const item=state.projects.find(p=>p.id===removeId);
    const confirm=item?'<div class="delete-confirm"><p>Remove <strong>'+esc(item.title)+'</strong> from this browser?</p><div class="form-actions"><button class="button button-dark" type="button" data-delete-yes="'+esc(item.id)+'">Remove project</button><button class="button button-outline" type="button" data-portfolio>Cancel</button></div></div>':'';
    content='<div class="studio-panel-head"><h3>Your projects</h3><button class="button button-dark" type="button" data-new-project>Add project '+svg('plus')+'</button></div>'+confirm+(state.projects.length?'<div class="studio-list">'+state.projects.map(p=>'<div class="studio-row"><div><p>'+esc(p.title)+'</p><span>'+esc(p.category)+'</span></div><div class="row-actions"><button class="text-link" type="button" data-edit="'+esc(p.id)+'" aria-label="Edit '+esc(p.title)+'">Edit</button><button class="icon-button" type="button" data-delete="'+esc(p.id)+'" aria-label="Remove '+esc(p.title)+'">'+svg('close')+'</button></div></div>').join('')+'</div><div class="form-actions"><button class="button button-outline" type="button" data-export>Export portfolio '+svg('download')+'</button></div>':'<p class="empty">Add an entry to start your portfolio. Include a link to the finished work or describe what you made.</p>');
  } else if(studioTab==='Saved studios') {
    const selected=studios.filter(s=>state.saved.includes(s.id));
    content='<h3>Follow these studios</h3>'+(selected.length?'<div class="studio-list">'+selected.map(s=>'<div class="studio-row"><div><p>'+esc(s.name)+'</p><span>'+esc(s.category)+'</span></div><div class="row-actions"><a class="text-link" href="'+s.url+'" '+external+'>Careers '+svg('up')+'</a><button type="button" class="icon-button" data-save="'+s.id+'" aria-label="Remove bookmark for '+esc(s.name)+'">'+svg('close')+'</button></div></div>').join('')+'</div>':'<p class="empty">Use the bookmark buttons in the studio directory to build a list.</p>');
  } else {
    const started=courses.filter(c=>finished(c).length||state.quizzes[c.id]);
    const count=courses.reduce((sum,c)=>sum+finished(c).length,0);
    content='<div class="studio-summary"><div class="studio-stat"><strong>'+count+'</strong><span>Lessons done</span></div><div class="studio-stat"><strong>'+state.projects.length+'</strong><span>Portfolio entries</span></div><div class="studio-stat"><strong>'+state.saved.length+'</strong><span>Saved studios</span></div></div><h3 style="margin-top:17px">Your courses</h3>'+(started.length?'<div class="studio-list">'+started.map(c=>'<div class="studio-row"><div><p>'+esc(c.title)+'</p><span>'+finished(c).length+' / '+c.lessons.length+' lessons'+(courseDone(c)?' · Complete':'')+'</span></div><button class="text-link" type="button" data-course="'+c.id+'">'+courseAction(c)+svg('arrow')+'</button></div>').join('')+'</div>':'<p class="empty">Complete a lesson and it will appear here.</p>');
  }
  $('#studio-content').innerHTML=studioHeader()+content;
}
function openStudio(tab='Overview') {
  studioTab=tab;
  renderStudio();
  show(studioDialog,'[data-close]');
}
function editProject(id) {
  const p=state.projects.find(item=>item.id===id);
  studioTab='Portfolio';
  $('#studio-content').innerHTML='<p class="card-meta">MY STUDIO / PORTFOLIO</p><h2 id="studio-title">'+(p?'Edit project':'Add a project')+'</h2><p class="dialog-intro">'+storageNote()+'</p><form id="project-form" data-id="'+esc(p?.id)+'"><div class="form-grid"><label>Project title<input name="title" maxlength="80" required placeholder="e.g. Neon Alley" value="'+esc(p?.title)+'"></label><label>Category<select name="category">'+projectTypes.map(t=>'<option'+(p?.category===t?' selected':'')+'>'+t+'</option>').join('')+'</select></label><label>About this work<textarea name="summary" maxlength="650" required placeholder="What did you make, and what did you learn?">'+esc(p?.summary)+'</textarea></label><label>Project link (optional)<input name="url" type="url" maxlength="600" placeholder="https://…" value="'+esc(p?.url)+'"></label></div><div class="form-actions"><button class="button button-dark" type="submit">Save project '+svg('check')+'</button><button class="button button-outline" type="button" data-portfolio>Cancel</button></div></form>';
  show(studioDialog,'[name="title"]');
}
studioDialog.addEventListener('submit',e=>{
  const form=e.target;
  if(form.id!=='project-form') return;
  e.preventDefault();
  const data=new FormData(form), title=data.get('title').trim(), summary=data.get('summary').trim(), category=data.get('category'), raw=data.get('url').trim(), url=raw?safeUrl(raw):'';
  if(!title||!summary||(raw&&!url)) {
    const field=form.elements[!title?'title':!summary?'summary':'url'];
    field.setCustomValidity(raw&&!url&&field.name==='url'?'Use a link that starts with https:// or http://.':'Enter some text.');
    field.reportValidity();
    return;
  }
  if(!projectTypes.includes(category)) return;
  const id=form.dataset.id || 'p-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
  const entry={id,title,summary,category,url};
  const i=state.projects.findIndex(item=>item.id===id);
  if(i>=0) state.projects[i]=entry; else state.projects.push(entry);
  save();
  renderProjects();
  renderStudio();
  $('[data-edit="'+id+'"]',studioDialog)?.focus();
  note(persist?'Project saved in this browser.':'Project added for this visit.');
});
studioDialog.addEventListener('input',e=>{ if(typeof e.target.setCustomValidity==='function') e.target.setCustomValidity(''); });
function exportPortfolio() {
  if(!state.projects.length) return;
  const blocks=state.projects.map(p=>'<article><small>'+esc(p.category)+'</small><h2>'+esc(p.title)+'</h2><p>'+esc(p.summary)+'</p>'+(safeUrl(p.url)?'<a href="'+esc(safeUrl(p.url))+'">View project ↗</a>':'')+'</article>').join('');
  const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My Creative Portfolio</title><style>body{margin:0;background:#151223;color:#fff;font:16px/1.55 system-ui;}main{max-width:760px;margin:auto;padding:40px 20px;}h1{font-size:clamp(42px,8vw,82px);line-height:1;margin:8px 0 32px;letter-spacing:-.07em;}small,a{color:#d9c8ff;}article{border:1px solid #56436d;border-radius:12px;padding:22px;margin-bottom:14px;background:#211833;overflow-wrap:anywhere;}p{white-space:pre-line;color:#ded5ee;}a{font-weight:bold;}footer{color:#cfc1e4;margin-top:22px;}</style><main><small>CREATIVE WORK / PORTFOLIO</small><h1>My creative portfolio.</h1>'+blocks+'<footer>Built with CEIDE.</footer></main></html>';
  const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='ceide-portfolio.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  note('Portfolio HTML downloaded.');
}
const searchIndex=()=>[
  ...courses.map(c=>({id:c.id,title:c.title,meta:'Course · '+c.tool,search:c.description,type:'course'})),
  ...allProjects().map(p=>({id:p.id,title:p.title,meta:'Project · '+p.category,search:p.summary+' '+p.maker,type:'project'})),
  ...studios.map(s=>({id:s.id,title:s.name,meta:'Studio · '+s.category,search:s.location+' '+s.focus,type:'studio'})),
];
function renderSearch() {
  const words=$('#global-search').value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const pool=searchIndex();
  const matches=words.length?pool.filter(r=>words.every(w=>(r.title+' '+r.meta+' '+r.search).toLowerCase().includes(w))):pool.slice(0,3);
  $('#search-results').innerHTML='<p class="micro result-count" role="status">'+(words.length?matches.length+' '+(matches.length===1?'result':'results'):'Start with a course')+'</p>'+(matches.length?matches.map(r=>'<button type="button" class="search-result" data-result="'+r.type+'" data-id="'+esc(r.id)+'"><span>'+esc(r.title)+'<small>'+esc(r.meta)+'</small></span><span aria-hidden="true">↗</span></button>').join(''):'<p class="empty">Try a different course, project, or studio name.</p>');
}
function openSearch() {
  $('#global-search').value='';
  renderSearch();
  show(searchDialog,'#global-search');
}
$('#search-open').addEventListener('click',openSearch);
$('#global-search').addEventListener('input',renderSearch);
$('#global-search').addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'){e.preventDefault();$('.search-result')?.focus();}
  if(e.key==='Enter'){const first=$('.search-result'); if(first){e.preventDefault();first.click();}}
});
$('#search-results').addEventListener('keydown',e=>{
  if(!['ArrowDown','ArrowUp'].includes(e.key)) return;
  const rows=$$('.search-result'), i=rows.indexOf(document.activeElement);
  if(i<0) return;
  e.preventDefault();
  (e.key==='ArrowDown'?rows[(i+1)%rows.length]:rows[i-1]||$('#global-search')).focus();
});
$('#search-results').addEventListener('click',e=>{
  const button=e.target.closest('[data-result]');
  if(!button) return;
  const id=button.dataset.id;
  if(button.dataset.result==='course') openCourse(id);
  if(button.dataset.result==='project') openProject(id);
  if(button.dataset.result==='studio') {
    searchDialog.close();
    $('#studio-search').value='';
    $('#studio-filters button').click();
    const item=$('#studio-'+id);
    item?.scrollIntoView({block:'center'});
    lastFocus=item;
    item?.focus({preventScroll:true});
  }
});

document.addEventListener('click',e=>{
  const button=e.target.closest('button');
  if(!button) return;
  if(button.matches('[data-studio]')) openStudio();
  if(button.dataset.course) openCourse(button.dataset.course);
  if(button.dataset.project) openProject(button.dataset.project);
  if(button.dataset.save) toggleSave(button.dataset.save,studioDialog.contains(button)?'dialog':'list');
  if(button.matches('[data-new-project]')) editProject();
  if(button.dataset.edit) editProject(button.dataset.edit);
  if(button.dataset.studioTab) { studioTab=button.dataset.studioTab; renderStudio(); $('[data-studio-tab="'+studioTab+'"]')?.focus(); }
  if(button.matches('[data-portfolio]')) { openStudio('Portfolio'); $('[data-studio-tab="Portfolio"]',studioDialog)?.focus(); }
  if(button.dataset.delete) { renderStudio(button.dataset.delete); $('[data-delete-yes]')?.focus(); }
  if(button.dataset.deleteYes) {
    state.projects=state.projects.filter(p=>p.id!==button.dataset.deleteYes);
    save(); renderProjects(); renderStudio(); $('[data-new-project]',studioDialog)?.focus();
    note('Project removed.');
  }
  if(button.matches('[data-export]')) exportPortfolio();
});
const menu=$('#menu-button'), nav=$('#site-nav');
function setMenu(open) {
  menu.setAttribute('aria-expanded',String(open));
  menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  menu.innerHTML=svg(open?'close':'menu');
  nav.classList.toggle('open',open);
}
menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
nav.addEventListener('click',e=>{if(e.target.closest('a')) setMenu(false);});
document.addEventListener('click', e=>{if(!e.composedPath().includes(menu.closest('.nav-wrap'))&&menu.getAttribute('aria-expanded')==='true') setMenu(false);});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true') {setMenu(false);menu.focus();}
  if(e.key.toLowerCase()==='k'&&(e.ctrlKey||e.metaKey)&&!e.altKey){e.preventDefault();if(!searchDialog.open)openSearch();}
});

filterBar($('#course-filters'),['All courses','Blender','Unreal Engine','Maya'],courseFilter,n=>{courseFilter=n; renderCourses();});
filterBar($('#project-filters'),['All projects',...projectTypes],projectFilter,n=>{projectFilter=n; renderProjects();});
filterBar($('#studio-filters'),['All studios','Games','Animation','VFX','Saved'],studioFilter,n=>{studioFilter=n; renderStudios();});
$('#studio-search').addEventListener('input',renderStudios);
renderCourses(); renderProjects(); renderStudios();
function checkHash(){if(location.hash==='#studio'&&!studioDialog.open) openStudio();}
window.addEventListener('hashchange',checkHash);
checkHash();
