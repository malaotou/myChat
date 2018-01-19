var express = require('express');
var apiRoutes = express.Router();
var app = express();
var utils = require("../utils")
var bodyParser = require('body-parser');
var response = require('../services/modules/responsemodel')
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
var jwt = require('jsonwebtoken');

var groupUserRepo = require('../services/Repository/groupuserRepository');
/*得到当前用户参加过的所有活动*/
app.get('', function (req, res) {
  console.log(req);
  res.send(new response("", "", ""));
})


app.get('/allmember', function (req, res) {
  utils.verifyToken(req, res, function (token) {
    if (token != null) {
      groupUserRepo.getMyGroupUser(req.query.groupid,req.query.isfiltered,token.id
      , function (status, message, data) {
        utils.sendResponse(res, status, message, data);
      })
    }
  })
})


// 群组添加成员
app.post('/addmember', function (req, res) {
  utils.verifyToken(req, res, function (token) {
    if (token != null) {
      console.log(token);
      groupRepo.createGroup(req.body.group, {
        account: token.account,
        id: token.id
      }, function (data, err) {
        if (err != null) {
          utils.sendResponse(res, 0, err, null);
        } else {
          utils.sendResponse(res, 1, null, data);
        }
      })
    }
  })
})

// 群组删除成员
app.get('/removememberbyId', function (req, res) {
  utils.verifyToken(req, res, function (token) {
    if (token != null && req, query.groupid != null) {
      if (req.query.id != null) {
        groupUserRepo.removeMemberbyId()
      } else {
        if (req.query.id == null) {
          utils.sendResponse(res, false, "参数id(user) 不能为空", null);
        } else {
          utils.sendResponse(res, false, "参数id(Groupid) 不能为空", null);
        }
      }
    }
  })
});

// 查询组成员信息列表
app.get('/getmemberbygroupid', function (req, res) {
  utils.verifyToken(req, res, function (token) {
    if (token != null) {
      if (req.query.groupid == null) {
        utils.sendResponse(res, false, "参数id(Groupid) 不能为空", null)
      } else {
        groupUserRepo.getMyGroupUser(req.query.groupid,req.query.isfiltered,token.id,
          function (status, message, data) {
            utils.sendResponse(res,status, message, data);
          })
      }

    }
  })
})



// // 获取组信息，依据组名称
// app.get('/getbyid', function (req, res) {
//   console.log(req.query.id);
//   utils.verifyToken(req, res, function (token) {
//     if (token != null) {
//       groupRepo.getGroupById(req.query.id, function (data, status, msg) {
//         utils.sendResponse(res, status, msg, data);
//       })
//     }
//   })
// })


// 检索我所管理的组信息
// app.get('/getMyGroup', function (req, res) {
//   utils.verifyToken(req, res, function (token) {
//     if (token == null) {
//       groupRepo.getmyAllGroup(reqreq.query.name,
//         function (status, message, data) {
//           utils.sendResponse(res,status,message,data);
//         })
//     }
//   })
// });

// 不验证用户信息
// app.get('/getAllGroup',function(req,res){
//   groupRepo.getAllGroup(function(status,message,data){
//     utils.sendResponse(res,res.status,message,data);
//   })
// })

module.exports = app;
