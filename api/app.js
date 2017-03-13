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
    var score = Math.random()*5;
    score = Math.round(score);
    parser.parse(url,function(error,result)
    {
        if(error)
        {
            console.log("error");
            res.send({url:url,score:score,js:"error"})
            // this is called when the api is down and not if the website can't be parsed
            // the json that is returned needs to be examined for that
        }
        res.send({url:url,score:score,result:result});
        // the api is up and working, the json still needs to parsed to see if it was able to scrape

    });
});

app.listen(port);