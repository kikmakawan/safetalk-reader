const CACHE='safetalk-q3-2026-v1';
const ASSETS=['./','index.html','style.css','app.js','data.js','manifest.webmanifest','icons/icon.svg','icons/icon-192.png','icons/icon-512.png','img/f1.jpg','img/f10.jpg','img/f11.jpg','img/f12.jpg','img/f13.jpg','img/f14.jpg','img/f15.jpg','img/f2.jpg','img/f3.jpg','img/f4.jpg','img/f5.jpg','img/f6.jpg','img/f7.jpg','img/f8.jpg','img/f9.jpg','img/g1.jpg','img/g10.jpg','img/g11.jpg','img/g12.jpg','img/g13a-1.jpg','img/g13a-2.jpg','img/g13a-3.jpg','img/g13a-4.jpg','img/g13b.jpg','img/g14.jpg','img/g15a.jpg','img/g15b.jpg','img/g16.jpg','img/g17.jpg','img/g18.jpg','img/g19a.jpg','img/g19b.jpg','img/g2.jpg','img/g20.jpg','img/g3.jpg','img/g4.jpg','img/g5.jpg','img/g6.jpg','img/g7.jpg','img/g8.jpg','img/g9.jpg','img/s1.jpg','img/s2.jpg','img/s3.jpg','img/s4.jpg','img/s5.jpg','pages/page-1.jpg','pages/page-2.jpg','pages/page-3.jpg','pages/page-4.jpg','pages/page-5.jpg','pages/page-6.jpg','pages/page-7.jpg','pages/page-8.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{
    if(res.ok&&new URL(e.request.url).origin===location.origin){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}
    return res;
  }).catch(()=>caches.match('index.html'))));
});
