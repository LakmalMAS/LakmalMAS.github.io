'use strict';
const page = document.body.dataset.page;
const qs = s => document.querySelector(s);
const qsa = s => [...document.querySelectorAll(s)];
const escapeText = text => String(text).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let toastTimer, previousFocus, activeTopicId, clearedTopics;
let storageWorks = true;
let previewState = {wishlist:false,following:false,topics:[]};
try {
  const saved = JSON.parse(localStorage.getItem('ssb-store-preview-v1') || 'null');
  if(saved && typeof saved === 'object') {
    previewState.wishlist = saved.wishlist === true;
    previewState.following = saved.following === true;
    previewState.topics = Array.isArray(saved.topics) ? saved.topics.filter(t => t && typeof t.id === 'string' && typeof t.title === 'string' && typeof t.body === 'string').map(t => ({...t,author:typeof t.author === 'string' ? t.author : 'Local visitor',replies:Array.isArray(t.replies) ? t.replies.filter(r => r && typeof r.body === 'string') : []})) : [];
  }
} catch {storageWorks = false;}
function persist() {try {localStorage.setItem('ssb-store-preview-v1',JSON.stringify(previewState));} catch {storageWorks=false;}}
const isActive = name => page === name ? 'active' : '';
qs('#steam-header').innerHTML = `
<a class="store-skip" href="#store-content">Skip to page content</a>
<div class="preview-banner"><strong>UNOFFICIAL STORE PREVIEW</strong> Independent presentation mockup. No Steam login, purchases, or account connection.<a href="../serendib-showcase/">Back to game website ↗</a></div>
<header class="steam-global" id="top"><div class="steam-global-inner"><a class="steam-wordmark" href="index.html" aria-label="Steam-style showcase home"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="#d7d9db"/><path d="M7 40 25 48 43 28" fill="none" stroke="#171a21" stroke-width="9"/><circle cx="43" cy="24" r="13" fill="#171a21"/><circle cx="43" cy="24" r="8" fill="none" stroke="#d7d9db" stroke-width="3"/><circle cx="25" cy="45" r="10" fill="#171a21"/><path d="m7 39 17 8" stroke="#d7d9db" stroke-width="4"/><circle cx="25" cy="45" r="6" fill="none" stroke="#d7d9db" stroke-width="2"/></svg><span>STEAM<small>STORE CONCEPT</small></span></a><nav class="global-links" aria-label="Global navigation"><a class="${isActive('store')}" href="index.html">STORE</a><a class="${isActive('community')}" href="steam-community.html">COMMUNITY</a><a href="../serendib-showcase/#about">ABOUT</a><a class="${isActive('support')}" href="steam-support.html">SUPPORT</a></nav><div class="global-demo"><span>▣ &nbsp; PRESENTATION MODE</span>English &nbsp; | &nbsp; No account needed</div></div></header>
<div class="store-nav-wrap"><div class="wishlist-top"><button id="open-wishlist">Wishlist (<span id="wishlist-count">0</span>)</button></div><div class="store-nav"><nav class="store-nav-links" aria-label="Game preview navigation"><a class="${isActive('store')}" href="index.html">Store Page</a><a class="${isActive('news')}" href="steam-news.html">News & Updates</a><a class="${isActive('community')}" href="steam-community.html">Discussions</a><a class="${isActive('support')}" href="steam-support.html">Support</a></nav><form class="store-search" id="preview-search" role="search"><input type="search" id="store-search" placeholder="search this showcase" aria-label="Search this showcase" autocomplete="off" aria-controls="search-results" aria-expanded="false"><button aria-label="Search" type="submit">⌕</button><div class="search-results" id="search-results" hidden></div></form></div></div>`;
qs('main').id = 'store-content';
qs('#steam-footer').innerHTML = `<footer class="steam-footer"><div class="steam-footer-inner"><div class="steam-footer-brand"><strong>STUDIO 141</strong><span>SERENDIB STILL BREATHES / STORE PRESENTATION</span></div><p>Independent, unofficial Steam-style concept for presentation only. Steam and the Steam logo are trademarks of Valve Corporation. This site is not affiliated with or endorsed by Valve.</p><p>Wishlist, Follow, discussions, and replies in this preview are browser-local demonstrations. No purchases, logins, or messages to other players are made.</p><div class="steam-footer-links"><a href="../serendib-showcase/">Game Website</a><a href="index.html">Store Preview</a><a href="steam-news.html">News</a><a href="steam-community.html">Community</a><a href="steam-support.html">Support</a><a href="assets/serendib-press-kit.zip" download>Press Kit ↓</a></div></div></footer>`;
document.body.insertAdjacentHTML('beforeend',`<dialog class="steam-dialog" id="wishlist-dialog" aria-labelledby="wishlist-title"><div class="steam-dialog-header"><h2 id="wishlist-title">Your demo wishlist</h2><button data-dismiss aria-label="Close wishlist">×</button></div><div class="dialog-content" id="wishlist-content"></div></dialog><dialog class="steam-dialog" id="tag-dialog" aria-labelledby="tag-title"><div class="steam-dialog-header"><h2 id="tag-title">Explore this game</h2><button data-dismiss aria-label="Close game theme">×</button></div><div class="dialog-content"><div id="tag-content" class="tag-detail"></div></div></dialog><div id="preview-toast" role="status" aria-live="polite"></div>`);
function toast(message) {qs('#preview-toast').textContent=message;qs('#preview-toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>qs('#preview-toast').classList.remove('visible'),4000);}
function openDialog(dialog) {previousFocus=document.activeElement;dialog.showModal();document.body.classList.add('steam-modal-open');}
function setupDialog(dialog) {
  dialog.addEventListener('click',e=>{
    if(e.target.closest('[data-dismiss]')){dialog.close();return;}
    if(e.target!==dialog)return;const rect=dialog.getBoundingClientRect();
    if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();
  });
  dialog.addEventListener('close',()=>{document.body.classList.remove('steam-modal-open');previousFocus?.focus();});
}
qsa('dialog').forEach(setupDialog);
function renderWishlist() {
  qs('#wishlist-count').textContent=previewState.wishlist?'1':'0';
  qsa('[data-wishlist]').forEach(button=>{button.setAttribute('aria-pressed',String(previewState.wishlist));button.textContent=previewState.wishlist?'✓ On your demo wishlist':(button.classList.contains('green')?'Add to your wishlist':'＋ Add to your wishlist');});
  qsa('[data-follow]').forEach(button=>{button.setAttribute('aria-pressed',String(previewState.following));button.textContent=previewState.following?'✓ Following (demo)':'Follow';});
  qs('#wishlist-content').innerHTML=previewState.wishlist?`<div class="wishlist-item"><img src="assets/hero.webp" alt="Serendib Still Breathes"><div><h3>Serendib Still Breathes</h3><p>Coming soon · Studio 141 · Windows PC</p><button class="steam-button" id="remove-wishlist">Remove from demo wishlist</button></div></div><p class="page-note">Saved in this browser only. This is not your Steam wishlist.</p>`:`<div class="wishlist-empty"><p>Your demo wishlist is empty.</p><p class="page-note">Add Serendib Still Breathes from the store page to try it.</p><a class="steam-button" href="index.html">Visit store preview</a></div>`;
}
renderWishlist();
qs('#open-wishlist').addEventListener('click',()=>{renderWishlist();openDialog(qs('#wishlist-dialog'));});
document.addEventListener('click',e=>{
  const wishlist=e.target.closest('[data-wishlist]'),following=e.target.closest('[data-follow]');
  if(wishlist||e.target.closest('#remove-wishlist')){previewState.wishlist=wishlist?!previewState.wishlist:false;persist();renderWishlist();toast((previewState.wishlist?'Added to your demo wishlist.':'Removed from your demo wishlist.')+(storageWorks?' Saved in this browser only.':' Browser storage is unavailable; this change lasts for this page.'));}
  if(following){previewState.following=!previewState.following;persist();renderWishlist();toast((previewState.following?'Following this game in the demo.':'Demo follow removed.')+(storageWorks?' Saved locally.':' Browser storage is unavailable.'));}
});
const searchPages=[
{title:'Serendib Still Breathes',description:'Store page · Trailer, screenshots, game information',terms:'action survival zombies single player trailer screenshots game colombo',url:'index.html'},
{title:'News & announcements',description:'Development notes · Jungle Gorge and Colombo',terms:'news jungle gorge first look update development',url:'steam-news.html'},
{title:'Community discussions',description:'Try local discussions and replies',terms:'community hub topic discuss reply feedback',url:'steam-community.html'},
{title:'Game support',description:'Release, system requirements, media, and reports',terms:'support help release requirements download report pc hardware',url:'steam-support.html'}];
function searchShowcase(){const query=qs('#store-search').value.trim().toLowerCase(),results=qs('#search-results');results.hidden=!query;qs('#store-search').setAttribute('aria-expanded',String(!!query));if(!query)return;const found=searchPages.filter(item=>`${item.title} ${item.description} ${item.terms}`.toLowerCase().includes(query));results.innerHTML=found.length?found.map(item=>`<a href="${item.url}">${item.title}<small>${item.description}</small></a>`).join(''):'<p>No matching pages. Try “trailer”, “news”, or “support”.</p>';}
qs('#preview-search').addEventListener('submit',e=>{e.preventDefault();searchShowcase();});qs('#store-search').addEventListener('input',searchShowcase);
document.addEventListener('click',e=>{if(!e.target.closest('#preview-search')){qs('#search-results').hidden=true;qs('#store-search').setAttribute('aria-expanded','false');}});
qs('#store-search').addEventListener('keydown',e=>{if(e.key==='Escape'){qs('#search-results').hidden=true;qs('#store-search').setAttribute('aria-expanded','false');}});
const tagDetails={'Action Adventure':'A single-player, third-person journey from an isolated bunker through Jungle Gorge to the streets of Colombo. Exploration, traversal, and encounters shape the path forward.','Survival':'Move through a post-apocalyptic Sri Lanka and face encounters with zombies and hostile survivors. The game is in development; final systems will be detailed as they are confirmed.','Zombies':'The streets of Colombo are not empty. Zombies and hostile survivors form part of the game’s encounters in a changed Sri Lankan city.','Single-player':'Serendib Still Breathes is being developed as a single-player experience. No multiplayer or online co-op mode has been announced.','Exploration':'Explore bunker interiors, the moss-covered passages of Jungle Gorge, and the weathered boulevards of Colombo. See the places in the current build’s captures.'};
qsa('[data-tag]').forEach(button=>button.addEventListener('click',()=>{const tag=button.dataset.tag;qs('#tag-content').innerHTML=`<h3>${escapeText(tag)}</h3><p>${escapeText(tagDetails[tag])}</p><a class="steam-button" href="../serendib-showcase/#world">Explore the world ↗</a>`;openDialog(qs('#tag-dialog'));}));

if(page==='store'){
  const media=[
    {id:'trailer',title:'Cinematic trailer · 00:30',alt:'Play cinematic trailer',type:'video',poster:'colombo'},
    {id:'colombo',title:'Colombo remains',alt:'A deserted boulevard in Colombo',type:'Cinematic'},
    {id:'gorge',title:'Into the green',alt:'A survivor explores Jungle Gorge',type:'Gameplay'},
    {id:'bunker',title:'The last signal',alt:'A radio and lantern in the bunker',type:'Cinematic'},
    {id:'climbing',title:'Find a way forward',alt:'Third-person climbing in Jungle Gorge',type:'Gameplay'},
    {id:'tower',title:'Still standing',alt:'The Lotus Tower above Colombo',type:'Cinematic'},
    {id:'survivor',title:'Survive the streets',alt:'A survivor moves through Colombo',type:'Cinematic'}];
  let selectedMedia=0;
  const strip=qs('#thumbnail-strip');
  media.forEach((item,index)=>{
    const button=document.createElement('button');button.className=`thumbnail${index===0?' active':''}`;
    button.setAttribute('aria-label',`Show ${item.title}`);button.setAttribute('aria-pressed',String(index===0));
    button.innerHTML=`<img src="assets/${item.poster||item.id}.webp" alt="${item.alt}">${item.type==='video'?'<span aria-hidden="true">▶</span>':''}`;
    button.addEventListener('click',()=>selectMedia(index));strip.append(button);
  });
  function selectMedia(index){
    selectedMedia=(index+media.length)%media.length;const item=media[selectedMedia],video=qs('#store-video');
    video.pause();video.hidden=item.type!=='video';qs('#store-image-button').hidden=item.type==='video';
    if(item.type!=='video'){qs('#store-image').src=`assets/${item.id}.webp`;qs('#store-image').alt=item.alt;}
    qs('#stage-badge').textContent=item.type==='video'?'CINEMATIC TRAILER':`${item.type.toUpperCase()} CAPTURE`;
    qs('#media-caption').textContent=item.title;
    qsa('.thumbnail').forEach((button,i)=>{button.classList.toggle('active',i===selectedMedia);button.setAttribute('aria-pressed',String(i===selectedMedia));});
    qsa('.thumbnail')[selectedMedia].scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
    if(qs('#store-zoom').open)updateZoom();
  }
  qs('#previous-media').addEventListener('click',()=>selectMedia(selectedMedia-1));
  qs('#next-media').addEventListener('click',()=>selectMedia(selectedMedia+1));
  document.body.insertAdjacentHTML('beforeend',`<dialog class="steam-dialog zoom-dialog" id="store-zoom" aria-labelledby="zoom-title"><div class="steam-dialog-header"><h2 id="zoom-title">Screenshot</h2><button data-dismiss aria-label="Close full-size screenshot">×</button></div><div class="zoom-dialog-image"><img id="zoom-image" src="assets/colombo.webp" alt=""><button id="zoom-previous" aria-label="Previous screenshot">❮</button><button id="zoom-next" aria-label="Next screenshot">❯</button></div><div class="zoom-dialog-footer"><span id="zoom-caption"></span><a id="zoom-download" href="assets/colombo.webp" download>Download image ↓</a></div></dialog>`);
  setupDialog(qs('#store-zoom'));
  function updateZoom(){const item=media[selectedMedia];qs('#zoom-title').textContent=item.title;qs('#zoom-image').src=`assets/${item.id}.webp`;qs('#zoom-image').alt=item.alt;qs('#zoom-caption').textContent=`${item.type} capture · ${selectedMedia} of ${media.length-1}`;qs('#zoom-download').href=`assets/${item.id}.webp`;qs('#zoom-download').download=`Serendib-${item.id}.webp`;}
  function zoomStep(direction){let index=selectedMedia+direction;if(index<1)index=media.length-1;if(index>=media.length)index=1;selectMedia(index);}
  qs('#store-image-button').addEventListener('click',()=>{updateZoom();openDialog(qs('#store-zoom'));});
  qs('#zoom-previous').addEventListener('click',()=>zoomStep(-1));qs('#zoom-next').addEventListener('click',()=>zoomStep(1));
  qs('#store-zoom').addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();zoomStep(1);}if(e.key==='ArrowLeft'){e.preventDefault();zoomStep(-1);}});
  qs('#share-store').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(`${location.origin}${location.pathname}`);toast('Store preview link copied.');}catch{toast('Copy the page address from your browser to share this preview.');}});
}
if(page==='news'){
  qsa('[data-news-filter]').forEach(button=>button.addEventListener('click',()=>{
    qsa('[data-news-filter]').forEach(other=>{other.classList.toggle('active',other===button);other.setAttribute('aria-pressed',String(other===button));});
    qsa('[data-news-type]').forEach(article=>{article.hidden=button.dataset.newsFilter!=='all'&&article.dataset.newsType!==button.dataset.newsFilter;});
  }));
  if(location.hash){const article=document.getElementById(location.hash.slice(1));if(article?.matches('.news-article'))article.querySelector('details').open=true;}
}
if(page==='community'){
  function localDate(value){return new Date(value).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});}
  function renderTopics(){
    const query=qs('#topic-search').value.toLowerCase().trim();
    const topics=previewState.topics.filter(t=>`${t.title} ${t.body} ${t.author}`.toLowerCase().includes(query)).sort((a,b)=>qs('#topic-sort').value==='oldest'?a.created-b.created:b.created-a.created);
    const list=qs('#topic-list');list.replaceChildren();
    topics.forEach(topic=>{
      const row=document.createElement('button');row.className='topic-row';
      row.innerHTML=`<span class="topic-avatar" aria-hidden="true">${escapeText(topic.author[0]?.toUpperCase()||'L')}</span><span class="topic-info"><strong>${escapeText(topic.title)}</strong><small>${escapeText(topic.author)} · ${escapeText(localDate(topic.created))} · Local topic</small></span><span class="topic-replies">${topic.replies.length} ${topic.replies.length===1?'reply':'replies'}</span>`;
      row.addEventListener('click',()=>{activeTopicId=topic.id;renderTopicDetail();openDialog(qs('#topic-dialog'));});list.append(row);
    });
    if(!topics.length){const empty=document.createElement('div');empty.className='empty-state';empty.innerHTML=query?'<h3>No matching discussions</h3><p>Try a different search term.</p>':'<h3>The conversation starts with you.</h3><p>No local discussions yet. Use “Start a New Discussion” to create one.</p>';list.append(empty);}
    qs('#topic-total').textContent=`${topics.length} of ${previewState.topics.length} local discussions`;
  }
  function renderTopicDetail(){
    const topic=previewState.topics.find(t=>t.id===activeTopicId);if(!topic)return;
    qs('#topic-detail-title').textContent=topic.title;
    qs('#topic-detail').innerHTML=`<p class="topic-meta">${escapeText(topic.author)} · ${escapeText(localDate(topic.created))} · LOCAL DISCUSSION</p><div class="topic-body">${escapeText(topic.body)}</div><h3 class="reply-heading">${topic.replies.length} ${topic.replies.length===1?'reply':'replies'}</h3>${topic.replies.map(reply=>`<div class="reply-item"><p class="topic-meta">Local visitor · ${escapeText(localDate(reply.created))}</p><div class="topic-body">${escapeText(reply.body)}</div></div>`).join('')}`;
    qs('#reply-form').hidden=false;
  }
  qs('#new-topic').addEventListener('click',()=>openDialog(qs('#new-topic-dialog')));
  qs('#topic-form').addEventListener('submit',e=>{
    e.preventDefault();const data=new FormData(e.currentTarget);
    const title=String(data.get('title')).trim(),body=String(data.get('body')).trim(),author=String(data.get('author')).trim();
    if(title.length<5||body.length<10||!author){toast('Add a display name, a title of at least 5 characters, and a message of at least 10 characters.');return;}
    previewState.topics.push({id:crypto.randomUUID(),author,title,body,created:Date.now(),replies:[]});persist();qs('#topic-search').value='';renderTopics();
    qs('#new-topic-dialog').close();e.currentTarget.reset();toast(storageWorks?'Local discussion created. Nothing was posted to Steam.':'Discussion created for this page. Browser storage is unavailable.');
  });
  qs('#reply-form').addEventListener('submit',e=>{
    e.preventDefault();const body=String(new FormData(e.currentTarget).get('reply')).trim();if(body.length<3){toast('Write a reply of at least 3 characters.');return;}
    const topic=previewState.topics.find(t=>t.id===activeTopicId);if(!topic)return;
    topic.replies.push({body,created:Date.now()});persist();renderTopicDetail();renderTopics();e.currentTarget.reset();toast('Local reply added. Nothing was sent to other players.');
  });
  qs('#community-guide').addEventListener('click',()=>{
    activeTopicId=null;qs('#topic-detail-title').textContent='Welcome to the Serendib showcase community';
    qs('#topic-detail').innerHTML='<p class="topic-meta">STUDIO 141 / PRESENTATION GUIDE</p><div class="topic-body">This community hub is a working local prototype.\n\nStart a discussion, open it, and try adding a reply. Your topics are saved in this browser only. They are not sent to Steam, Studio 141, or other visitors.\n\nUse the search field to find your topics or change their sort order. “Clear demo topics” clears them and offers an Undo until the page is refreshed.\n\nFor confirmed game information, visit the store page, development notes, or support FAQ.</div>';
    qs('#reply-form').hidden=true;openDialog(qs('#topic-dialog'));
  });
  qs('#topic-search').addEventListener('input',renderTopics);qs('#topic-sort').addEventListener('change',renderTopics);
  qs('#clear-topics').addEventListener('click',()=>{
    if(clearedTopics){previewState.topics=clearedTopics;clearedTopics=null;qs('#clear-topics').textContent='Clear demo topics';toast('Local topics restored.');}
    else{clearedTopics=previewState.topics;previewState.topics=[];qs('#clear-topics').textContent='Undo clear';toast('Local topics cleared. Use Undo clear to restore them.');}
    persist();renderTopics();
  });
  renderTopics();
}
if(page==='support'){
  let reportUrl;
  qs('#report-form').insertAdjacentHTML('afterend','<div id="generated-report" hidden><h3>Your report is ready</h3><p class="page-note">Review the text, then download it. Nothing has been sent.</p><label>Report preview<textarea id="report-preview" rows="8" readonly></textarea></label><a id="report-download" class="steam-button blue" download="Serendib-Support-Report.txt">Download report ↓</a></div>');
  qs('#report-form button[type="submit"]').textContent='Generate report';
  qs('#support-search').addEventListener('input',e=>{
    const query=e.target.value.toLowerCase().trim();let visible=0;
    qsa('#support-faq details').forEach(item=>{const show=item.textContent.toLowerCase().includes(query);item.hidden=!show;if(show)visible++;if(query&&show)item.open=true;});
    qs('#support-no-results').hidden=visible!==0;
  });
  if(location.hash==='#requirements')qs('#requirements').open=true;
  qs('#report-form').addEventListener('submit',e=>{
    e.preventDefault();const data=new FormData(e.currentTarget);
    const summary=String(data.get('summary')).trim(),details=String(data.get('details')).trim();
    if(summary.length<5||details.length<10){toast('Add a summary of at least 5 characters and details of at least 10 characters.');return;}
    const content=`SERENDIB STILL BREATHES — SUPPORT REPORT\nStudio 141\n\nCreated: ${new Date().toISOString()}\nCategory: ${data.get('category')}\nSummary: ${summary}\n\nDETAILS\n${details}\n${data.has('browser')?`\nBROWSER INFORMATION\n${navigator.userAgent}\n`:''}\nThis report was generated locally. It has not been submitted or sent to anyone.\n`;
    if(reportUrl)URL.revokeObjectURL(reportUrl);
    reportUrl=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));
    qs('#report-download').href=reportUrl;
    qs('#report-preview').value=content;
    qs('#generated-report').hidden=false;
    toast('Report ready to review and download. Nothing has been sent.');
  });
}
