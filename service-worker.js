const CACHE_NAME="neon-clash-v3-2-shell";
const CORE=[
  "./","./index.html","./styles.css","./game.js","./manifest.webmanifest",
  "./favicon.ico","./logo.png","./assets/fighters.json",
  "./assets/ui/pwa-icon-192.png","./assets/ui/pwa-icon-512.png",
  "./assets/ui/neon_clash_logo_pixel.png","./assets/ui/neon_clash_logo_pixel.gif",
  "./assets/ui/title_background_pixel.png","./assets/ui/menu_background_pixel.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET"||!event.request.url.startsWith(self.location.origin))return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy))}
    return response;
  }).catch(()=>event.request.mode==="navigate"?caches.match("./index.html"):undefined)));
});
