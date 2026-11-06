const V='sudoku-v5';
const ASSETS=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();
  e.waitUntil(caches.open(V).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'})))))});
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k!==V&&k!=='shared')await caches.delete(k);
  await clients.claim()})()));
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method==='POST'&&u.pathname.endsWith('/share-target')){
    e.respondWith((async()=>{
      const f=(await r.formData()).get('image');
      if(f)await(await caches.open('shared')).put('shared-image',new Response(f,{headers:{'Content-Type':f.type}}));
      return Response.redirect(new URL('./?shared=1',self.registration.scope).href,303);
    })());return;
  }
  if(r.method!=='GET')return;
  const own=u.origin===location.origin&&!u.pathname.includes('/vendor/');
  const keep=res=>{if(res.ok&&(res.type==='basic'||res.type==='cors')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res};
  e.respondWith(own
    ? fetch(r.url,{cache:'no-cache'}).then(keep).catch(()=>caches.match(r,{ignoreSearch:true}))
    : caches.match(r).then(hit=>hit||fetch(r).then(keep)));
});
