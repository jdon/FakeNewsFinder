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
	}
};