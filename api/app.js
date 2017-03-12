var port = process.env.PORT || 3000;
var express = require('express');
var app = express();
var fs = require('fs');

app.get('/', function(req,res) {
	res.send(fs.readFileSync(__dirname+'/index.html','utf8'));
});
app.get('/url/:url', function(req,res){
	
	var score = Math.random()*5;
	score = Math.round(score);
	res.send({url:req.params.url,score:score});
});

app.listen(port);