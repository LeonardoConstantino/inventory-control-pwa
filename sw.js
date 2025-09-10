// Mude para 'false' antes de fazer o build para produção.
const IS_DEVELOPMENT = false;

// Isso força uma reinstalação limpa do Service Worker a cada alteração.
const PROD_CACHE_NAME = 'inventory-control-pwa-v2';
const DEV_CACHE_NAME = `inventory-control-pwa-dev-${new Date().getTime()}`;
const CACHE_NAME = IS_DEVELOPMENT ? DEV_CACHE_NAME : PROD_CACHE_NAME;

// URLs a serem pré-cacheadas. Em desenvolvimento, isso garante que o SW instale,
// mas a estratégia de fetch irá ignorar o cache para esses arquivos.
const urlsToCache = [
  '/',
  '/index.html',
  // Se você usa um bundler como Vite ou Create React App,
  // talvez não precise listar os arquivos JS/CSS aqui,
  // pois eles têm hashes e a estratégia de fetch os pegará.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log(`[SW] Cache aberto: ${CACHE_NAME}`);
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Em produção, limpa caches antigos. Em desenvolvimento, sempre limpa o anterior.
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Deleta qualquer cache que não seja o atual.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`[SW] Deletando cache antigo: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Adicionado: Lógica para modo de desenvolvimento
  // Se estiver em desenvolvimento, ignora o cache e vai direto para a rede.
  // Isso garante que você sempre veja suas últimas alterações.
  if (IS_DEVELOPMENT) {
    // Apenas busca da rede. Sem cache.
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Lógica original para produção (Cache-First)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retorna a resposta do cache
        if (response) {
          return response;
        }

        // Não está no cache, busca na rede
        return fetch(event.request).then(
          response => {
            // Verifica se recebemos uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              // Permite o cache de recursos de terceiros (CORS)
              if (response && (response.type === 'cors' || response.type === 'opaque')) {
                 let responseToCache = response.clone();
                 caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return response;
            }

            // Clona a resposta para poder ser usada pelo navegador e pelo cache
            let responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});