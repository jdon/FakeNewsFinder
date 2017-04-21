/**
 * Created by Sufflock on 14/04/2017.
 * Last modified by Sufflock on 21/04/2017.
 */
var DandelionAPI = (function(){
   var config = require('./config.json');
   var api = {
      /* set the API key here */
      apiKey:  config.dandelionApiKey,
      coreUrl: config.dandelionCoreUrl,
      debug:   false,

      call: function(callback, address, post, postData){
         post = typeof post !== 'undefined' ? true : false;
         postData = typeof postData !== 'undefined' ? this.serialize(postData) : "";

         var request = require('request');
         if ( post === true ){
            if(this.debug)console.log('DandelionAPI::POST(' + postData + ') to ' + address);
            request.post({url: address, method: 'POST', headers: {'content-type': 'application/x-www-form-urlencoded'}, body: postData}, callback);
         } else {
            if(this.debug)console.log('DandelionAPI::GET to ' + address);
            request.get({url: address, method: 'GET'}, callback);
         }
      },

      urlEncode: function(string){
         return encodeURIComponent(string);
      },

      serialize: function(obj) {
         var str = [];
         for(var p in obj) if (obj.hasOwnProperty(p)) str.push(this.urlEncode(p) + "=" + this.urlEncode(obj[p]));
         str = str.join("&");
         if ( str.length > 0 ) return '&'+ str;
         else return '';
      }
   };

   function makeCallerSingle(apiType, additionalParams, apiVer) {
      additionalParams = typeof additionalParams !== 'undefined' ? api.serialize(additionalParams) : '';
      var obj = {
         localUrl: api.coreUrl + '/datatxt/' + apiType + '/' + (typeof apiVer !== 'undefined' ? 'v'+apiVer : 'v1') + '/?token=' + api.apiKey,
         fromText: function(callback, text, lang){ return api.call(callback, this.localUrl + '&lang=' + (typeof lang !== 'undefined' ? lang : 'en') + (additionalParams != '' ? additionalParams : ''),
                                                         true, {'text': text}); },
         fromUrl:  function(callback, url,  lang){ return api.call(callback, this.localUrl + '&lang=' + (typeof lang !== 'undefined' ? lang : 'en') + (additionalParams != '' ? additionalParams : '')
                                                         + '&url=' + api.urlEncode(url)); }
      };
      return obj;
   };

   function makeCallerDouble(apiType, additionalParams, apiVer) {
      additionalParams = typeof additionalParams !== 'undefined' ? api.serialize(additionalParams) : '';
      var obj = {
         localUrl: api.coreUrl + '/datatxt/' + apiType + '/' + (typeof apiVer !== 'undefined' ? 'v'+apiVer : 'v1') + '/?token=' + api.apiKey,
         fromText: function(callback, text1, text2, lang){ return api.call(callback, this.localUrl + '&lang=' + (typeof lang !== 'undefined' ? lang : 'en') + (additionalParams != '' ? additionalParams : ''),
                                                                 true, {'text1': text1, 'text2': text2}); },
         fromUrl:  function(callback, url1,  url2,  lang){ return api.call(callback, this.localUrl + '&lang=' + (typeof lang !== 'undefined' ? lang : 'en') + (additionalParams != '' ? additionalParams : '')
                                                                 + '&url1=' + api.urlEncode(url1) + '&url2=' + api.urlEncode(url2)); }
      };
      return obj;
   };

   // optional parameters: min_confidence (float), min_length (int), parse_hashtag (string), include (...), extra_types (...), country (string), custom_spots (...)
   api.extractEntities    = makeCallerSingle('nex');

   // optional parameters: min_score (float)
   api.classifyContent    = makeCallerSingle('cl', {model: 'model-identifier-here'}); // content classification requires a model, so specify it here

   // optional parameters: -none-
   api.analyseSentiment   = makeCallerSingle('sent');

   // optional parameters: clean (true | false)
   api.detectLanguage    = makeCallerSingle('li');

   // optional parameters: bow (never | both_empty | one_empty | always)
   api.analyseSimiliarity = makeCallerDouble('sim');

   return api;
})();

module.exports = DandelionAPI;