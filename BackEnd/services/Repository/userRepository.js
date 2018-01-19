 var db = require('../../dal/orm')
 var md5 = require('md5');
 var groupuserRep = require('./groupuserRepository');
 var fileRep = require('./fileRepository');
 // var User=require('../domain/userinfo');
 // module.exports=function(userinfo){
 //     User.name=userinfo.name;
 //     User.password=userinfo.password;
 //     db.User.save({
 //         name=userinfo.name,
 //         password=userinfo.password,
 //     });
 // } 

 // var person = db.Person.build({
 //     username: "laotou",
 //     user_id: 2,
 //     email: "mamou@ma.com",
 //     creater: 2,
 //     createdAt: "2017-10-27",
 //     updatedAt: "2017-10-27"
 //   });
 //   person.save()
 //     .then(function (o) {
 //       console.log('保存成功！')
 //     });

  var userRepo = {
   // 创建新用户信息
    addUser: function (body, callback) {
      return new Promise((resolve, reject) => {
        // if (body.avatarsrc != null && body.fileExt != null) {
        //   fileRep.saveFile(body.account, body.fileExt, body.avatarsrc).then(filename=>{
        //     img = filename;
        //   }).catch(err=>{
        //     callback(status, 'pic generate failed'+err, null);
        //   })
        // }
        db.User.build({
          account: body.account,
          password: md5(body.password),
          name: body.name,
          nickname: body.nickname,
          avatarsrc: null,
          //fileaddress:img,
          gender: body.gender,
          creator: body.creator
          //fileExt:body.fileExt
        }).save().then(user=>{
          console.log(user);
          callback(true, 'user add succeed', user);
        }).catch(err=>{
          console.log(err);
          callback(false, 'user add failed'+err, null);
        })
      });
    },
    // 创建邀请用户
    addInviteUser: function (group, user, manager, callback) {
      if (user != null) {
        db.User.find({
          where: {
            account: user.account
          }
        }).then(u => {
          if (u == null) {
            db.User.build({
                account: user.account,
                password: md5(123456),
                creator: manager.id,
                disabled:false
              })
              .save()
              .then(u => {
                groupuserRep.createGroupUser(group, u, manager, function (status, message, data) {
                  callback(status, message, data);
                })
              })
          }else{
            groupuserRep.createGroupUser(group,user, manager, function (status, message, data) {
              callback(status, message, data);
            })
          }
        })
      } else {
        callback(true, "user 参数为空", null);
      }
    },
    // 获取所有或特定用户
    getAllUser: function (callback) {
      db.User.findAll({
          where: {
            disabled: false
          }
        })
        .then(users => {
          callback(true, 'sucess', users);
        })
        .catch(err => callback(false, err, null))
    },
    // 获取指定用户名的用户信息
    getUserByAccountId: function (account, callback) {
      db.User.find({
          where: {
            account: account
          }
        })
        .then(user => {
          if (user != null) {
            callback(1, user);
          } else {
            callback(0, 'User doesnot exist')
          }
        })
        .catch(err => {
          console.log(err);
          callback(2, err);
        })
    },
    // 获取指定用户信息
    getUserById: function (id, callback) {
      db.User.find({
          where: {
            id: id
          }
        })
        .then(user => {
          console.log(user);
          callback(1, user);
        })
        .catch(err => {
          console.log(err);
          callback(0, user);
        })
    },
    //登录
    login: function (account, password, callback) {
      var encryPWS = md5(password);
      // console.log(password);
      db.User.find({
          where: {
            account: account,
            password: encryPWS
          }
        })
        .then(user => {
          if (user != null) {
            // 验证通过
            //console.log(user);
            callback(true, user);
          } else {
            // 验证不通过
            console.log('验证不通过');
            callback(false, 'User doesnot exist')
          }
        })
        .catch(err => {
          console.log(err);
          callback(false, err);
        })
    },
    updatePwd: function (id, oldpassword, newpassword, callback) {
      //var encryOldPWS = md5(oldpassword);
      db.User.find({
          where: {
            id: id,
            password: oldpassword
          }
        })
        .then(user => {
          console.log(user);
          if (user != null) {
            var encryPWS = newpassword;
            user.updateAttributes({
                password: encryPWS
              }).then(user => {
                  callback(true, user);
             })
              .catch(err => {
                console.log(err);
                callback(false, err);
              })
          } else {
            callback(false, 'User doesnot exist')
          }
        })
        .catch(err => {
          console.log(err);
          callback(false, err);
        })
    },
    //更新用户信息
    updateInfo: function (body, callback) {
      db.User.find({
        where: {
          id: body.id
        }
      }).then(user => {
          if (user != null) {
            user.updateAttributes({
              name: body.name,
              account: body.account,
              nickname: body.nickname,
              gender: body.gender,
              }).then(user => {
                db.User.find({
                  where: {
                    id: user.id
                  }
                }).then(user=>{
                  if(body.avatarsrc != null && body.fileExt != null){
                    userRepo.updateAvatarsrc(body.id,body.avatarsrc,body.fileExt,function(status,message,data){
                      if(status){
                        callback(true, 'update userinfo succeed', data);
                      }else{
                        callback(false,'update pic failed', null);
                      }
                    })
                  }else{
                    callback(true, 'update userinfo succeed', user);
                  }
                }).catch(err=>{
                  console.log(err);
                  callback(false, 'update failed', err);
                })
          }).catch(err => {
              console.log(err);
              callback(false, 'update failed', err);
          });
        } else {
          callback(false, 'User doesnot exist',null)
        }
      }).catch(err => {
        console.log(err);
        callback(false, err);
      })
    },
   //更新用户头像
    updateAvatarsrc: function (id, avatarsrc,fileExt,callback) {
      db.User.find({
        where: {
          id: id
        }
      }).then(user => {
        if (user != null) {
          fileRep.saveFile(user.account, fileExt, avatarsrc).then(fileObj => {
            if (fileObj.address != null) {
              user.updateAttributes({
                fileaddress: fileObj.address,
                fileExt:fileExt
              }).then(user => {
                  console.log(user);
                  callback(true,'succeed',user);
                  }).catch(err => {
                console.log(err);
                callback(false,'failed '+err,null);
              });
            } else {
              callback(false,'failed'+err,null);
            }
            }).catch(err => {
            console.log(err);
            callback(false,'failed '+err,null);
          });
        } else {
          callback(false,'User not exists',null);
        }
      }).catch(err => {
        console.log(err);
        callback(false,'failed '+err,null);
      });
    }
  }
 module.exports = userRepo;
