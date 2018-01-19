var express = require('express');
var apiRoutes = express.Router();
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
var jwt = require('jsonwebtoken');
var utils = require("../utils");
var topicRepo = require('../services/Repository/topicRepository');

app.get("/test",function(req,res){
  res.send("fdsaf");
  res.end();
})
app.post("/addtopic",function(req,res){
    if (req.body.userid == null) {
        res.send({
          isSuccess: false,
          data: null,
          message: "Parameter UserId is null"
        });
        res.end();
      } else if(req.body.groupid == null) {
        res.send({
            isSuccess: false,
            data: null,
            message: "Parameter GroupId is null"
          });
          res.end();
      }else{
        topicRepo.AddTopic(req.body.userid,req.body.groupid,function(okay,topic){
            if(okay == 5)
            {
                res.send({
                    isSuccess: false,
                    data: topic,
                    message: "Error"
                  });
                  res.end();
            }
            else{
                res.send({
                    isSuccess: true,
                    data: topic,
                    message: "success"
                  });
                  res.end();
            }
        });
      }
});
module.exports = app;