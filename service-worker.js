/* ==========================================================================
   CampusFlow · Service Worker
   ---------------------------------------------------------------------------
   目标：装到桌面/主屏之后，断网也能完整打开。
   策略：
     1. install 阶段预缓存「应用外壳」（页面 + 样式 + 脚本 + 图标），这些文件很小；
     2. 体积大的第三方库（Chart.js / PDF.js，约 1.7 MB）不预缓存，
        首次真正用到时再按「缓存优先」写入，避免首次安装等待；
     3. 导航请求走「网络优先 + 缓存兜底」，保证更新后能拿到新页面；
     4. 其余同源 GET 走「缓存优先 + 后台更新」。
   注意：file:// 协议无法注册 Service Worker，需通过 http(s) 访问（详见 README）。
   ========================================================================== */
'use strict';

var VERSION = 'campusflow-v2';
var SHELL_CACHE = VERSION + '-shell';
var RUNTIME_CACHE = VERSION + '-runtime';

/* 应用外壳：预缓存，保证首屏断网可开
   注意：清单里每一项都必须能取到，否则 addAll 会整体失败，
   因此这里不写目录路径（'./'），只写具体文件。 */
var SHELL_FILES = [
  './index.html',
  './plan.html',
  './schedule.html',
  './tasks.html',
  './goals.html',
  './focus.html',
  './preview.html',
  './download.html',
  './manifest.webmanifest',
  './assets/css/tailwind.css',
  './assets/css/app.css',
  './assets/js/store.js',
  './assets/js/scheduler.js',
  './assets/js/nav.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

/* 按需缓存的第三方大文件前缀 */
var RUNTIME_PREFIXES = [
  './assets/vendor/',
  './assets/icons/'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function (cache) {
      return cache.addAll(SHELL_FILES);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== SHELL_CACHE && k !== RUNTIME_CACHE) return caches.delete(k);
        return null;
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function shouldRuntimeCache(url) {
  for (var i = 0; i < RUNTIME_PREFIXES.length; i++) {
    if (url.indexOf(RUNTIME_PREFIXES[i]) === 0) return true;
  }
  return false;
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 本项目零外部请求，跨域一律不拦

  var isNavigate = req.mode === 'navigate';

  if (isNavigate) {
    // 网络优先：保证更新能被看到；断网时回落到缓存的同页或首页
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(SHELL_CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match('./index.html');
        });
      })
    );
    return;
  }

  var rel = './' + url.pathname.replace(/^\//, '');

  event.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.status === 200 && (shouldRuntimeCache(rel) || req.destination !== '')) {
          var copy = res.clone();
          caches.open(RUNTIME_CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
