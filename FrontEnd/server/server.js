'use strict';

var express = require('express');
var app = express();
var routes = require('./routes');
let http = require('http').Server(app);
var config = require('./config').api;
var path = require('path');
// App root directory
global.appRoot = path.resolve(__dirname);
app.use(express.json({
  limit: '50mb'
}));
var path=require('path');

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
  //res.header("Content-Type", "application/json;charset=utf-8");
  console.log('header')
  next();
});
app.use('/file',express.static(path.join(__dirname,'upload/')));
//app.use(express.static('upload'))

var db = require('./dal/orm')
app.get('/  ', function (req, res) {
  res.send('123')
})
let io = require('socket.io')(http, {
  serveClient: false
});
var socketio = require('./services/socketio');

socketio.socketService(io);
routes(app);
var server = http.listen(config.port, config.host, function () {
  var host = config.host
  var port = config.port
  console.log("Example app listening at http://%s:%s", host, port)

})
