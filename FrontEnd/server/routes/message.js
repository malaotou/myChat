var express = require('express');
var apiRoutes = express.Router();
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
var jwt = require('jsonwebtoken');
var msgRepo = require('../services/Repository/messageRepository');
var utils = require("../utils");
var multer = require('multer');
var storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,'/uploadFiles');
  },
  filename:function(req,file,cb){
    var fileformat = (file.originalname).split('.');
    cb(null,file.fieldname+'-'+Date.now()+'.'+fileformat[fileformat.length-1]);
  }
}) 
var upload = multer({ dest: 'uploadFiles/' });

// 测试使用，可修改
app.get('', function (req, res) {
    console.log(req);
    res.send({
      id: 1,
      name: 'name',
      age: 12
    });
  });
  app.post('/getunreadmsg',function(req,res){
    if (req.body.userid == null) {
        utils.sendResponse(res, false, "Parameter UserId is null", null);
    } else if(req.body.topicid == null) {
        utils.sendResponse(res, false, "Parameter TopicId is null", null);
    }else{
      msgRepo.GetUnreadMessage(req.body.userid,req.body.topicid,function(okay,messages){
        if(okay){
          utils.sendResponse(res, true, "sucess", messages);
        }
        else
        {
          utils.sendResponse(res, false, messages, null);
        }
      });
    }
  });
  app.post('/readmsg',function(req,res){
    if (req.body.userid == null) {
        utils.sendResponse(res, false, "Parameter UserId is null", null);
    } else if(req.body.topicid == null) {
        utils.sendResponse(res, false, "Parameter TopicId is null", null);
    }else{
      msgRepo.MessageRead(req.body.userid,req.body.topicid,function(okay,messages){
        if(okay){
          utils.sendResponse(res, true, "sucess", null);
        }
        else
        {
          utils.sendResponse(res, false, messages, null);
        }
      });
    }
  });
  //测试保存消息图片
  app.post('/testpic',function(req,res){
    msgRepo.SaveMessageImg(req.body.message,function(status,message,data){
      if(status){
        utils.sendResponse(res, true, "sucess", null);
      } else {
        utils.sendResponse(res, false, message, null);
      }
    })
  });
  //测试保存文件和语音消息
  app.post('/testfile', upload.single('avatar'), function(req, res, next){

    //console.log(req.file);
    //if(res.statusMessage == 'OK'){
      utils.sendResponse(res,true,'success',null);
    //}else{
      //utils.sendResponse(res, false, 'failed', null);
    //}
  });
module.exports = app;
