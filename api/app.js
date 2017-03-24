var port = process.env.PORT || 3000;
var express = require('express');
var parser = require('./NewsParser');
var app = express();
var fs = require('fs');

app.get('/', function(req,res) {
	res.send(fs.readFileSync(__dirname+'/index.html','utf8'));
});
app.get('/url/:url', function(req,res){
    var url = req.params.url;
    url = url.replace(/(^\w+:|^)\/\//, '').replace(/^www\./,'');
    console.log(url);
    var score = Math.random()*5;
    score = Math.round(score);
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
            var title = result.title;
            var author = result.author;
            var url = result.url;
            var domain = result.domain;
            var content = result.content;
            var excerpt = result.excerpt;
            var leadImageURL = result.lead_image_url;
            console.log(title + author + url + domain + excerpt + leadImageURL);
            res.send({url:url,domain:domain,title:title,author:author,excerpt:excerpt,leadImageURL:leadImageURL});
        }

    });
});

app.listen(port);