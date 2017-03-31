var fs = require('fs');
var db = require('./Database');

function isEmpty(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and toValue enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}

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
	checkDomainDB: function(domain){
		return new Promise(function(resolve,reject){
			try{
				db.getdomaincheck(domain,function(error,result){
				if(result && !isEmpty(result))
				{					
					var out = {};
					out.fake = true;
					out.notes = {};
					if(result.Item.Type1) out.notes.type1 = result.Item.Type1.S;
					if(result.Item.Type2) out.notes.type2 = result.Item.Type2.S;
					if(result.Item.Type3) out.notes.type3 = result.Item.Type3.S;
					if(result.Item.Notes) out.notes.notes = result.Item.Notes.S;
					
					// console.log(type1 + ", " + type2 + ", " + type3 + ", " + notes);
					resolve(out);
				}else{
					resolve({fake:false,notes:null});
				}
			});
			}catch(e){
				reject("wut");
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