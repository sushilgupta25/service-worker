const { getHeaders } = require('./util');

export const  navigationApi = {
  method: 'get',
  url: GlobalConfig.getApiUrlFromRoot('/getNavigation.php'),
  headers: getHeaders(['JSON', 'SERVICE_WORKER_CACHED']), // this api response will be cached by service worker
  params: {},
  dispatchAs: 'UPDATE_NAVIGATION'
}