var port = process.env.PORT || 3000;
var express = require('express');
var parser = require('./NewsParser');
var dynDb;
var NLP = require('./NLP');
var app = express();
var fs = require('fs');
var useDB = true;
if(useDB) dynDb = require('./Database');
app.get('/', function(req,res) {
	res.send(fs.readFileSync(__dirname+'/index.html','utf8'));
});
app.get('/url/:url', function(req,res){
    var url = req.params.url.replace(/(^\w+:|^)\/\//, '').replace(/^www\./,'');
    url = "http://"+url;
    //vars might be null
    var title;
    var author;
    var domain;
    var content;
    var excerpt;
    var leadImageURL;
    //check if the url is in the database
    if(dynDb.get(url,function(error,result)
        {
            //result from the database so set the vars
            if(result && !isEmpty(result) && useDB)
            {
                if(result.Item.Title) title = result.Item.Title.S;
                if(result.Item.Author) author = result.Item.Author.S;
                if(result.Item.Domain) domain = result.Item.Domain.S;
                if(result.Item.Content) content = result.Item.Content.S;
                if(result.Item.Excerpt) excerpt = result.Item.Excerpt.S;
                if(result.Item.leadImageURL) leadImageURL = result.Item.leadImageURL.S;
                res.send({url:url,domain:domain,title:title,author:author,excerpt:excerpt,leadImageURL:leadImageURL,Content:content,cached:true});
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

                            //send response back to user
                            res.send({url:url,domain:domain,title:title,author:author,excerpt:excerpt,leadImageURL:leadImageURL,Content:content,cached:false});

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
app.listen(port);