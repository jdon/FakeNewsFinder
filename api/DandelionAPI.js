var DandelionAPI = (function(){
   var api = {
      /* set the API key here */
      apiKey:  '7707298fb4404eb2892d4ae12b83e006',
      coreUrl: 'https://api.dandelion.eu',

      call: function(url, post, postData){
         post = typeof post !== 'undefined' ? true : false;
         postData = typeof postData !== 'undefined' ? this.serialize(postData) : "";

         if ( typeof XMLHttpRequest !== 'undefined')
            var request = new XMLHttpRequest();
         else if ( typeof ActiveXObject !== 'undefined' )
            var request = new ActiveXObject("Microsoft.XMLHTTP");
         if ( post === true ){
            // POST
            request.open('POST', url, false);
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            request.send(postData);
         } else {
            // GET
            request.open('GET', url, false);
            request.send(null);
         }
         if ( request.status === 200 ){
            return request.responseText;
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
         fromText: function(text, lang){ return api.call(this.localUrl + '&lang=' + (typeof lang !== 'undefined' ? lang : 'en') + (additionalParams != '' ? additionalParams : ''),
                                                         true, {'text': text}); },
         fromUrl:  function(url,  lang){ return api.call(this.localUrl + '&lang=' + (typeof lang !== 'undefined' ? lang : 'en') + (additionalParams != '' ? additionalParams : '')
                                                         + '&url=' + api.urlEncode(url)); }
      };
      return obj;
   };

   function makeCallerDouble(apiType, additionalParams, apiVer) {
      additionalParams = typeof additionalParams !== 'undefined' ? api.serialize(additionalParams) : '';
      var obj = {
         localUrl: api.coreUrl + '/datatxt/' + apiType + '/' + (typeof apiVer !== 'undefined' ? 'v'+apiVer : 'v1') + '/?token=' + api.apiKey,
         fromText: function(text1, text2, lang){ return api.call(this.localUrl + '&lang=' + (typeof lang !== 'undefined' ? lang : 'en') + (additionalParams != '' ? additionalParams : ''),
                                                                 true, {'text1': text1, 'text2': text2}); },
         fromUrl:  function(url1,  url2,  lang){ return api.call(this.localUrl + '&lang=' + (typeof lang !== 'undefined' ? lang : 'en') + (additionalParams != '' ? additionalParams : '')
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


// example
WScript.Echo(DandelionAPI.analyseSimiliarity.fromUrl('https://www.theguardian.com/world/2017/apr/13/thailand-bans-online-sharing-of-articles-by-three-critics-of-regime'));
WScript.Echo(DandelionAPI.analyseSimiliarity.fromUrl('http://www.theherald.com.au/story/4596391/thailand-bans-online-communication-with-three-critics/?cs=5'));