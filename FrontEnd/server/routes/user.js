    var express = require('express');
    var md5 = require('md5');
    var apiRoutes = express.Router();
    var app = express();
    var bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({
      extended: false
    }));
    app.use(bodyParser.json());
    var jwt = require('jsonwebtoken');
    var utils = require("../utils");
    var userRepo = require('../services/Repository/userRepository');
    /*得到当前用户参加过的所有活动*/
    app.get('', function (req, res) {
      console.log(req);
      res.send({
        id: 1,
        name: 'name',
        age: 12
      });
    });


    app.get('/all', function (req, res) {
      userRepo.getAllUser(function (status, message, body) {
        //console.log(body);
        // body.data.forEach(element => {
        //   console.log(element.avatarsrc);
        // });

        utils.sendResponse(res, status, message, body);
      });
    })
    //登录
    app.post("/login", function (req, res) {
      console.log(req);
      if (req.body == null) {
        res.send({
          isSuccess: false,
          data: null,
          message: "Account is null"
        });
        res.end();
      } else {
        // 验证用户身份是否合法
        userRepo.login(req.body.account, req.body.password, function (okay, user) {
          if (okay) {
            console.log(user);
            // 合法，则颁发Token，并返回给客户端。
            var token = jwt.sign({
              account: user.dataValues.account,
              id: user.dataValues.id
            }, 'password', {
              expiresIn: '365d'
            });
            res.header("Access-Control-Allow-Headers", "Content-Type, authorization")
            console.log(token);
            res.send({
              isSuccess: true,
              data: {
                token: token,
                user: user
              },
              message: "success"
            });
            res.end();
          } else {
            res.send({
              isSuccess: false,
              data: null,
              message: "verification failed"
            });
            res.end();
          }
        });
      }
    });
    //注册新用户
    app.post('/register', function (req, res) {
      console.log(req.body);
      if (req.body == null) {
        res.send({
          isSuccess: false,
          data: null,
          message: "Parameter is null"
        });
        res.end();
      } else {
        userRepo.getUserByAccountId(req.body.account, function (okay, data) {
          if (okay == 0) {
            // 登记信息至数据库       
            userRepo.addUser(req.body, function (status, message, data) { // user 注册的user信息，message 为返回的自定义消息
              console.log(data);
              res.send({
                isSuccess: true,
                data: data,
                message: message
              });
              res.end();
            })
          } else {
            res.send({
              isSuccess: false,
              data: null,
              message: "User exists"
            });
            res.end();
          }
        });
      }
    });
    //更新密码
    app.post('/updatepwd', function (req, res) {
      if (req.body == null) {
        res.send({
          isSuccess: false,
          data: null,
          message: "Parameter is null"
        });
        res.end();
      } else {
        console.log("开始更新2", req.body);
        //更新密码
        userRepo.updatePwd(req.body.id, req.body.oldpassword, req.body.password, function (okay, data) {
          if (okay) {
            // 更新成功
            console.log(data);
            res.send({
              isSuccess: true,
              data: data,
              message: "success"
            });
            res.end();
          } else {
            res.send({
              isSuccess: false,
              data: null,
              message: "User not exists"
            });
            res.end();
          }
        });
      }
    });
    //更新用户信息
    app.post('/updateinfo', function (req, res) {
      console.log(req.body);
      if (req.body == null) {
        res.send({
          isSuccess: false,
          data: null,
          message: "Parameter is null"
        });
        res.end();
      } else {
        //更新
        userRepo.updateInfo(req.body, function (okay, message, data) {
          if (okay) {
            // 更新成功
            console.log(data);
            res.send({
              isSuccess: true,
              data: data,
              message: message
            });
            res.end();
          } else {
            res.send({
              isSuccess: false,
              data: null,
              message: message
            });
            res.end();
          }
        });
      }
    });

    app.post('testuser', (function (req, res) {
      userRepo.addUser({
        account: req.body.account,
        password: md5(req.body.password),
      })
    }));
    app.post('/getuserinfobyaccount', function (req, res) {
      if (req.body == null) {
        res.send({
          isSuccess: false,
          data: null,
          message: "Parameter is null"
        });
        res.end();
      } else {
        userRepo.getUserByAccountId(req.body.account, function (okay, data) {
          if (okay == 1) {
            console.log(data);
            res.send({
              isSuccess: true,
              data: data,
              message: "success"
            });
            res.end();
          } else {
            res.send({
              isSuccess: false,
              token: null,
              message: "User exists"
            });
            res.end();
          }
        })
      }
    });

    app.post('/getuserinfobyid', function (req, res) {
      if (req.body == null) {
        res.send({
          isSuccess: false,
          data: null,
          message: "Parameter is null"
        });
        res.end();
      } else {
        userRepo.getUserById(req.body.id, function (okay, data) {
          if (okay == 1) {
            console.log(data);
            res.send({
              isSuccess: true,
              data: data,
              message: "success"
            });
            res.end();
          } else {
            res.send({
              isSuccess: false,
              token: null,
              message: "User exists"
            });
            res.end();
          }
        })
      }
    });

    app.post('/updateavatarsrc', function (req, res) {
      console.log(req.body);
      if (req.body == null) {
        res.send({
          isSuccess: false,
          data: null,
          message: "Parameter is null"
        });
        res.end();
      } else {
        //更新头像
        userRepo.updateAvatarsrc(req.body.id, req.body.avatarsrc, req.body.fileExt, function (status, message, data) {
          if (status) {
            // 更新成功
            console.log(data);
            res.send({
              isSuccess: true,
              data: data,
              message: "success"
            });
            res.end();
          } else {
            res.send({
              isSuccess: false,
              data: null,
              message: message
            });
            res.end();
          }
        })
      }
    });
    module.exports = app;
