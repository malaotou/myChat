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

var contactRepo = require('../services/Repository/contactRepository')
app.use(bodyParser.json());
var jwt = require('jsonwebtoken');

// 获取组信息，依据组名称
app.get('', function (req, res) {
    console.log(req.query.name);
    utils.verifyToken(req, res, function (token) {
      if (token != null) {
        contactRepo.getMyContact(token, function (status, message, data) {
          utils.sendResponse(res, status, message, data);
        })
      }
    })
  }),
  //添加联系人信息
  app.post('/add', function (req, res) {
    //console.log(req.body);
    utils.verifyToken(req, res, function (token) {
      if (token != null) {
        contactRepo.createContact(req.body).then(data => {
          utils.sendResponse(res, true, 'sucess', data);
        }).catch(err => {
          utils.sendResponse(res, false, err, null);
        })
      }
    })
  }),
  //根据用户Id获取联系人(group里的信息)
  app.post('/getinfobyid', function (req, res) {
    console.log(req.body.id);
    if (req.body.id != undefined) {
      utils.verifyToken(req, res, function (token) {
        if (token != null) {
          contactRepo.getInfoByUserId(req.body.id, function (status, message, data) {
            utils.sendResponse(res, status, message, data);
          })
        }
      })
    }
  }),
  //禁用联系人内的组
  app.post('/deleteinfobyid', function (req, res) {
    if (req.body.id != undefined) {
      utils.verifyToken(req, res, function (token) {
        if (token != null) {
          contactRepo.deleteContactByIds(req.body.id, req.body.groupid, function (status, message, data) {
            utils.sendResponse(res, status, message, data);
          });
        }
      })
    }
  }),
  //测试添加更新通讯录
  app.post('/addcountact', function (req, res) {
    if (req.body.userid != undefined) {
      contactRepo.AddOrUpdateContactInfo(req.body.userid, req.body.groupid, 1, function (okay, contact) {
        if (okay)
          utils.sendResponse(res, okay, "success", contact);
        else
          utils.sendResponse(res, okay, "Error", contact);
      });
    }
  })
module.exports = app;
