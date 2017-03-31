var fs = require('fs');
var util = require('./Util');
var db = require('./Database');

module.exports = {
	checkDomain: function(domain){//check domain when db isn't available. slower than db method
		return new Promise(function(resolve,reject){
			try{
				//try read in from file
				var data = JSON.parse(fs.readFileSync('notCredible.json', 'utf8'));			
				var domaindata = data[domain];
				if(domaindata != null){//in list, so untrusted source
					resolve({fake:true,info:domaindata});
				}else{//not in lsit, so not untrusted
					resolve({fake:false,info:null});
				}
			}catch(e){
				reject(e);
			}
		});
	},
	checkDomainDB: function(domain){
		return new Promise(function(resolve,reject){
			try{
				//try to find domain in database
				db.getdomaincheck(domain,function(error,result){
				if(result && !util.isEmpty(result))
				{				
					//domain in db, so untrusted source
					var out = {};
					out.fake = true;
					out.notes = {};
					if(result.Item.Type1) out.notes.type1 = result.Item.Type1.S;
					if(result.Item.Type2) out.notes.type2 = result.Item.Type2.S;
					if(result.Item.Type3) out.notes.type3 = result.Item.Type3.S;
					if(result.Item.Notes) out.notes.notes = result.Item.Notes.S;
					
					resolve(out);
				}else{
					//not in db, so not untrusted
					resolve({fake:false,notes:null});
				}
			});
			}catch(e){ //This should never happen ;)
				reject("Failed To Access Database");
			}
		});
	},
	populateDomainTable: function(){
		/* used to populate domain db */
		
		//read data from data file
		var data = JSON.parse(fs.readFileSync('notCredible.json', 'utf8'));
		
		Object.keys(data).forEach(function (key) { 
			var val = data[key];
			var domain = key.replace("www.",""); //remove www for consistency
			
			var type1 = val["type"];
			var type2 = val["type2"];
			var type3 = val["type3"];
			var notes = val["notes"];
			
			//attempt to put on database
			dynDb.putdomaincheck(domain,type1,type2,type3,notes,function(error,result){
				if (error) console.log(error, error.stack); // an error occurred
				else     console.log(result);           // successful response
			});
		})
	}
};