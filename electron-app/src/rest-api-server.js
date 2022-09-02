var express = require('express');
var app_express = express();

var rest_api_server = app_express.listen(7777, function () {
     var host = rest_api_server.address().address;
     var port = rest_api_server.address().port;
     console.log("Lin listening at http://%s:%s", host, port);
});

app_express.use(express.json());

module.exports = app_express;
