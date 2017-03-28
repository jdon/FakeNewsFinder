var request = require('request');
var storiesURL = 'http://www.politifact.com/api/stories/truth-o-meter/json/?n=';
var statementsURL = 'http://www.politifact.com/api/statements/truth-o-meter/json/?n='

function getURLData(url){
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
}

module.exports = {
	getData: function(n, callback){
		//make promises for data of stories and statements
		var storiespromise = getURLData(storiesURL + n);
		var statementspromise = getURLData(statementsURL + n);
		
		//run when all promises fulfilled
		Promise.all([storiespromise,statementspromise]).then(function(values){
			callback({stories:values[0],statements:values[1]});
		});
	}
};