/**
 * Created by Jdon on 28/03/2017.
 */
var AWS = require('aws-sdk');
AWS.config.loadFromPath(__dirname + '/config.json');
var dynamodb = new AWS.DynamoDB();
module.exports = {
    put: function (URL,domain,title,author,excerpt,content,leadImage,callback) {
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
        if(content)params.Item["Content"]= {S: content};
        if(leadImage)params.Item["leadImageURL"]= {S: leadImage};
        dynamodb.putItem(params, callback);
    },
    putdomaincheck: function (domain,type1,type2,type3,notes,callback) {
        var params = {
            Item: {
                "Domain": {
                    S: domain
                },
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: "Domains"
        };
        if(type1)params.Item["Type1"]= {S: type1};
        if(type2)params.Item["Type2"]= {S: type2};
        if(type3)params.Item["Type3"]= {S: type3};
        if(notes)params.Item["Notes"]= {S: notes};
        // console.log(domain + " types: " + type1 + "," + type2 + "," + type3 + " notes: " + notes);
        dynamodb.putItem(params, callback);
    },
    get: function (URL,callback) {
        var params = {
            Key: {
                "URL": {
                    S: URL
                },
            },
            TableName: "Scores"
        };
        dynamodb.getItem(params, callback);
    },
    getdomaincheck: function (Domain,callback) {
        var params = {
            Key: {
                "Domain": {
                    S: Domain
                },
            },
            TableName: "Domains"
        };
        dynamodb.getItem(params, callback);
    },
};