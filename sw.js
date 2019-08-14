/* global self, caches, fetch, importScripts, location */
/* eslint no-restricted-globals: [0, 'self', 'caches', 'fetch'] */
/* eslint no-console: 0 */
/* eslint no-plusplus: 0 */
/* eslint prefer-template: 0 */
/* eslint no-var: 0 */
/* eslint prefer-spread: 0 */
/* eslint prefer-promise-reject-errors: 0 */

/**
 * Logging
 */
const LOGGING_LEVELS = {
  NONE: 0,
  LOG: 1,
  WARN: 2,
  ERROR: 3,
  ALL: 4,
};
const config = {
  LOGGING_LEVEL: LOGGING_LEVELS.ALL, // EXPECTED VALUES 'ALL', 'LOG', 'WARN', 'ERROR'
};

const logger = (() => {
  const isLog = () => (config.LOGGING_LEVEL === LOGGING_LEVELS.LOG);
  const isWarn = () => (config.LOGGING_LEVEL === LOGGING_LEVELS.WARN);
  const isError = () => (config.LOGGING_LEVEL === LOGGING_LEVELS.ERROR);
  const isAll = () => (config.LOGGING_LEVEL === LOGGING_LEVELS.ALL);

  return {
    log: (...args) => {
      if (isLog() || isAll()) {
        console.log.apply(args);
      }
    },
    warn: (...args) => {
      if (isWarn() || isAll()) {
        console.warn.apply(args);
      }
    },
    error: (...args) => {
      if (isError() || isAll()) {
        console.warn.error(args);
      }
    },
  };
})();


const CACHE_NAME = 'v13.88';
const SERVICE_WORKER_CACHED = 'x-worker-cached';  // this header will use for caching api response
const CACHE_ASSETS = [
  /desktop.*\.css/,
  /getNavigation\.php/,
];
const EXCLUDE_ASSETS = [
  /^(?!.*\.php)/,
  /^(?!.*\.(gif|jpg|jpeg|tiff|png))/,
  /^(?!.*(woff|eot|woff2|ttf|svg))/,
  /^(?!.*sw\.js)/,
];
const MUST_HAVE = [
  /^.*localhost/,
];

const STATIC_ASSETS = [
  'assets/css/common.css',
];

/**
 * @function doCacheAssets
 * @param {object} event
 * @param {object} responseClone response clone object
 */
const doCacheAssets = (event, response) => {
  caches.open(CACHE_NAME).then((cache) => {
    cache.put(event.request, response);
  });
};

/**
 *
 * @param {*} method its an http method e.g. [ 'get' || 'post' ]
 * @description if method is GET then it will return true else false
 * @returns {Boolean}
 */
const isGetMethod = (method) => {
  if (method && method.toLowerCase() === 'get') {
    return true;
  }
  return false;
};

/**
 *
 * @param {Number} httpCode http code will be http response status code
 * @description if the response lies in success i.e. >= 200 and < 300 it will return true
 * @returns {Boolean}
 */
const validHttpStatusCodes = (httpCode) => {
  if (httpCode >= 200 && httpCode < 300) {
    return true;
  }
  return false;
};

/**
 * @function fromCachedAssets
 * @param {*} event its an complete request object
 * @description this method will be responsible to check should we cache response or not
 * e.g.
 *  1. method should be GET
 *  2. it should be lies in a caching rules specified in constant
 * @readonly {Boolean}
 */
const fromCachedAssets = (event) => {
  // request headers
  // cache assets
  // method.get calls only
  const requestMethod = event.request.method;
  if (!isGetMethod(requestMethod)) {
    return false;
  }
  let isRequestFromCaching = false;
  for (let i = 0; i < CACHE_ASSETS.length; i++) {
    if (event.request.url.match(CACHE_ASSETS[i])) {
      isRequestFromCaching = true;
    }
  }
  if (isRequestFromCaching) {
    return true;
  }
  return false;
};

/**
 * @function isInMustHave
 * @param {object} event its an complete request object
 * @description this method will be responsible to check should we cache response or not
 * @readonly {Boolean}
 */
const isInMustHave = (event) => {
  for (let i = 0; i < MUST_HAVE.length; i++) {
    if (event.request.url.match(MUST_HAVE[i])) {
      return true;
    }
  }
  return false;
};

/**
 * @function isInExclude
 * @param {object} event its an complete request object
 * @description this method will be responsible to check should we cache response or not
 * @readonly {Boolean}
 */
const isInExclude = (event) => {
  let excluded = false;
  for (let i = 0; i < EXCLUDE_ASSETS.length; i++) {
    if (!event.request.url.match(EXCLUDE_ASSETS[i])) {
      excluded = true;
    }
  }
  return excluded;
};

/**
 * @function fromCachedHeaders
 * @param {object} event its an complete request object
 * @description this method will be responsible to check should we cache response or not
 * e.g.
 *  1. method should be GET
 *  2. it should be lies in a caching rules specified in constant
 * @readonly {Boolean}
 */
const fromCachedHeaders = (event) => {
  const requestHeaders = event.request.headers;
  const requestMethod = event.request.method;
  if (!isGetMethod(requestMethod)) {
    return false;
  }
  const fromCachedHeader = requestHeaders.get(SERVICE_WORKER_CACHED);
  if (fromCachedHeader) {
    return true;
  }
  return false;
};

/**
 * @name doFetch
 * @function
 * @param {object} event complete event object
 * @description
 * will create an ajax call and set data in a cache based on certain conditions
 * @returns {object} new Response() object
 */
const doFetch = (event) => {
  const requestClone = event.request.clone();
  return fetch(requestClone).then((fetchApiResponse) => {
    logger.log('ServiceWorker{doFetch}', event);
    const responseClone = fetchApiResponse.clone();
    if (validHttpStatusCodes(responseClone.status)) {
      if (fromCachedHeaders(event)) {
        doCacheAssets(event, fetchApiResponse);
      }
      if (!isInMustHave(event)) {
        return fetchApiResponse;
      }
      if (isInExclude(event)) {
        return fetchApiResponse;
      }
      if (fromCachedAssets(event)) {
        doCacheAssets(event, fetchApiResponse);
      }
    }
    return responseClone;
  }).catch((error) => {
    return caches.match(event.request).then(response => response);
  });
};

self.addEventListener('install', (e) => {
  logger.log('ServiceWorker{INSTALLED}');
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        cache.addAll(STATIC_ASSETS);
      })
      // forces the waiting service worker to become the active service worker.
      .then(() => self.skipWaiting())
      .catch((error) => {
        logger.log('ServiceWorker{CACHED}: FAILED', error);
      }),
  );
});

self.addEventListener('activate', (e) => {
  const LOG_IDENTIFIER = 'ServiceWorker{ACTIVATED}';
  logger.log(LOG_IDENTIFIER);

  e.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map((cache) => {
        if (CACHE_NAME !== cache) {
          logger.log(LOG_IDENTIFIER, 'ACTION:DELETED', cache);
          return caches.delete(cache);
        }
        return null;
      }),
    )),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request)
        .then((response) => {
          logger.log('ServiceWorker{CACHED::Response}', response, event.request);
          return response || doFetch(event);
        });
    }),
  );
});