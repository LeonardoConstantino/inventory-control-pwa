// vite.config.ts
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    base: './',

    plugins: [
      tailwindcss(),
      VitePWA({
        // Configurações básicas do PWA
        registerType: 'autoUpdate',

        workbox: {
          // ID base para os caches
          cacheId: 'inventory-control-pwa',

          // Padrões de arquivos para cache
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],

          // Ignora parâmetros de URL problemáticos
          ignoreURLParametersMatching: [/__WB_REVISION__/],

          // Estratégias de cache runtime
          runtimeCaching: [
            // Fontes do Google
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
                },
              },
            },
            // Imagens
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
                },
              },
            },
            // Arquivos estáticos (JS/CSS) - com otimização para Vary header
            {
              urlPattern: /\.(?:js|css)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources',
                matchOptions: {
                  ignoreVary: true,
                },
              },
            },
          ],

          // Configurações de comportamento
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          disableDevLogs: true,
        },

        // Configurações do Manifest
        manifest: {
          name: 'Inventory Control PWA',
          short_name: 'Inventory',
          description: 'Sistema de Controle de Inventário PWA',
          theme_color: '#1E40AF',
          background_color: '#F3F4F6',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            // Ícone específico para any
            {
              src: '/favicons/android-icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            // Ícone específico para maskable
            {
              src: '/favicons/android-icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            // Ícone específico para any
            {
              src: '/favicons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            // Ícone específico para maskable
            {
              src: '/favicons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          // Screenshots para Rich Install UI
          screenshots: [
            {
              src: '/screenshots/desktop-screenshot.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Desktop view of Inventory Control',
            },
            {
              src: '/screenshots/mobile-screenshot.png',
              sizes: '375x812',
              type: 'image/png',
              label: 'Mobile view of Inventory Control',
            },
          ],
        },

        // Habilita PWA em desenvolvimento
        devOptions: {
          enabled: true,
          type: 'module',
          suppressWarnings: true,
        },

        // Arquivos adicionais para incluir
        includeAssets: ['favicon.ico'],
      }),
    ],

    // server: {
    //   hmr: {
    //     overlay: false
    //   }
    // }
  });
