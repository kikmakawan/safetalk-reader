const CACHE='safetalk-2.0.1';
const ASSETS=['./','index.html','style.css','i18n.js','version.js','data.js','th.js','en.js','ans.js','quarters.js','stats.js','tts.js','gamedata.js','game.js','exam.js','me.js','app.js','update.js','manifest.webmanifest','fonts/ibm-plex-sans-thai-looped-latin-400-normal.woff2','fonts/ibm-plex-sans-thai-looped-latin-600-normal.woff2','fonts/ibm-plex-sans-thai-looped-thai-400-normal.woff2','fonts/ibm-plex-sans-thai-looped-thai-600-normal.woff2','fonts/mitr-latin-500-normal.woff2','fonts/mitr-thai-500-normal.woff2','icons/icon.svg','icons/icon-192.png','icons/icon-512.png','img/f1-1.webp','img/f1-2.webp','img/f10.webp','img/f11.webp','img/f12.webp','img/f13.webp','img/f14.webp','img/f15.webp','img/f2.webp','img/f3.webp','img/f4.webp','img/f5.webp','img/f6.webp','img/f7.webp','img/f8.webp','img/f9.webp','img/g1.webp','img/g10-1.webp','img/g10-2.webp','img/g11.webp','img/g12.webp','img/g13a-1.webp','img/g13a-2.webp','img/g13a-3.webp','img/g13a-4.webp','img/g13a-5.webp','img/g13a-6.webp','img/g13b.webp','img/g14.webp','img/g15a.webp','img/g15b.webp','img/g16.webp','img/g17.webp','img/g18.webp','img/g19a.webp','img/g19b.webp','img/g2.webp','img/g20.webp','img/g3.webp','img/g4.webp','img/g5.webp','img/g6.webp','img/g7.webp','img/g8.webp','img/g9.webp','img/s1.webp','img/s2.webp','img/s3.webp','img/s4.webp','img/s5.webp','pages/page-1.jpg','pages/page-2.jpg','pages/page-3.jpg','pages/page-4.jpg','pages/page-5.jpg','pages/page-6.jpg','pages/page-7.jpg','pages/page-8.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const url=new URL(req.url); if(url.origin!==location.origin)return;
  // version check: always from network
  if(url.pathname.endsWith('version.json')){e.respondWith(fetch(req,{cache:'no-store'}));return;}
  const isAsset=/\.(webp|jpg|png|svg|woff2)$/.test(url.pathname);
  if(isAsset){ // cache-first for images
    e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c));}return res;})));
    return;
  }
  // network-first for pages, scripts and styles so updates show up right away
  e.respondWith(fetch(req,{cache:'no-cache'}).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c));}return res;})
    .catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
});
