// SnowMatch service worker: always fetch the latest page; use the cached copy only when offline
// v2: プッシュ通知・アイコンのバッジ（未読数）に対応
var CACHE="snowmatch-v2";
self.addEventListener("install",function(e){self.skipWaiting();e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(["/","/manifest.json","/icon-192.png"]);}));});
self.addEventListener("activate",function(e){e.waitUntil(self.clients.claim());});
self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin)return;
  e.respondWith(fetch(req).then(function(res){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy);});return res;}).catch(function(){return caches.match(req).then(function(r){return r||caches.match("/");});}));
});

// ===== プッシュ通知 =====
function bumpBadge(){
  return caches.open("sm-badge").then(function(c){
    return c.match("/__badge").then(function(r){return r?r.text():"0";}).then(function(t){
      var n=(parseInt(t,10)||0)+1;
      return c.put("/__badge",new Response(String(n))).then(function(){
        if(self.navigator&&self.navigator.setAppBadge)return self.navigator.setAppBadge(n).catch(function(){});
      });
    });
  }).catch(function(){});
}
self.addEventListener("push",function(e){
  var d={};
  try{d=e.data?e.data.json():{};}catch(x){d={body:e.data?e.data.text():""};}
  var title=d.title||"SnowMatch";
  var opts={body:d.body||"",icon:"/icon-192.png",badge:"/icon-192.png",tag:d.tag||"sm",renotify:true,data:{url:d.url||"/"}};
  e.waitUntil(bumpBadge().then(function(){return self.registration.showNotification(title,opts);}));
});
self.addEventListener("notificationclick",function(e){
  e.notification.close();
  var url=(e.notification.data&&e.notification.data.url)||"/";
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(function(list){
    for(var i=0;i<list.length;i++){if("focus" in list[i])return list[i].focus();}
    if(self.clients.openWindow)return self.clients.openWindow(url);
  }));
});
