'use strict';
const locations = [
  {id:'bunker',title:'The bunker',kicker:'THE LAST SIGNAL',heading:'Every journey<br> starts in silence.',description:'A radio. A lantern. A way out. Deep inside the bunker, the outside world feels impossibly far away. This is where the journey begins.',alt:'A lantern lights a radio inside the isolated bunker'},
  {id:'jungle',title:'Jungle Gorge',kicker:'INTO THE GREEN',heading:'The wild has<br> found its way back.',description:'Moss-covered stone. Tangled roots. A path through the gorge. Beyond the bunker, the island is alive with a wilderness that has reclaimed its own.',alt:'A mossy passage winds through the rocky Jungle Gorge'},
  {id:'colombo',title:'Colombo',kicker:'THE CITY REMAINS',heading:'Familiar streets.<br> Unfamiliar silence.',description:'The Lotus Tower still watches over Colombo. Below it, empty boulevards and weathered buildings tell another story. The city is waiting. So are the dangers within it.',alt:'A deserted boulevard between the overgrown buildings of Colombo'}
];
const captures = [
  {id:'colombo',title:'Colombo remains',category:'cinematic',alt:'A deserted boulevard runs between the weathered buildings of Colombo'},
  {id:'gorge',title:'Into the green',category:'gameplay',alt:'A survivor stands in shallow water between moss-covered rocks in Jungle Gorge'},
  {id:'bunker',title:'The last signal',category:'cinematic',alt:'A radio and a glowing lantern inside the bunker workshop'},
  {id:'climbing',title:'Find a way forward',category:'gameplay',alt:'Third-person traversal across the cliffs in Jungle Gorge'},
  {id:'tower',title:'Still standing',category:'cinematic',alt:'The Lotus Tower rises above unfinished buildings in Colombo'},
  {id:'survivor',title:'Survive the streets',category:'cinematic',alt:'A survivor moves through the streets of post-apocalyptic Colombo'}
];
const $ = (s) => document.querySelector(s);
let currentLocation = 0;
let currentCapture = 0;
let viewerItems = captures;
let returnFocus = null;
let toastTimeout;

function notify(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => $('#toast').classList.remove('visible'), 3500);
}
function closeNavigation() {
  $('#main-nav').classList.remove('open');
  $('.menu-toggle').setAttribute('aria-expanded', 'false');
  $('.menu-toggle').setAttribute('aria-label', 'Open navigation');
}
$('.menu-toggle').addEventListener('click', () => {
  const open = $('.menu-toggle').getAttribute('aria-expanded') !== 'true';
  $('.menu-toggle').setAttribute('aria-expanded', String(open));
  $('.menu-toggle').setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  $('#main-nav').classList.toggle('open', open);
});
$('#main-nav').addEventListener('click', e => {if (e.target.closest('a')) closeNavigation();});
document.addEventListener('keydown', e => {if(e.key === 'Escape') closeNavigation();});
document.addEventListener('click', e => {if (!e.target.closest('.header')) closeNavigation();});

function setLocation(index, focus = false) {
  currentLocation = index;
  const location = locations[index];
  document.querySelectorAll('[data-location]').forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
    if (focus && i === index) tab.focus();
  });
  $('#world-image').src = `assets/${location.id}.webp`;
  $('#world-image').alt = location.alt;
  $('#world-counter').textContent = `0${index + 1} / 03`;
  $('#world-kicker').textContent = location.kicker;
  $('#world-heading').innerHTML = location.heading;
  $('#world-description').textContent = location.description;
  $('#location-detail').setAttribute('aria-labelledby', `tab-${location.id}`);
}
document.querySelectorAll('[data-location]').forEach(tab => {
  tab.addEventListener('click', () => setLocation(Number(tab.dataset.location)));
  tab.addEventListener('keydown', e => {
    let next;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (currentLocation + 1) % locations.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (currentLocation + locations.length - 1) % locations.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = locations.length - 1;
    if (next !== undefined) {e.preventDefault(); setLocation(next, true);}
  });
});

function showDialog(dialog) {
  returnFocus = document.activeElement;
  dialog.showModal();
  document.body.classList.add('modal-open');
}
document.querySelectorAll('[data-trailer]').forEach(button => button.addEventListener('click', () => {
  showDialog($('#trailer-dialog'));
  $('#trailer-video').play().catch(() => {});
}));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (dialog.id === 'trailer-dialog') $('#trailer-video').pause();
    document.body.classList.remove('modal-open');
    returnFocus?.focus();
  });
});

function renderGallery(filter = 'all') {
  const items = captures.filter(item => filter === 'all' || item.category === filter);
  const gallery = $('#gallery');
  gallery.replaceChildren();
  items.forEach(item => {
    const button = document.createElement('button');
    button.className = 'gallery-card';
    button.setAttribute('aria-label', `View ${item.title}, ${item.category} capture`);
    button.innerHTML = `<div class="gallery-img-wrap"><img src="assets/${item.id}.webp" alt="${item.alt}" loading="lazy"><span class="gallery-zoom" aria-hidden="true">↗</span></div><div class="gallery-card-info"><span>${item.title}</span><small>${item.category.toUpperCase()}</small></div>`;
    button.addEventListener('click', () => {
      viewerItems = items;
      currentCapture = items.indexOf(item);
      updateLightbox();
      showDialog($('#image-dialog'));
    });
    gallery.append(button);
  });
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  renderGallery(button.dataset.filter);
}));
function updateLightbox() {
  const item = viewerItems[currentCapture];
  $('#lightbox-image').src = `assets/${item.id}.webp`;
  $('#lightbox-image').alt = item.alt;
  $('#lightbox-title').textContent = item.title;
  $('#lightbox-index').textContent = `${String(currentCapture + 1).padStart(2, '0')} / ${String(viewerItems.length).padStart(2, '0')}`;
  $('#lightbox-category').textContent = `${item.category.toUpperCase()} CAPTURE / SERENDIB STILL BREATHES`;
  $('#image-download').href = `assets/${item.id}.webp`;
  $('#image-download').download = `Serendib-${item.id}.webp`;
}
function nextCapture(direction) {
  currentCapture = (currentCapture + direction + viewerItems.length) % viewerItems.length;
  updateLightbox();
}
$('.lightbox-prev').addEventListener('click', () => nextCapture(-1));
$('.lightbox-next').addEventListener('click', () => nextCapture(1));
$('#image-dialog').addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') {e.preventDefault(); nextCapture(1);}
  if (e.key === 'ArrowLeft') {e.preventDefault(); nextCapture(-1);}
});
$('#world-view').addEventListener('click', () => {
  viewerItems = locations.map(location => ({id:location.id,title:location.title,alt:location.alt,category:'cinematic'}));
  currentCapture = currentLocation;
  updateLightbox();
  showDialog($('#image-dialog'));
});
$('#copy-link').addEventListener('click', async () => {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(`${location.origin}${location.pathname}`);
    notify('Site link copied. Share the journey.');
  } catch {
    notify('Copy the website address from your browser to share it.');
  }
});
$('#year').textContent = String(new Date().getFullYear());
renderGallery();
