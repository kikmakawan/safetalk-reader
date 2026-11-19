const CACHE='safetalk-q3-2026-v2';
const ASSETS=['./','index.html','style.css','app.js','data.js','manifest.webmanifest','icons/icon.svg','icons/icon-192.png','icons/icon-512.png','img/f1-1.webp','img/f1-2.webp','img/f10.webp','img/f11.webp','img/f12.webp','img/f13.webp','img/f14.webp','img/f15.webp','img/f2.webp','img/f3.webp','img/f4.webp','img/f5.webp','img/f6.webp','img/f7.webp','img/f8.webp','img/f9.webp','img/g1.webp','img/g10-1.webp','img/g10-2.webp','img/g11.webp','img/g12.webp','img/g13a-1.webp','img/g13a-2.webp','img/g13a-3.webp','img/g13a-4.webp','img/g13a-5.webp','img/g13a-6.webp','img/g13b.webp','img/g14.webp','img/g15a.webp','img/g15b.webp','img/g16.webp','img/g17.webp','img/g18.webp','img/g19a.webp','img/g19b.webp','img/g2.webp','img/g20.webp','img/g3.webp','img/g4.webp','img/g5.webp','img/g6.webp','img/g7.webp','img/g8.webp','img/g9.webp','img/s1.webp','img/s2.webp','img/s3.webp','img/s4.webp','img/s5.webp','pages/page-1.jpg','pages/page-2.jpg','pages/page-3.jpg','pages/page-4.jpg','pages/page-5.jpg','pages/page-6.jpg','pages/page-7.jpg','pages/page-8.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{
    if(res.ok&&new URL(e.request.url).origin===location.origin){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}
    return res;
  }).catch(()=>caches.match('index.html'))));
});
