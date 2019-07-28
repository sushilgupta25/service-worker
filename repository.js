const { getHeaders } = require('./util');

export const  navigationApi = {
  method: 'get',
  url: '/getNavigation.php',
  headers: getHeaders(['JSON', 'SERVICE_WORKER_CACHED']), // this api response will be cached by service worker
  params: { // default params for api.
    source: 'web',
  },
  dispatchAs: 'UPDATE_NAVIGATION'
}