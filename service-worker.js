self.addEventListener('install', event => {
    console.log('🔧 Service Worker تم تثبيته');
});

self.addEventListener('fetch', event => {
    // يمكن إضافة كاش هنا لاحقًا إذا أردت دعم العمل بدون إنترنت
});
