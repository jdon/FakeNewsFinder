var port = process.env.PORT || 3000;
var express = require('express');
var app = express();
var fs = require('fs');

app.get('/', function(req,res) {
	res.send(fs.readFileSync(__dirname+'/index.html','utf8'));
});

app.listen(port);