var httpService = (function() {
  function http(options, successCallback, errorCallback) {
      var httpRequest;
      (function __construct() {
          if (window.XMLHttpRequest) {
              httpRequest = new XMLHttpRequest();
          } else if (window.ActiveXObject) {
              httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
          }
      })();

      function getResponse(){
          var responseHeader = httpRequest.getResponseHeader('Content-Type');
          var responseText = httpRequest.responseText;
          if(responseHeader){
              var splitHeader = responseHeader.split(';');
              try{
                  var header = splitHeader[0];
                  switch(header){
                      case 'application/json':
                          return JSON.parse(responseText);
                      break;
                      default:
                          return responseText;
                      break;
                  }
              } catch(e){
                  throw "Unable to convert response header";
              }
          }

      }
      function httpResponseHandler() {
          if (httpRequest.readyState == 4) {
              if (httpRequest.status.toString().match(/^20[0-9]$/)) {
                  var response = getResponse();
                  successCallback.call(this, response, httpRequest)
              } else { // error
                  errorCallback.call(this, httpRequest.responseText, httpRequest);
              }
          }
      }

      function setRequestHeaders(header) {
          for (i in header) {
              httpRequest.setRequestHeader(i, header[i]);
          }
      }

      function serialize(obj, prefix) {
          var str = [];
          for (var p in obj) {
              if (obj.hasOwnProperty(p)) {
                  var k = prefix ? prefix + "[" + p + "]" : p,
                      v = obj[p];
                  str.push(typeof v == "object" ?
                      serialize(v, k) :
                      encodeURIComponent(k) + "=" + encodeURIComponent(v));
              }
          }
          return str.join("&");
      }

      function request() {
          if(window.XMLHttpRequest){
              httpRequest.onload = httpResponseHandler;
          } else if(window.ActiveXObject){
              httpRequest.onreadystatechange = httpResponseHandler;
          } else {
              throw "unable to process ajax";
          }
          
          var params = serialize(options.params);
          if(options.method.toLowerCase() == 'get'){
              if(typeof options.params == 'object'){
                  if(options.url.indexOf("?") == -1){
                      options.url += "?";
                  } else {
                      var split = options.url.split("?");
                      if(split[1]){
                          var isQueryStringInUrl = split[1].split("=");
                          if(isQueryStringInUrl[1]){
                              options.url += "&"
                          }
                      }
                  }
                  options.url += params;
              }
          }
          httpRequest.open(options.method, options.url, options.async || false);
          if (options.header) {
              setRequestHeaders(options.header);
          }
          httpRequest.send(params);
      }
      return {
          request: request
      }
  };
  return http;
})();

module.exports = httpService;