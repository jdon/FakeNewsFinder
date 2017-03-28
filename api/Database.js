/**
 * Created by Jdon on 28/03/2017.
 */
var AWS = require('aws-sdk');
AWS.config.loadFromPath(__dirname + '/config.json');
var dynamodb = new AWS.DynamoDB();
module.exports = {
    put: function (URL,domain,title,author,excerpt,callback) {
        var params = {
            Item: {
                "URL": {
                    S: URL
                },
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: "Scores"
        };
        if(domain)params.Item["Domain"]= {S: domain};
        if(title)params.Item["Title"]= {S: title};
        if(author)params.Item["Author"]= {S: author};
        if(excerpt)params.Item["Excerpt"]= {S: excerpt};
        dynamodb.putItem(params, callback);
    },
    get: function (URL,callback) {
        var params = {
            Item: {
                "URL": {
                    S: URL
                },
            },
            TableName: "Scores"
        };
        dynamodb.getItem(params, callback);
    },
};