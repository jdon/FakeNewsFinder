/**
 * Created by Jdon on 28/03/2017.
 */
var AYLIENTextAPI = require('aylien_textapi');
var textapi = new AYLIENTextAPI({
    application_id: "de542d92",
    application_key: "2ad183766257e84750947020a62d0821"
});
module.exports = {
    parse: function (website,callback) {
        textapi.concepts({
            'url': website,
            'language': "en"
        },callback)
    },
};
