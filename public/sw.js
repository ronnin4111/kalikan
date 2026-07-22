// ============================================================
// Kalikan Service Worker - PWA Offline Support
// ============================================================
// Strategy:
// - Precache app shell & static assets saat install
// - Cache-first untuk static assets (JS, CSS, fonts, icons, Next.js chunks)
// - Network-first untuk HTML navigasi (fallback ke cache saat offline)
// - Network-only untuk POST API (kalkulasi dijalankan client-side, jadi
//   tidak ada dependensi server saat offline)
// ============================================================

const CACHE_VERSION = "kalikan-v2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;

// Aset statis untuk precache (app shell)
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/kalikan-logo.png",
  "/hero-banner.png",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/favicon-32.png",
  "/logo.svg",
  "/fish-lele.png",
  "/fish-nila.png",
  "/fish-patin.png",
  "/fish-gurame.png",
  "/fish-mas.png",
  "/offline.html",
];

// ---------- Install: precache app shell ----------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Precaching app shell");
        // addAll fails atomically if any URL fails; we use individual
        // put() calls so a single missing asset doesn't break the whole install.
        return Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            fetch(url, { cache: "no-store" })
              .then((res) => (res.ok ? cache.put(url, res) : null))
              .catch(() => null)
          )
        );
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.warn("[SW] Precache error:", err))
  );
});

// ---------- Activate: cleanup old caches ----------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (name) =>
                name !== STATIC_CACHE &&
                name !== RUNTIME_CACHE &&
                name !== PAGE_CACHE
            )
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

// ---------- Helper: cek apakah request adalah navigasi HTML ----------
function isNavigationRequest(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" &&
      request.headers.get("accept") &&
      request.headers.get("accept").includes("text/html"))
  );
}

// ---------- Helper: cek static asset ----------
function isStaticAsset(url) {
  const pathname = new URL(url).pathname;
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/_next/fonts/") ||
    pathname.match(/\.(js|css|woff2?|ttf|otf|png|jpg|jpeg|svg|gif|webp|ico)$/) ||
    pathname === "/manifest.json"
  );
}

// ---------- Helper: cek API ----------
function isApiRequest(url) {
  return new URL(url).pathname.startsWith("/api/");
}

// ---------- Helper: cek same-origin ----------
function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

// ---------- Fetch strategy ----------
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Hanya handle GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip cross-origin requests (mis. Google Fonts)
  if (!isSameOrigin(url)) return;

  // Skip Next.js HMR & dev endpoints
  if (
    url.pathname.startsWith("/_next/webpack-hmr") ||
    url.pathname.startsWith("/_next/data/")
  ) {
    return;
  }

  // POST /api/calculate di-handle client-side (kalkulator pure-client),
  // jadi tidak perlu di-cache. Tetapi cache GET /api (master data).
  if (isApiRequest(url)) {
    // Network-first dengan fallback cache untuk GET API
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 1. Navigasi HTML: Network-first, fallback ke cache (offline mode)
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache salinan navigasi sukses
          const responseClone = response.clone();
          caches.open(PAGE_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Offline: ambil dari cache, fallback ke cached "/" atau offline page
          return caches
            .match(request)
            .then(
              (cached) =>
                cached ||
                caches.match("/") ||
                caches.match("/offline.html") ||
                new Response(
                  `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kalikan - Offline</title>
<style>
body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:1rem}
.box{text-align:center;max-width:420px;padding:2rem 1.5rem;border-radius:16px;background:#1e293b;box-shadow:0 10px 30px rgba(0,0,0,.3)}
h1{margin:0 0 .5rem;font-size:1.5rem;color:#34d399}
p{margin:.5rem 0;font-size:.95rem;color:#94a3b8}
button{margin-top:1rem;padding:.6rem 1.2rem;border:0;border-radius:8px;background:#10b981;color:#fff;font-weight:600;font-size:.9rem;cursor:pointer}
button:hover{background:#059669}
</style>
</head>
<body>
<div class="box">
<h1>Anda sedang offline</h1>
<p>Kalikan tetap bisa dipakai untuk hitung padat tebar ikan secara offline. Aplikasi sudah ter-cache di perangkat Anda.</p>
<button onclick="location.href='/'">Buka Kalikan</button>
</div>
</body>
</html>`,
                  { headers: { "Content-Type": "text/html; charset=utf-8" } }
                )
            );
        })
    );
    return;
  }

  // 2. Static assets: Cache-first
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Update cache di background (stale-while-revalidate)
          fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
            })
            .catch(() => {});
          return cached;
        }
        // Tidak ada di cache: fetch & cache
        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200) return response;
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          })
          .catch(() => caches.match("/logo.svg"));
      })
    );
    return;
  }

  // 3. Lainnya: Network-first dengan fallback cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ---------- Message handler: trigger update ----------
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "CLEAR_CACHE") {
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    );
  }
});
