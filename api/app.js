var port = process.env.PORT || 3000;
var express = require('express');
var parser = require('./NewsParser');
var dynDb = require('./Database');
var app = express();
var fs = require('fs');
var AYLIENTextAPI = require('aylien_textapi');
var textapi = new AYLIENTextAPI({
    application_id: "de542d92",
    application_key: "2ad183766257e84750947020a62d0821"
});

app.get('/', function(req,res) {
	res.send(fs.readFileSync(__dirname+'/index.html','utf8'));
});
app.get('/url/:url', function(req,res){
    var url = req.params.url.replace(/(^\w+:|^)\/\//, '').replace(/^www\./,'');
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
            if(result && !isEmpty(result))
            {
                console.log(result);
                if(result.Item.Title) title = result.Item.Title.S;
                if(result.Item.Author) author = result.Item.Author.S;
                if(result.Item.Domain) domain = result.Item.Domain.S;
                if(result.Item.excerpt) excerpt = result.Item.excerpt.S;
                res.send({url:url,domain:domain,title:title,author:author,excerpt:excerpt,leadImageURL:leadImageURL,cached:true});
            }else
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
                            //console.log(title + author + url + domain + excerpt + leadImageURL);
                            /*            textapi.summarize({
                             'url': url,
                             'language': "en"
                             }, function(error, response) {
                             if (error === null) {
                             console.log(response);
                             }else
                             {
                             console.log(error);
                             }
                             });*/
                            res.send({url:url,domain:domain,title:title,author:author,excerpt:excerpt,leadImageURL:leadImageURL,cached:false});
                            dynDb.put(url,domain,title,author,excerpt,function(error,result)
                            {
                                if (error) console.log(error, error.stack); // an error occurred
                                else     console.log(result);           // successful response
                            });
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