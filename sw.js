self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open('aiballer-1').then(k=>k.put(e.request,c)).catch(()=>{});return r}).catch(()=>caches.match(e.request)))});
