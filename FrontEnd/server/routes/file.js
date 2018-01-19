var express = require('express');
var apiRoutes = express.Router();
var app = express();
var utils = require("../utils")
var bodyParser = require('body-parser');
var response = require('../services/modules/responsemodel')
var async = require('async');
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json());
var jwt = require('jsonwebtoken');

var fileRepo = require('../services/Repository/fileRepository');

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
  //res.header("Content-Type", "application/json;charset=utf-8");
  console.log('header')
  next();
});
// 根据文件名获取文件信息
app.get('', function (req, res) {
  console.log(req.query.name);
  fileRepo.getFile(req.query.name).then(data => {
    console.log(data);
    utils.sendResponse(res, true, null, data);
  }).catch(err => {
    utils.sendResponse(res, false, err, null);
  })
});
//保存文件信息到服务器，并返回唯一文件名
app.post('', function (req, res) {
  //console.log(req.body);
  fileRepo.saveFile(req.body.name, req.body.ext, req.body.blob).then(data => {
    utils.sendResponse(res, true, 'sucess', data);
    console.log(data);
  }).catch(err => {
    console.log(err);
    utils.sendResponse(res, false, err, null);
  })

});
module.exports = app;
