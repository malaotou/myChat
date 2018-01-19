var db = require('../../dal/orm')
var md5 = require('md5');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
var devices = require('../modules/globalvariables').devices;
var async = require('async');
var fileRep = require('./fileRepository');
var userRep = require('./userRepository');
var messageFileRep = require('./messageFileRepository');
//消息管理
var messagerepo = {
  //获取未读消息
  GetUnreadMessage: function (userid, topicid, callback) {
    messagerepo.JudgeTopicStatusAndAddMessage(userid, topicid, function (okay, msg) {
      if (okay) {
        db.MessagePush.findAll({
            attributes: ['MessageId'],
            where: {
              TopicId: topicid,
              ReceiveUserId: userid,
              ReceiveStatus: 0
            }
          })
          .then(messages => {
            var data = [];
            messages.forEach(element => {
              data.push(element.MessageId);
            });
            db.Message.findAll({
                where: {
                  id: {
                    [Op.in]: data
                  }
                }
              })
              .then(message => {
                if (message.length > 0) {
                  async.mapSeries(message, function (msg, cb) {
                    //获取发送人的姓名和头像
                    messagerepo.GetSendUserNameAndFilePath(msg.SendUserId, function (okay, name, fileaddress) {
                      if (okay) {
                        var da = msg.dataValues;
                        da.name = name;
                        da.fileaddress = fileaddress;
                        cb(null, da);
                      } else
                        cb(null, name);
                    });

                  }, function (error, result) {
                    if (error == null)
                      callback(true, result);
                    else
                      callback(false, error);
                  });
                } else
                  callback(true, message);
              })
              .catch(err => {
                console.log(err);
                callback(false, err);
              });
          })
          .catch(err => {
            console.log(err);
            callback(false, err);
          });
      } else
        callback(false, msg);
    });
  },
  //消息已读
  MessageRead: function (userid, topicid, callback) {
    db.MessagePush.update({
        ReceiveStatus: 1,
        modified_date: Date.now()
      }, {
        where: {
          TopicId: topicid,
          ReceiveUserId: userid,
          ReceiveStatus: 0
        }
      })
      .then(message => {
        callback(true, message);
      })
      .catch(err => {
        console.log(err);
        callback(false, err);
      });
  },

  //保存文本消息
  SaveMessageText: function (message, callback) {
    //保存消息
    db.Message.build({
        SendUserId: message.SendUserId,
        TopicId: message.TopicId,
        Content: message.Content,
        MessageType: 0,
        Status: 0,
        disabled: 0,
        created_date: Date.now(),
        sendtype: message.sendtype
      })
      .save()
      .then(messageinfo => {
        console.log('message add success');
        messagerepo.GetSendUserNameAndFilePath(messageinfo.SendUserId, function (okay, name, fileaddress) {
          if (okay) {
            var da = messageinfo.dataValues;
            da.name = name;
            da.fileaddress = fileaddress;
            //callback(true,message);
            switch (parseInt(messageinfo.sendtype)) {
              //1客户，2客服回复客户，3协作，4组内聊天，5.系统消息(协作组)，6系统消息（客户）
              //发送消息到协作组内
              case 1:
              case 3:
              case 5:
                //发送到协作组
                messagerepo.PushMessageToGroupAll(
                  messageinfo.id, messageinfo.TopicId, messageinfo.SendUserId, 1,
                  function (okay, err, userlist) {
                    if (okay) {
                      callback(true, da, userlist);
                    } else {
                      callback(false, err, null);
                    }
                  });
                break;
                //发送消息到客户和协作组
              case 2:
              case 6:
                messagerepo.PushMessageToClient(
                  messageinfo.id, messageinfo.TopicId, messageinfo.SendUserId, 0,
                  function (okay, err, userlist) {
                    if (okay) {
                      callback(true, da, userlist);
                    } else {
                      callback(false, err, null);
                    }
                  });
                break;
                //发送信息到组内所有人（除发送人）
              case 4:
                messagerepo.PushMessageInGroup(
                  messageinfo.id, messageinfo.TopicId, messageinfo.SendUserId, 1,
                  function (okay, err, userlist) {
                    if (okay) {
                      callback(true, da, userlist);
                    } else {
                      callback(false, err, null);
                    }
                  });
                break;
              default:
                callback(false, "No send message type");
                break;
            }
          } else {
            callback(false, name, null);
          }
        });
      })
      .catch(err => {
        console.log(err);
        callback(false, err, null);
      });
  },
  //获取消费发送者的姓名和头像
  GetSendUserNameAndFilePath: function (userid, callback) {
    if (userid == 0) {
      callback(true, "系统消息", null);
    } else {
      userRep.getUserById(userid, function (okay, userinfo) {
        if (okay) {
          callback(true, userinfo.name, userinfo.fileaddress);
        } else {
          callback(false, userinfo, null);
        }
      });
    }
  },
  //发送人角色查询，0错误，1用户，2客服，3协作人员,4组内会话，5管理员
  GetSendUserRole: function (userid, topicid, callback) {
    db.Topic.find({
        where: {
          id: topicid
        }
      })
      .then(topic => {
        if (topic != null)
          db.GroupUser.find({
            where: {
              groupId: topic.groupid,
              usertype: 2
            }
          }).then(groupuser => {
            if (topic != null) {
              if (topic.topictype == 0) {
                if (topic.userid == userid) {
                  callback(1, topic, false);
                } else if (topic.ProfessionalId == userid) {
                  if (groupuser.userId == userid)
                    callback(2, topic, true);
                  else
                    callback(2, topic, false);
                } else {
                  if (groupuser.userId == userid)
                    callback(3, topic, true);
                  else
                    callback(3, topic, false);
                }
              } else {
                //callback(4, topic);
                if (groupuser.userId == userid)
                  callback(4, topic, true);
                else
                  callback(4, topic, false);
              }

            } else {
              callback(0, "null", false);
            }
          }).catch(err => {
            callback(0, err, false);
          })
      })
      .catch(err => {
        console.log(err);
        callback(0, err, false);
      });
  },
  //推送消息到协作组除自己外的所有人
  PushMessageToGroupAll: function (messageid, topicid, senduserid, messagetype, callback) {
    var userlist = new Array();
    db.Cooperator.findAll({
        where: {
          TopicId: topicid,
          UserId: {
            [Op.ne]: senduserid
          }
        }
      })
      .then(cooperator => {
        if (cooperator.length != 0) {
          async.mapSeries(cooperator, function (coop, cb) {
            db.MessagePush.build({
                MessageId: messageid,
                TopicId: topicid,
                ReceiveUserId: coop.UserId,
                ReceiveStatus: 0,
                messagetype: messagetype,
                created_date: Date.now(),
                Disabled: 0
              })
              .save()
              .then(messagepush => {
                console.log("messagepush:" + messagepush);
                cb(null, messagepush);
              })
              .catch(err => {
                console.log("messagepush:" + err);
                cb(null, err);
              });
          }, function (error, result) {
            if (error == null)
              callback(true, null, result);
            else
              callback(false, error, null);
          });
        } else {
          callback(true, null, null);
        }
      })
      .catch(err => {
        console.log("cooperator:" + err);
        callback(false, err, null);
      });

  },
  //推送未读信息到客户
  PushMessageToClient: function (messageid, topicid, senduserid, messagetype, callback) {

    db.Topic.find({
        where: {
          id: topicid
        }
      })
      .then(topic => {
        db.MessagePush.build({
            MessageId: messageid,
            TopicId: topicid,
            ReceiveUserId: topic.userid,
            ReceiveStatus: 0,
            messagetype: messagetype
          })
          .save()
          .then(messagepush => {
            messagerepo.PushMessageToGroupAll(messageid, topicid, senduserid, messagetype, function (okay, err, userlist) {
              if (okay) {
                if (userlist != null)
                  userlist.push(topic.userid);
                else {
                  userlist = new Array();
                  userlist.push(topic.userid);
                }
                callback(true, null, userlist);
              } else {
                callback(false, err, null);
              }
            });
          })
          .catch(err => {
            console.log("messagepush:" + err);
            callback(false, err, null);
          });
      })
      .catch(err => {
        console.log("topic:" + err);
        callback(false, err, null);
      });

  },
  //组内聊天推送消息
  PushMessageInGroup: function (messageid, topicid, senduserid, messagetype, callback) {
    var userlist = new Array();
    db.Topic.find({
        where: {
          id: topicid
        }
      })
      .then(topic => {
        db.GroupUser.findAll({
            where: {
              groupId: topic.groupid,
              userId: {
                [Op.ne]: senduserid
              }
            }
          })
          .then(groupuser => {
            async.mapSeries(groupuser, function (group, cb) {
              db.MessagePush.build({
                  MessageId: messageid,
                  TopicId: topicid,
                  ReceiveUserId: group.userId,
                  ReceiveStatus: 0,
                  messagetype: messagetype
                })
                .save()
                .then(messagepush => {
                  userlist.push(group.userId);
                  console.log("messagepush:" + messagepush);
                  cb(null, messagepush);
                })
                .catch(err => {
                  console.log("messagepush:" + err);
                  cb(null, err);
                });
            }, function (error, result) {
              if (error == null)
                callback(true, null, userlist);
              else
                callback(false, error, null);
            });
          })
          .catch(err => {
            console.log("cooperator:" + err);
            callback(false, err, null);
          });
      })
      .catch(err => {
        console.log("topic:" + err);
        callback(false, err, null);
      });

  },
  //保存图片消息
  SaveMessageImg: function (message, callback) {
    if (message.pic != null) {
      fileRep.saveFile(message.name, message.fileExt, message.pic).then(rtn => {
        if (rtn.address != null) {
          db.Message.build({
              SendUserId: message.SendUserId,
              TopicId: message.TopicId,
              Content: rtn.address,
              MessageType: 3,
              Status: 0,
              disabled: 0,
              created_date: Date.now(),
              sendtype: message.sendtype
            })
            .save()
            .then((
              messagecreated
            ) => {
              messageFileRep.createMessageFile({
                id: messagecreated.id,
                FileContent: message.pic,
                FileOriginalName: message.name,
                FileExt: message.fileExt,
                Creator: message.SendUserId
              }, function (messageFile, messrtn) {
                console.log(1);
                return messagecreated;
              })

              // console.log(Object.assign({}, messagecreated.dataValues, {
              //   FileOriginalName: message.name,
              //   FileExt: message.fileExt
              // }));
              // console.log('===============================');
              // console.log(messagecreated.dataValues);
              // console.log('===============================');
              return Object.assign({}, messagecreated.dataValues, {
                FileOriginalName: message.name,
                FileExt: message.fileExt,
                MessageType: rtn.isImg == true ? 3 : 4
              });

            })
            .then(messageinfo => {
              console.log(messageinfo)
              console.log('message add success ' + rtn.address);
              switch (parseInt(messageinfo.sendtype)) {
                //1客户，2客服回复客户，3协作，4组内聊天，5.系统消息(协作组)，6系统消息（客户）
                //发送消息到协作组内
                case 1:
                case 3:
                case 5:
                  //发送到协作组
                  messagerepo.PushMessageToGroupAll(
                    messageinfo.id, messageinfo.TopicId, messageinfo.SendUserId, 1,
                    function (okay, err, userlist) {
                      if (okay) {
                        callback(true, messageinfo, userlist);
                      } else {
                        callback(false, err, null);
                      }
                    });
                  break;
                  //发送消息到客户和协作组
                case 2:
                case 6:
                  messagerepo.PushMessageToClient(
                    messageinfo.id, messageinfo.TopicId, messageinfo.SendUserId, 0,
                    function (okay, err, userlist) {
                      if (okay) {
                        callback(true, messageinfo, userlist);
                      } else {
                        callback(false, err, null);
                      }
                    });
                  break;
                  //发送信息到组内所有人（除发送人）
                case 4:
                  messagerepo.PushMessageInGroup(
                    messageinfo.id, messageinfo.TopicId, messageinfo.SendUserId, 1,
                    function (okay, err, userlist) {
                      if (okay) {
                        callback(true, messageinfo, userlist);
                      } else {
                        callback(false, err, null);
                      }
                    });
                  break;
                default:
                  callback(false, "No send message type");
                  break;
              }
            }).catch(err => {
              console.log(err);
              callback(false, "Message sent falied");
            })

        } else {
          callback(false, "Message sent falied");
        }
      })
    }
  },
  //保存文件消息
  SaveMessageFile: function (body, callback) {
    //if(body.pic != null){
    fileRep.saveFileV2().then(upload => {
      //console.log(upload);
      // if(filename != null){
      //     db.Message.build({
      //         SendUserId:body.SendUserId,
      //         TopicId:body.TopicId,
      //         Content:filename,
      //         MessageType:3,
      //         Status:0,
      //         disabled:0,
      //         created_date:Date.now(),
      //         sendtype:body.sendtype
      //     }).save().then(messageinfo=>{
      //         console.log('message add success ' + filename);
      //         switch(parseInt(messageinfo.sendtype)){
      //             //1客户，2客服回复客户，3协作，4组内聊天，5.系统消息(协作组)，6系统消息（客户）
      //             //发送消息到协作组内
      //             case 1:
      //             case 3:
      //             case 5:
      //             //发送到协作组
      //                 messagerepo.PushMessageToGroupAll(
      //                     messageinfo.id,messageinfo.TopicId,messageinfo.SendUserId,1,function(okay,err,userlist){
      //                         if(okay){
      //                             callback(true,messageinfo,userlist);
      //                         }else{
      //                             callback(false,err,null);
      //                         }
      //                 });
      //             break;
      //             //发送消息到客户和协作组
      //             case 2:
      //             case 6:
      //                 messagerepo.PushMessageToClient(
      //                     messageinfo.id,messageinfo.TopicId,messageinfo.SendUserId,0,function(okay,err,userlist){
      //                         if(okay){
      //                             callback(true,messageinfo,userlist);
      //                         }else{
      //                             callback(false,err,null);
      //                         }
      //                     });                
      //             break;
      //             //发送信息到组内所有人（除发送人）
      //             case 4:
      //                 messagerepo.PushMessageInGroup(
      //                     messageinfo.id,messageinfo.TopicId,messageinfo.SendUserId,1,function(okay,err,userlist){
      //                         if(okay){
      //                             callback(true,messageinfo,userlist);
      //                         }else{
      //                             callback(false,err,null);
      //                         }
      //                     });
      //             break;
      //             default:
      //             callback(false, "No send message type");
      //             break;
      //         }
      //     }).catch(err=>{
      //         console.log(err);
      //         callback(false,"Message sent falied");
      //     })
      // }else{
      //     callback(false,"Message sent falied");
      // }
    })
    //}
  },
  //撤回消息

  //获取特殊消息

  //获取登录用户的未读消息会话列表
  getunreadtopics: function (userid, callback) {
    var topics;
    //db.MessagePush.findAll()
  },

  //添加设备在线列表
  updatedeviceslist: function (userid, socketid) {
    var okay = false;
    devices.forEach(device => {
      if (device.userid == userid && device.socketid == socketid) {
        okay = true;
        device.ontime = Date.now();
      }
    });
    if (!okay) {
      devices.push({
        userid: userid,
        socketid: socketid,
        ontime: Date.now()
      });
      console.log("devices in online:UserID:" + userid + "  socketid:" + socketid);
    }
  },

  //获取指定用户的设备列表
  GetOnlineDevicesList: function (userid) {
    var deviceslist = new Array();
    devices.forEach(device => {
      if (device.userid == userid) {
        deviceslist.push(device);
      }
    });
    return deviceslist;
  },

  //保存消息并发送到指定人员
  SaveAndPushMessageToUser: function (message, pushuserid, callback) {
    //保存消息
    db.Message.build({
        SendUserId: message.SendUserId,
        TopicId: message.TopicId,
        Content: message.Content,
        MessageType: message.MessageType,
        Status: 0,
        disabled: 0,
        created_date: Date.now(),
        sendtype: message.sendtype
      })
      .save()
      .then(messageinfo => {
        var messagetype = 0;
        //1客户，2客服回复客户，3协作，4组内聊天，5.系统消息(协作组)，6系统消息（客户）
        switch (messageinfo.sendtype) {
          case 1:
          case 2:
          case 6:
            messagetype = 0;
            break;
          case 3:
          case 4:
          case 5:
            messagetype = 1;
            break;
          default:
            messagetype = 2;
            break;
        }
        messagerepo.PushMessageToUser(messageinfo.id, pushuserid, message.TopicId,
          messagetype,
          function (okay, messagepush) {
            if (okay)
              callback(true, messageinfo);
            else
              callback(false, messageinfo);
          });
      })
      .catch(err => {
        callback(false, err);
      });
  },
  //推送消息到指定人员
  PushMessageToUser: function (messageid, pushuserid, topicid, messagetype, callback) {
    db.MessagePush.build({
        MessageId: messageid,
        TopicId: topicid,
        ReceiveUserId: pushuserid,
        ReceiveStatus: 0,
        messagetype: messagetype
      })
      .save()
      .then(messagepush => {
        callback(true, messagepush);
      })
      .catch(err => {
        callback(false, err);
      });
  },
  //判断会话状态及添加询问
  JudgeTopicStatusAndAddMessage: function (userid, topicid, callback) {
    db.Topic.find({
      where: {
        id: topicid
      }
    }).then(topicinfo => {
      if (topicinfo.servicestatus == 1 && topicinfo.userid == userid) {
        db.Topic.update({
            servicestatus: 0,
            ProfessionalId: null,
            aftersaleid: null,
            modified_date: Date.now()
          }, {
            where: {
              id: topicid
            }
          }).then(data => {
            db.Message.findOne({
                where: {
                  TopicId: topicid
                },
                order: [
                  ['created_date', 'DESC']
                ]
              }).then(message => {
                if (message.Content == "请简单描述您遇到的问题")
                  callback(true, null);
                else {
                  //创建未读消息
                  messagerepo.SaveMessageText({
                    SendUserId: 0,
                    TopicId: topicid,
                    Content: "请简单描述您遇到的问题",
                    sendtype: 6
                  }, function (okay, err, userlist) {
                    if (okay)
                      callback(true, err);
                    else
                      callback(false, err);
                  });
                }
              })
              .catch(err => {
                callback(false, err);
              });
          })
          .catch(err =>
            callback(false, err)
          );
      } else
        callback(true, null);
    }).catch(err => {
      callback(false, err);
    });
  },
  //判断会话是否结束，已经结束的会话提示不能回复
  JudgeTopicStatusAndendTopic: function (message, callback) {
    db.Topic.find({
      where: {
        id: message.TopicId
      }
    }).then(topicinfo => {
      if (topicinfo.userid == message.SendUserId) {
        if (topicinfo.servicestatus != 0) {
          var msg = "服务已结束，请退出会话重新进入";
          if (topicinfo.servicestatus == 2)
            msg = "服务已被客服关闭，请确认或重新打开";
          callback(true, msg);
        } else
          callback(false, null);
      } else {
        if (topicinfo.servicestatus != 0) {
          var msg = "服务已结束，请勿回复";
          if (topicinfo.servicestatus == 2)
            msg = "服务已被客服关闭，请勿回复";
          callback(true, msg);
        } else
          callback(false, null);
      }
    }).catch(err => {
      callback(false, err);
    });
  }


}
module.exports = messagerepo;
