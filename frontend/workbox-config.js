const isEnvProduction = process.env.NODE_ENV === 'production';
const isEnvDevelopment = process.env.NODE_ENV === 'development';

// Workbox config for build process
module.exports = {
  "globDirectory": "build/",
  "globPatterns": [
    "**/*.{css,js,html,png,jpg,jpeg,gif,svg,ico,woff,woff2,eot,ttf,otf}"
  ],
  "swDest": "build/service-worker.js",
  "modifyURLPrefix": {
    "": "/"
  },
  "skipWaiting": false,
  "clientsClaim": false,
  "runtimeCaching": [
    {
      "urlPattern": /^https:\/\/fonts\.googleapis\.com\//,
      "handler": "StaleWhileRevalidate",
      "options": {
        "cacheName": "google-fonts-stylesheets"
      }
    },
    {
      "urlPattern": /^https:\/\/fonts\.gstatic\.com\//,
      "handler": "CacheFirst",
      "options": {
        "cacheName": "google-fonts-webfonts",
        "expiration": {
          "maxEntries": 30,
          "maxAgeSeconds": 60 * 60 * 24 * 365
        }
      }
    },
    {
      "urlPattern": /\.(?:png|jpg|jpeg|svg|gif)$/,
      "handler": "CacheFirst",
      "options": {
        "cacheName": "images",
        "expiration": {
          "maxEntries": 100,
          "maxAgeSeconds": 60 * 60 * 24 * 30
        }
      }
    },
    {
      "urlPattern": /\/api\//,
      "handler": "NetworkFirst",
      "options": {
        "cacheName": "api-cache",
        "networkTimeoutSeconds": 3,
        "expiration": {
          "maxEntries": 50,
          "maxAgeSeconds": 60 * 60 * 24
        },
        "cacheableResponse": {
          "statuses": [0, 200]
        }
      }
    }
  ]
};
