var port = process.env.PORT || 3000;
var express = require('express');
var parser = require('./NewsParser');
var politifact = require('./Politifact');
var domainlist = require('./domainList');
var util = require('./Util');
var dynDb = require('./Database');
var NLP = require('./NLP');
var app = express();
var fs = require('fs');
var dandapi = require('./DandelionAPI');
var useDB = true;



// DandelionAPI -- usage:
//    dandapi.{function name}.fromUrl(callback, url [, url2 [, lang]])
//    dandapi.{function name}.fromText(callback, text [, url2 [, lang]])
// Function names:
//      extractEntities
//      classifyContent
//      analyseSentiment
//      detectLanguage
//      analyseSimilarity (takes two params, ie. url1/url2 or text1/text2)

dandapi.detectLanguage.fromUrl(function(error, response, body){
    if ( response && response.statusCode == 200 ){
        body = JSON.parse(body);
        console.log('DandelionAPI/li/ detected langs: ', body.detectedLangs.length);
        body.detectedLangs.forEach(function(item,index){
            console.log('   Detected lang: ', item.lang);
            console.log('   Confidence:    ', item.confidence);
        });
    }
}, 'http://www.bbc.co.uk/news/live/uk-politics-39681158');

var requiredModules = ['aws-sdk', 'aylien_textapi'];

requiredModules.forEach(function(item,index){
    try { require.resolve(item);
    } catch(e) {
        console.error("ERROR: this app requires the module '"+item+"' but your node.JS doesn't have it\n" +
                      "       Please run 'npm install "+item+"' and re-run this app.\n");
        process.exit(e.code);
    }
});

app.use(function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/', function(req,res,next) {
    res.send(fs.readFileSync(__dirname+'/index.html','utf8'));
});
app.get('/url/:url', function(req,res,next){
	
	//reformat URL to be consistent
    var url = req.params.url.replace(/(^\w+:|^)\/\//, '').replace(/^www\./,'');
    url = "http://"+url;
	
    //vars might be null
    var title;
    var author;
    var domain;
    var content;
    var excerpt;
    var leadImageURL;
	NLP.parse(url,function (error,result) {

	    if(result)
	    {
	        if(dynDb.putJSON(url,result,function (error,result) {
	            if(result && !util.isEmpty(result))
	            {
	                console.log(result);
                }else
                    {
                        console.log(error);
                    }
                }));
            if(dynDb.getJSON(url,function (error,result) {
                    if(result && !util.isEmpty(result))
                    {
                        if(result.Item.JSON) jsn = result.Item.JSON.S;
                        console.log(JSON.parse(jsn));
                    }else
                    {
                        console.log(error);
                    }
                }));
        }
    });
    //check if the url is in the database
    if(dynDb.get(url,function(error,result)
        {
            //result from the database so set the vars
            if(result && !util.isEmpty(result) && useDB)
            {
                if(result.Item.Title) title = result.Item.Title.S;
                if(result.Item.Author) author = result.Item.Author.S;
                if(result.Item.Domain) domain = result.Item.Domain.S;
                if(result.Item.Content) content = result.Item.Content.S;
                if(result.Item.Excerpt) excerpt = result.Item.Excerpt.S;
                if(result.Item.leadImageURL) leadImageURL = result.Item.leadImageURL.S;
                var toSend = {cached:true,domain:domain,title:title,author:author};
                var promises = [];
                var dlPromise = domainlist.checkDomainDB(domain.replace(/(^\w+:|^)\/\//, '').replace(/^www\./,''));
                dlPromise.then(function(result){
                    // console.log(result);
                    toSend.domainList = result;
                }).catch(function(e){
                    console.log("DB is deaded");
                });
                promises.push(dlPromise);
                //wait for all promises to finish, such as any fake news detection methods
                Promise.all(promises).then(function(values){
                    res.send(toSend);
                }).catch(function(e){
                    res.send("ERROR");
                });

            }//database is down so just parse like normal
            else
            {
                parser.parse(url,function(error,result)
                {
                    if(error)
                    {
                        console.log("error");
                        res.send({ApiStat:"Down"})
                        // this is called when the api is down and not if the website can't be parsed
                    }
                    var statcode = result.statusCode;
                    if(statcode != 200)
                    {
                        // api is downn
                        res.send({ApiStat:"Down"});
                    }else
                    {
                        //parse json since api is up
                        var result = JSON.parse(result.body);
                        title = result.title;
                        author = result.author;
                        domain = result.domain;
                        content = result.content;
                        excerpt = result.excerpt;
                        leadImageURL = result.lead_image_url;

						var toSend = {domain:domain,title:title,author:author};
						var promises = [];
						
						var dlPromise = domainlist.checkDomainDB(domain.replace('www.',''));
						dlPromise.then(function(result){
							// console.log(result);
							toSend.domainList = result;
						}).catch(function(e){
							console.log("DB is deaded");
						});
						promises.push(dlPromise);
						
						//wait for all promises to finish, such as any fake news detection methods
						Promise.all(promises).then(function(values){
							res.send(toSend);
						}).catch(function(e){
							res.send("ERROR");
						});
						
                        //put into the database after the response is set to speed up the process
                        if(useDB)
                        {
                            dynDb.put(url,domain,title,author,excerpt,content,leadImageURL,function(error,result)
                            {
                                if (error) console.log(error, error.stack); // an error occurred
                                else     console.log(result);           // successful response
                            });
                        }
                    }

                });
            }
        }));
});
app.listen(port);