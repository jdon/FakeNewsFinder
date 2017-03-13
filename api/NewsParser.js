/**
 * Created by Jdon on 12/03/2017.
 */
var http = require('http');
var request = require('request');
module.exports = {
    parse: function (website,callback) {
        var options = {
            url: 'https://mercury.postlight.com/parser?url=http://'+website,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': '095z5tX5ZpjfEkuecAhkq5tc1itJYzKJFTnjC2V2',
            }
        };
        request.get(options,callback);
    },
};