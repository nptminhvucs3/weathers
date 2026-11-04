// Service worker: giúp trình duyệt nhận trang là ứng dụng cài được, và mở nhanh/offline phần giao diện.
// Dữ liệu thời tiết (API) luôn lấy trực tiếp từ mạng, không lưu ở đây.
const CACHE = "thoitiet-v4";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // API thời tiết, phông chữ: để trình duyệt tự xử lý
  // Ưu tiên bản mới trên mạng, mất mạng thì dùng bản đã lưu
  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then((m) => m || caches.match("./index.html")))
  );
});
