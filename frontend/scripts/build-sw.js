#!/usr/bin/env node

const { build } = require('workbox-build');
const path = require('path');

const buildSW = () => {
  return build({
    globDirectory: 'build/',
    globPatterns: [
      '**/*.{js,css,html,png,svg,jpg,jpeg,gif,ico,woff,woff2,eot,ttf,otf}'
    ],
    swDest: 'build/service-worker.js',
    skipWaiting: false,
    clientsClaim: false,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts-stylesheets',
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-webfonts',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        }
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        }
      },
      {
        urlPattern: /\/api\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 3,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        }
      }
    ],
  }).then(({count, size}) => {
    console.log(`Generated service worker, which will precache ${count} files, totaling ${size} bytes.`);
  }).catch((error) => {
    console.error('Error building service worker:', error);
  });
};

buildSW();
