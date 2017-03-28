var http = require('http');
var request = require('request');

var storiesURL = 'http://www.politifact.com/api/stories/truth-o-meter/json/?n=';
var statementsURL = 'http://www.politifact.com/api/statements/truth-o-meter/json/?n='

module.exports = {
	getData: function(n, callback){
		//console.log(this.getURLData(storiesURL,n))
		// console.log(storiesURL + n);
		var storiespromise = this.getURLData(storiesURL + n);
		var statementspromise = this.getURLData(statementsURL + n);
		
		Promise.all([storiespromise,statementspromise]).then(function(values){
			callback({stories:values[0],statements:values[1]});
		});
		
		// promise.then(function(data){
			// callback(data);
		// });
	},
	getURLData: function(url){
		// url = "http://www.politifact.com/api/stories/truth-o-meter/json/?n=2";
		// console.log("url: " + url);
		return new Promise(function(resolve,reject){
			var options = {
				url: url,
				method: 'GET'
			};
			request.get(options,function(error,results){
				try{
					resolve(JSON.parse(results.body));
				}catch(e){
					reject(e);
				}
			});
		});
	},
	
};