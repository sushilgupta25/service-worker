const getHeaders = function(headers){
  var HEADERS = {
    "JSON": {
      "Content-Type": 'application/json'
    },
    "URL_ENCODED": {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    "MULTIPART_FORM_DATA": {
      "Content-Type": "multipart/form-data"
    },
    "TEXT_HTML": {
      "Content-Type": "text/html"
    },
    "SERVICE_WORKER_CACHED": {
      "x-worker-cached": "application/x-worker-cached",
    }
  };
  function getHeaders(){
      var headerObj = [];
      for(var i in headers){
        var header = HEADERS[headers[i]];
        headerObj = Object.assign(headerObj, header);
      }
      return headerObj;
  }
  return getHeaders();
};

module.exports = {
  getHeaders,
};