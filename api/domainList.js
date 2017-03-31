var fs = require('fs');

module.exports = {
	checkDomain: function(domain){
		return new Promise(function(resolve,reject){
			try{
				var data = JSON.parse(fs.readFileSync('notCredible.json', 'utf8'));
				console.log("domain: " + domain);
				
				var domaindata = data[domain];
				if(domaindata != null){
					resolve({fake:true,info:domaindata});
				}else{
					resolve({fake:false,info:null});
				}
			}catch(e){
				reject(e);
			}
		});
	},
	tempForJonny: function(){
		try{
			var data = JSON.parse(fs.readFileSync('notCredible.json', 'utf8'));
			
			Object.keys(data).forEach(function (key) { 
				var val = data[key];
				var domain = key.replace("www.","");
				
				var type1 = val["type"];
				var type2 = val["type2"];
				var type3 = val["type3"];
				var notes = val["notes"];
				
				console.log(key + "types: " + type1 + "," + type2 + "," + type3 + "notes: " + notes);
			})
			
		}catch(e){
			console.log("no json file here you numpty");
		}
	}
};