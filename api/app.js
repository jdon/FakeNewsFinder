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
        }
        res.send({url:url,score:score,result:result});

    });
});

app.listen(port);