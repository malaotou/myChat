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



var groupRepo = require('../services/Repository/groupRepository');
var groupUserRepo = require('../services/Repository/groupuserRepository');
var userRep = require('../services/Repository/userRepository');
var contactRep = require('../services/Repository/contactRepository');
/*得到当前用户参加过的所有活动*/
app.get('', (req, res) => {
  console.log(req);
  res.send(new response("", "", ""));
})

app.post('/addV1', (req, res) => {
    utils.verifyToken(req, res, token => {
      if (token != null) {
        if (req.body.group == undefined) {
          utils.sendResponse(res, false, "group 参数不能为空", null);
        } else {
          groupRepo.createGroup(req.body.group,
            req.body.users, {
              account: token.account,
              id: token.id
            },
            (data, err) => {
              console.log(err, data);
              if (err != null) {
                utils.sendResponse(res, false, err, null);
              } else {
                utils.sendResponse(res, true, null, data);
              }
            })
        }


      }
    })
  }),
  // 修正版，with Transaction ，with Promise with Batch
  app.post('/add', (req, res) => {
    utils.verifyToken(req, res, token => {
      if (token != null) {
        console.log(req.body.group);
        groupRepo.CreateGroupV2(req.body.group, req.body.users, token).then(data => {
            // Create Contact -Return Users and groupid
            contactRep.createContact(data.data).then(rtn => {
              utils.sendResponse(res, true, 'sucess', rtn)
            }).catch(err => {
              utils.sendResponse(res, false, err, null);
            })
            //utils.sendResponse(res, true, 'sucess', null)
          })
          .catch(err => {
            console.log(err);
            utils.sendResponse(res, false, err, null);
          })
      }
    })
  }),

  app.post('/update', (req, res) => {
    utils.verifyToken(req, res, token => {
      if (token != null) {
        if (req.body.id == null || req.body.id == undefined) {
          utils.sendResponse(res, false, "group Id 参数不能为空", null);
        } else {
          try {
            groupRepo.UpdateGroupByIdV2({
              id: req.body.id,
              name: req.body.group.name,
              description: req.body.group.description,
              avatarsrc: req.body.group.avatarsrc,
              modified_by: token.id,
              fileExt: req.body.group.fileExt
            }, function (status, message, data) {
              if (status) {
                if (req.body.users != null) {
                  var resUsers = [];
                  async.eachSeries(req.body.users, (element, callback) => {
                    console.log(element)
                    if (element.status == 1) {
                      userRep.addInviteUser({
                        id: req.body.id,
                        creator: token.id
                      }, element, token, (status, message, data) => {
                        console.log(message);
                        if (status) {
                          resUsers.push(element);
                        }
                        callback(null);
                      })
                    } else if (element.status == 0) {
                      groupUserRepo.removeMemberbyId({
                        id: req.body.id,
                        modified_by: token.id
                      }, element, (status, message, data) => {
                        console.log(message);
                        callback(null);
                      })
                    } else if (element.status == null) {
                      callback(null);
                      utils.sendResponse(res, false, 'status 参数不能为空', null);
                    }
                  }, function (err) {
                    if (err) {
                      console.log(err);
                    } else {
                      utils.sendResponse(res, true, message, resUsers);
                    }
                  })
                } else {
                  utils.sendResponse(res, false, "用户信息为空", null);
                }
              } else {
                utils.sendResponse(res, false, message, null);
              }
            });
          } catch (err) {
            console.log(err);
            utils.sendResponse(res, false, err, null);
          }
        }
      }
    });
  })


// groupRepo.createGroup(req.body.group, req.body.users, {
//   account: token.account,
//   id: token.id
// }, function (data, err) {
//   if (err != null) {
//     utils.sendResponse(res, false, err, null);
//   } else {
//     utils.sendResponse(res, true, null, data);
//   }
// })






// 获取组信息，依据组名称
app.get('/getbyname', (req, res) => {
  console.log(req.query.name);
  utils.verifyToken(req, res, token => {
    if (token != null) {
      groupRepo.getGroupByName(req.query.name, (data, status, msg) => {
        utils.sendResponse(res, status, msg, data);
      })
    }
  })
})

// 获取组信息，依据组名称
app.get('/getbyid', (req, res) => {
  console.log(req.query.id);
  utils.verifyToken(req, res, token => {
    if (token != null) {
      groupRepo.getGroupById(req.query.id, (data, status, msg) => {
        utils.sendResponse(res, status, msg, data);
      })
    }
  })
})


// 检索我所管理的组信息
app.get('/getMyGroup', (req, res) => {
  utils.verifyToken(req, res, token => {
    if (token != null) {
      utils.decode(token)
      groupRepo.getmyAllGroup(token.account,
        (status, message, data) => {
          utils.sendResponse(res, status, message, data);
        })
    }
  })
});
// 检索我所管理的组信息-分页
app.get('/getMyGroupWithPager', (req, res) => {
  utils.verifyToken(req, res, token => {
    if (token != null) {
      utils.decode(token)
      groupRepo.getmyAllGroupbyPager(token.account, req.query.index,
        (status, message, data) => {
          utils.sendResponse(res, status, message, data);
        })
    }
  })
});
//getmyAllGroupbyPager

// 不验证用户信息
app.get('/getAllGroup', (req, res) => {
  groupRepo.getAllGroup((status, message, data) => {
    utils.sendResponse(res, status, message, data);
  })
});
app.delete('/delete', (req, res) => {
  if (req.body != null && req.body.id != null) {
    groupRepo.removeGroupById(req.body.id).then(data => {
      utils.sendResponse(res, true, data.message, null);
    }).catch(err => {
      utils.sendResponse(res, false, err.message, null);
    })
  } else {
    utils.sendResponse(res, false, 'parameter id cano not be empty', null);
  }

})

module.exports = app;
