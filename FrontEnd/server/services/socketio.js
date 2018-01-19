

var megRepo = require('./Repository/messageRepository');
var topicRepo = require('./Repository/topicRepository');
var uuid = require('uuid/v4');
exports.socketService = function (io) {
  var jwt = require('jsonwebtoken');
  users = [];


  io.sockets.on('connection', function (socket) {

    //测试用接口开始       
    setInterval(() => {
      io.emit('test', {
        topic: Math.floor(Math.random() * 10),
        date: Date.now,
        message: 'this is the message',
        user: 'user',
        id: Math.floor(Math.random() * 10),
      });
    }, 54000);

    //new user login
    socket.on('test', function () {
      io.sockets.emit('test', '金达');
    })
    socket.on('login', function (nickname) {
      console.log('login' + nickname);
      if (users.indexOf(nickname) > -1) {
        socket.emit('nickExisted');
      } else {
        //socket.userIndex = users.length;
        socket.nickname = nickname;
        users.push(nickname);
        socket.emit('loginSuccess');
        io.sockets.emit('system', nickname, users.length, 'login');
      };
    });
    //new message get
    socket.on('postMsg', function (msg, color) {
      console.log(msg);
      socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });
    //new image get
    socket.on('img', function (imgData, color) {
      socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });

    // 客户端发送消息// 可根据状态发送给不同的客户端。
    /* socket.on('sendmsg', (message,token) => {
         //console.log('message received');
         //console.log(socket.id);
         console.log(message);
         console.log(token);
         var decodetoken=jwt.decode(token);
         console.log(decodetoken);
         io.emit('receivemsg', {type:'new-message', text: message});    
         io.emit('receivemsg', {type:'new-message', text: '这是系统自动回复'}); 
         // 除自己外发送
         socket.broadcast.to('abc123').emit('receivemsg',{type:'new-message', text: '创建room成功'}); 
         // 发送到所有room 人
         io.sockets.in('abc123').emit('receivemsg',{type:'new-message', text: '加入room成功'})  
     });*/
    // 客户端发送消息// 可根据状态发送给不同的客户端。
    socket.on('sendmsg', (message, room, token) => {
      //console.log('message received');
      //console.log(socket.id);
      // console.log(message);
      // console.log(token);
      // var decodetoken=jwt.decode(token);
      // console.log(decodetoken);
      //io.emit('receivemsg', {type:'new-message', text: message});    
      //io.emit('receivemsg', {type:'new-message', text: '这是系统自动回复'}); 
      // 除自己外发送
      //socket.broadcast.to(room).emit('receivemsg',{type:'new-message', text: message}); 
      // 发送到所有room 人

      io.sockets.in(room).emit('receivemsg', {
        type: 'new-message',
        text: message
      });
      var usersInRoom = io.of('/').in(room).clients;

    });

    // 可暂时不用
    socket.on('ceateroom', function (name, user) {
      // 随机测试使用    
      socket.room = "abc123";
      // socket.join("abc123",function(name){
      //     socket.to("abc123").emit('receivemsg',{type:'new-message', text: '创建room成功'});
      //     //io.emit('receivemsg', {type:'new-message', text: '创建room成功?'}); 
      // });

      // 可以发送给相关所有组的用户，不需要是该组的成员。
      io.sockets.in('abc123').emit('receivemsg', {
        type: 'new-message',
        text: '加入room成功'
      })

    })


    // 进入聊天室，客户通过发起消息加入，客服通过匹配逻辑，后台自动分配先关的聊天组。
    socket.on('joinroom', function (room, user) {
      //socket.room = 'Lobby';
      //socket.join('Lobby');
      //socket.emit('updatechat', 'SERVER', 'you have connected to Lobby');
      socket.room = room;
      socket.join(room, function (roomname) {
        // 发送给所有非自己
        //socket.to("abc123").emit('receivemsg',{type:'new-message', text: '加入room成功'})
        console.log("user：" + user + "join room: " + room);
      });
    })
    //测试用接口结束

    //消息发送接口
    //用户退出Socket
    socket.on('disconnect', function () {
      if (socket.nickname != null) {
        //users.splice(socket.userIndex, 1);
        users.splice(users.indexOf(socket.nickname), 1);
        socket.broadcast.emit('receivemsg', {
          text: "user disconected"
        });
      }
    });
    //获取未读消息会话列表
    socket.on('getunreadmsgs', function (userid) {
      megRepo.updatedeviceslist(parseInt(userid), socket.id);
      topicRepo.GetALLUnreadTopicMessageList(parseInt(userid), function (okay, topiclist) {
        if (okay)
          io.to(socket.id).emit('postunreadmsgs', topiclist);
      });
    });

    //获取未读消息会话
    socket.on('getunreadtopic', function (userid, topicid) {
      megRepo.GetUnreadMessage(userid, topicid, function (okay, messages) {
        if (okay) {
          megRepo.GetSendUserRole(userid, topicid, function (okay, err, admin) {
            if (okay != 0) {
              var roomnameall = "";
              var roomnamegroup = "";
              switch (okay) {
                case 1:
                  roomnameall = topicid + "all";
                  socket.room = roomnameall;
                  socket.join(roomnameall, function (rooms) {
                    console.log("user：" + userid + "join room: " + roomnameall);
                  });
                  break;
                default:
                  roomnamegroup = topicid + "group";
                  socket.room = roomnamegroup;
                  socket.join(roomnamegroup, function (rooms) {
                    console.log("user：" + userid + "join room: " + roomnamegroup);
                  });
                  roomnameall = topicid + "all";
                  socket.room = roomnameall;
                  socket.join(roomnameall, function (rooms) {
                    console.log("user：" + userid + "join room: " + roomnameall);
                  });
                  break;
              }
            }
            io.to(socket.id).emit('postunreadtopics', {
              messages: messages
            });
          });
        }
      });

    });

    //保存并推送消息
    socket.on('savetextmsg', function (message) {
      //判断会话是否被关闭
      megRepo.JudgeTopicStatusAndendTopic(message, function (okay, msg) {
        if (okay) {
          //被关闭的会话先保存消息
          message.MessageType = 0;
          megRepo.SaveAndPushMessageToUser(message, message.SendUserId, function (okay, messageinfo) {
            if (okay) {
              //推送消息到发送人
              io.to(socket.id).emit('postunreadmsg', messageinfo);
              //推送系统消息到发送人
              megRepo.SaveAndPushMessageToUser({
                SendUserId: 0,
                TopicId: message.TopicId,
                Content: msg,
                MessageType: 0,
                sendtype: message.sendtype
              }, message.SendUserId, function (okay, sysmsg) {
                if (okay) {
                  //推送消息到发送人
                  io.to(socket.id).emit('postunreadmsg', sysmsg);
                } else {
                  io.to(socket.id).emit('msgretunerr', {
                    Message: message,
                    Error: messageinfo
                  });
                }
              });
            } else {
              io.to(socket.id).emit('msgretunerr', {
                Message: message,
                Error: messageinfo
              });
            }
          });
        } else {
          megRepo.SaveMessageText(message, function (okay, err, userlist) {
            if (okay) {
              megRepo.updatedeviceslist(message.SendUserId, socket.id);
              var roomname = "";
              switch (parseInt(message.sendtype)) {
                case 1:
                  roomname = message.TopicId + "all";
                  //判断是否需要自动接单
                  topicRepo.AssignService(message.SendUserId, message.TopicId, function (okay, count) {
                    if (okay) {
                      //延迟一分钟执行自动派单       
                      var timeout = setInterval(function AssignTopic(){
                        //判断是否有人接单
                        topicRepo.GetTopicProfessionalId(message.TopicId,function(okay,topicinfo){
                          if(okay == 1){
                            //无人接单自动派单
                            topicRepo.AutoAssignService(message.TopicId, message.Content, function (okay, prouserid) {
                              if (okay) {
                                //系统自动派单成功
                                if (prouserid != null) {
                                  prouserid.forEach(user=>{
                                    io.to(user.user.socketid).emit('postunreadmsgs', user.da);
                                  });
                                }
                                else{
                                  io.to(socket.id).emit('msgretunerr', {
                                    Message: message,
                                    Error: prouserid
                                  });
                                }
                              }
                            });
                          }
                        });
                      },60000);
                      //延迟执行两分一秒，停止自动派单，
                      setTimeout(function clearAssingnTopic(){
                        //停止延时派单
                        clearInterval(timeout);
                        //判断是否有人接单
                        topicRepo.GetTopicProfessionalId(message.TopicId,function(okay,topicinfo){
                          if(okay == 1){
                            //无人接单发送消息至管理员
                            topicRepo.PushAssignServiceToFroupAdmin(message.TopicId, message.Content,function(okay,adminid){
                              if(okay){
                                //获取管理员未读消息
                                topicRepo.GetUnreadTopicMessageList(adminid, message.TopicId, function (okay, topicinfo) {
                                  if (okay) {
                                    //判断管理员是否在线，在线发送消息
                                    var devices = megRepo.GetOnlineDevicesList(adminid);
                                    if (devices.length > 0) {
                                      devices.forEach(device => {
                                        io.to(device.socketid).emit('postunreadmsgs', topicinfo);
                                      });
                                    }
                                  }
                                });
                              }
                              else
                              {
                                io.to(socket.id).emit('msgretunerr', {
                                  Message: message,
                                  Error: adminid
                                });
                              }
                            });
                          }
                        });
                      },240000);
                    } else {
                      if (userlist != null) {
                        var socketslist = [];
                        if (io.sockets.adapter.rooms[roomname] != null) {
                          for (var index in io.sockets.adapter.rooms[roomname].sockets) {
                            socketslist.push(index);
                          }
                        }
                        //推送消息到在线的未在会话中的人员
                        userlist.forEach(user => {
                          var dervicelist = megRepo.GetOnlineDevicesList(user);
                          if (dervicelist.length > 0) {
                            dervicelist.forEach(device => {
                              if (socketslist != null) {
                                var issocket = true;
                                socketslist.forEach(socketsa => {
                                  if (socketsa == device.socketid)
                                    issocket = false;
                                });
                                if (issocket) {
                                  topicRepo.GetUnreadTopicMessageList(user, message.TopicId, function (okay, topicinfo) {
                                    if (okay) {
                                      io.to(device.socketid).emit('postunreadmsgs', topicinfo);
                                    }
                                  });
                                }
                              }
                            });
                          }
                        });
                      }
                      io.sockets.in(roomname).emit('postunreadmsg', err);
                    }
                  })
                  break;
                case 3:
                case 4:
                case 5:
                  roomname = message.TopicId + "group";
                  if (userlist != null) {
                    var socketslist = [];
                    if (io.sockets.adapter.rooms[roomname] != null) {
                      for (var index in io.sockets.adapter.rooms[roomname].sockets) {
                        socketslist.push(index);
                      }
                    }
                    //推送消息到在线的未在会话中的人员
                    userlist.forEach(user => {
                      var dervicelist = megRepo.GetOnlineDevicesList(user);
                      if (dervicelist.length > 0) {
                        dervicelist.forEach(device => {
                          if (socketslist != null) {
                            var issocket = true;
                            socketslist.forEach(socketsa => {
                              if (socketsa == device.socketid)
                                issocket = false;
                            });
                            if (issocket) {
                              topicRepo.GetUnreadTopicMessageList(user, message.TopicId, function (okay, topicinfo) {
                                if (okay) {
                                  io.to(device.socketid).emit('postunreadmsgs', topicinfo);
                                }
                              });
                            }
                          }
                        });
                      }
                    });
                  }
                  io.sockets.in(roomname).emit('postunreadmsg', err);
                  break;
                default:
                  roomname = message.TopicId + "all";
                  if (userlist != null) {
                    var socketslist = [];
                    if (io.sockets.adapter.rooms[roomname] != null) {
                      for (var index in io.sockets.adapter.rooms[roomname].sockets) {
                        socketslist.push(index);
                      }
                    }
                    //推送消息到在线的未在会话中的人员
                    userlist.forEach(user => {
                      var dervicelist = megRepo.GetOnlineDevicesList(user);
                      if (dervicelist.length > 0) {
                        dervicelist.forEach(device => {
                          if (socketslist != null) {
                            var issocket = true;
                            socketslist.forEach(socketsa => {
                              if (socketsa == device.socketid)
                                issocket = false;
                            });
                            if (issocket) {
                              topicRepo.GetUnreadTopicMessageList(user, message.TopicId, function (okay, topicinfo) {
                                if (okay) {
                                  io.to(device.socketid).emit('postunreadmsgs', topicinfo);
                                }
                              });
                            }
                          }
                        });
                      }
                    });
                  }
                  io.sockets.in(roomname).emit('postunreadmsg', err);
                  break;
              }
            } else {
              io.to(socket.id).emit('msgretunerr', {
                Message: message,
                Error: err
              });
            }
          });
        }
      });
    });
    //接单
    socket.on("SetTopicService",function(userid,topicid){
      topicRepo.SetTopicService(topicid,userid,function(okay, msg, userlist){
        if(okay == 1){
          roomname = topicid + "all";
          if (userlist != null) {
            var socketslist = [];
            if (io.sockets.adapter.rooms[roomname] != null) {
              for (var index in io.sockets.adapter.rooms[roomname].sockets) {
                socketslist.push(index);
              }
            }
            //推送消息到在线的未在会话中的人员
            userlist.forEach(user => {
              var dervicelist = megRepo.GetOnlineDevicesList(user);
              if (dervicelist.length > 0) {
                dervicelist.forEach(device => {
                  if (socketslist != null) {
                    var issocket = true;
                    socketslist.forEach(socketsa => {
                      if (socketsa == device.socketid)
                        issocket = false;
                    });
                    if (issocket) {
                      topicRepo.GetUnreadTopicMessageList(user, message.TopicId, function (okay, topicinfo) {
                        if (okay) {
                          io.to(device.socketid).emit('postunreadmsgs', topicinfo);
                        }
                      });
                    }
                  }
                });
              }
            });
          }
          
          topicRepo.GetTopicInfoById(topicid,function(okay,topicinfo){
            if(okay){
              io.to(socket.id).emit('gettopicinfo', topicinfo);
            }
            else{
              io.to(socket.id).emit('msgretunerr', {
                Message: "",
                Error: topicinfo
              });
            }
          });
          io.sockets.in(roomname).emit('postunreadmsg', err);
        }
        else if(okay == 2){
          io.to(socket.id).emit('postunreadmsg', msg);
        }
        else{
          io.to(socket.id).emit('msgretunerr', {
            Message: "",
            Error: msg
          });
        }

      });
    });
    //发送转单信息到指定人员
    socket.on("PushTransferTopicMessage",function(topicid,userid,TransferUserid){
      topicRepo.PushTransferTopicMessage(topicid,userid,TransferUserid,function(okay,msg){
        if(okay){
          roomname = topicid + "group";
            var socketslist = [];
            if (io.sockets.adapter.rooms[roomname] != null) {
              for (var index in io.sockets.adapter.rooms[roomname].sockets) {
                socketslist.push(index);
              }
            }
            //推送消息到在线的未在会话中的人员
              var dervicelist = megRepo.GetOnlineDevicesList(TransferUserid);
              if (dervicelist.length > 0) {
                dervicelist.forEach(device => {
                  if (socketslist != null) {
                    var issocket = true;
                    socketslist.forEach(socketsa => {
                      if (socketsa == device.socketid)
                        issocket = false;
                    });
                    if (issocket) {
                      topicRepo.GetUnreadTopicMessageList(TransferUserid, topicid, function (okay, topicinfo) {
                        if (okay) {
                          io.to(device.socketid).emit('postunreadmsgs', topicinfo);
                        }
                      });
                    }
                  }
                });
              }
          io.sockets.in(roomname).emit('postunreadmsg', msg);
        }
        else
        {
          io.to(socket.id).emit('msgretunerr', {
            Message: "",
            Error: msg
          });
        }
      });
    });

    //接受转单信息
    socket.on("AcceptTheTopicService",function(topicid,userid){
      topicRepo.AcceptTheTopicService( topicid,userid, function (okay, message, userlist) {
        if (okay) {
          var roomname = message.TopicId + "group";
          if (userlist != null) {
            var socketslist = [];
            if (io.sockets.adapter.rooms[roomname] != null) {
              for (var index in io.sockets.adapter.rooms[roomname].sockets) {
                socketslist.push(index);
              }
            }
            //推送消息到在线的未在会话中的人员
            userlist.forEach(user => {
              var dervicelist = megRepo.GetOnlineDevicesList(user);
              if (dervicelist.length > 0) {
                dervicelist.forEach(device => {
                  if (socketslist != null) {
                    var issocket = true;
                    socketslist.forEach(socketsa => {
                      if (socketsa == device.socketid)
                        issocket = false;
                    });
                    if (issocket) {
                      topicRepo.GetUnreadTopicMessageList(user, message.TopicId, function (okay, topicinfo) {
                        if (okay) {
                          io.to(device.socketid).emit('postunreadmsgs', topicinfo);
                        }
                      });
                    }
                  }
                });
              }
            });
          }
          io.sockets.in(roomname).emit('postunreadmsg', message);
        } else {
          io.to(socket.id).emit('msgretunerr', {
            Message: "",
            Error: msg
          });
        }
      });
    });

    //保存图片消息
    socket.on("saveimgmsg", function (message) {
      megRepo.GetSendUserNameAndFilePath(message.SendUserId, function (okay, name, fileaddress) {
        var userlist = new Array();
        megRepo.SaveMessageImg(message, function (okay, err, userliset) {
          if (okay) {
            err = Object.assign({}, err, {
              name: name,
              fileaddress: fileaddress,
              uuid: uuid()
            })
            megRepo.updatedeviceslist(message.SendUserId, socket.id);
            var roomname = "";
            switch (parseInt(message.sendtype)) {
              case 1:
                roomname = message.TopicId + "all";
                if (userlist != null) {
                  var socketslist = [];
                  if (io.sockets.adapter.rooms[roomname] != null) {
                    for (var index in io.sockets.adapter.rooms[roomname].sockets) {
                      socketslist.push(index);
                    }
                  }
                  //推送消息到在线的未在会话中的人员
                  userlist.forEach(user => {
                    var dervicelist = megRepo.GetOnlineDevicesList(user);
                    if (dervicelist.length > 0) {
                      dervicelist.forEach(device => {
                        if (socketslist != null) {
                          var issocket = true;
                          socketslist.forEach(socketsa => {
                            if (socketsa == device.socketid)
                              issocket = false;
                          });
                          if (issocket) {
                            topicRepo.GetUnreadTopicMessageList(user, message.TopicId, function (okay, topicinfo) {
                              if (okay) {
                                io.to(device.socketid).emit('postunreadmsgs', topicinfo);
                              }
                            });
                          }
                        }
                      });
                    }
                  });
                }
                io.sockets.in(roomname).emit('postunreadmsg', err);
                break;
              case 3:
              case 4:
              case 5:
                roomname = message.TopicId + "group";
                if (userlist != null) {
                  var socketslist = [];
                  if (io.sockets.adapter.rooms[roomname] != null) {
                    if(io.sockets.adapter.rooms[roomname] != null){
                      for (var index in io.sockets.adapter.rooms[roomname].sockets) {
                        socketslist.push(index);
                      }
                    }
                  }
                  //推送消息到在线的未在会话中的人员
                  userlist.forEach(user => {
                    var dervicelist = megRepo.GetOnlineDevicesList(user);
                    if (dervicelist.length > 0) {
                      dervicelist.forEach(device => {
                        if (socketslist != null) {
                          var issocket = true;
                          socketslist.forEach(socketsa => {
                            if (socketsa == device.socketid)
                              issocket = false;
                          });
                          if (issocket) {
                            topicRepo.GetUnreadTopicMessageList(user, message.TopicId, function (okay, topicinfo) {
                              if (okay) {
                                io.to(device.socketid).emit('postunreadmsgs', topicinfo);
                              }
                            });
                          }
                        }
                      });
                    }
                  });
                }
                io.sockets.in(roomname).emit('postunreadmsg', err);
                break;
              default:
                roomname = message.TopicId + "all";
                if (userlist != null) {
                  var socketslist = [];
                  if (io.sockets.adapter.rooms[roomname] != null) {
                    for (var index in io.sockets.adapter.rooms[roomname].sockets) {
                      socketslist.push(index);
                    }
                  }
                  //推送消息到在线的未在会话中的人员
                  userlist.forEach(user => {
                    var dervicelist = megRepo.GetOnlineDevicesList(user);
                    if (dervicelist.length > 0) {
                      dervicelist.forEach(device => {
                        if (socketslist != null) {
                          var issocket = true;
                          socketslist.forEach(socketsa => {
                            if (socketsa == device.socketid)
                              issocket = false;
                          });
                          if (issocket) {
                            topicRepo.GetUnreadTopicMessageList(user, message.TopicId, function (okay, topicinfo) {
                              if (okay) {
                                io.to(device.socketid).emit('postunreadmsgs', topicinfo);
                              }
                            });
                          }
                        }
                      });
                    }
                  });
                }
                io.sockets.in(roomname).emit('postunreadmsg', err);
                break;
            }
          } else {
            io.to(socket.id).emit('msgretunerr', {
              Message: message,
              Error: err
            });
          }
        })
      });
    })
    //用户离开房间
    socket.on("userleaveroom", function (userid, topicid) {
      megRepo.GetSendUserRole(userid, topicid, function (okay, err, admin) {
        if (okay != 0) {
          var roomnameall = "";
          var roomnamegroup = "";
          switch (okay) {
            case 1:
              roomnameall = topicid + "all";
              socket.room = roomnameall;
              socket.leave(roomnameall, function (rooms) {
                console.log("user：" + userid + " leave room: " + roomnameall);
              });
              io.to(socket.id).emit('retunleaveroom', {
                isSuccess: true,
                data: null,
                message: "success"
              });
              break;
            default:
              roomnamegroup = topicid + "group";
              socket.room = roomnamegroup;
              socket.leave(roomnamegroup, function (rooms) {
                console.log("user：" + userid + " leave room: " + roomnamegroup);
              });
              roomnameall = topicid + "all";
              socket.room = roomnameall;
              socket.leave(roomnameall, function (rooms) {
                console.log("user：" + userid + " leave room: " + roomnameall);
              });
              io.to(socket.id).emit('retunleaveroom', {
                isSuccess: true,
                data: null,
                message: "success"
              });
              break;
          }
        } else {
          io.to(socket.id).emit('retunleaveroom', {
            isSuccess: false,
            data: null,
            message: err
          });
        }
      });
    });

    //消息已读
    socket.on("postmessageread", function (userid, topicid) {
      megRepo.MessageRead(userid, topicid, function (okay, message) {
        if (okay) {
          io.to(socket.id).emit('retunmessageread', {
            isSuccess: true,
            data: null,
            message: "success"
          });
        } else {
          io.to(socket.id).emit('retunmessageread', {
            isSuccess: false,
            data: null,
            message: err
          });
        }
      });
    });

    //@某一人到协助
    socket.on("postuserintopic", function (message, adduserid) {
      topicRepo.AddUserToCooperationAndPushMessage(message, adduserid, function (okay, message, userlist) {
        if (okay) {
          var roomname = message.TopicId + "group";
          if (userlist != null) {
            var socketslist = [];
            if (io.sockets.adapter.rooms[roomname] != null) {
              for (var index in io.sockets.adapter.rooms[roomname].sockets) {
                socketslist.push(index);
              }
            }
            //推送消息到在线的未在会话中的人员
            userlist.forEach(user => {
              var dervicelist = megRepo.GetOnlineDevicesList(user);
              if (dervicelist.length > 0) {
                dervicelist.forEach(device => {
                  if (socketslist != null) {
                    var issocket = true;
                    socketslist.forEach(socketsa => {
                      if (socketsa == device.socketid)
                        issocket = false;
                    });
                    if (issocket) {
                      topicRepo.GetUnreadTopicMessageList(user, message.TopicId, function (okay, topicinfo) {
                        if (okay) {
                          io.to(device.socketid).emit('postunreadmsgs', topicinfo);
                        }
                      });
                    }
                  }
                });
              }
            });
          }
          io.sockets.in(roomname).emit('postunreadmsg', message);
        } else {
          io.to(socket.id).emit('retunuserintopic', {
            isSuccess: false,
            data: null,
            message: message
          });
        }
      });
    });

    //@All
    socket.on("postallintopic", function (message) {
      topicRepo.AddAllToCooperationAndPushMessage(message, function (okay, message, userlist) {
        if (okay) {
          var roomname = message.TopicId + "group";
          if (userlist != null) {
            var socketslist = [];
            if (io.sockets.adapter.rooms[roomname] != null) {
              for (var index in io.sockets.adapter.rooms[roomname].sockets) {
                socketslist.push(index);
              }
            }
            //推送消息到在线的未在会话中的人员
            userlist.forEach(user => {
              var dervicelist = megRepo.GetOnlineDevicesList(user);
              if (dervicelist.length > 0) {
                dervicelist.forEach(device => {
                  if (socketslist != null) {
                    var issocket = true;
                    socketslist.forEach(socketsa => {
                      if (socketsa == device.socketid)
                        issocket = false;
                    });
                    if (issocket) {
                      topicRepo.GetUnreadTopicMessageList(user, message.TopicId, function (okay, topicinfo) {
                        if (okay) {
                          io.to(device.socketid).emit('postunreadmsgs', topicinfo);
                        }
                      });
                    }
                  }
                });
              }
            });
          }
          io.sockets.in(roomname).emit('postunreadmsg', message);
        } else {
          io.to(socket.id).emit('retunallintopic', {
            isSuccess: false,
            data: null,
            message: message
          });
        }
      });
    });

    //管理员分配客服
    socket.on("postassignorder", function (adminuserid, userid, topicid) {
      topicRepo.AdminAssignService(adminuserid, userid, topicid, function (okay, message, userlist) {
        if (okay) {
          var roomname = message.TopicId + "all";
          if (userlist != null) {
            var socketslist = [];
            if (io.sockets.adapter.rooms[roomname] != null) {
              for (var index in io.sockets.adapter.rooms[roomname].sockets) {
                socketslist.push(index);
              }
            }
            //推送消息到在线的未在会话中的人员
            userlist.forEach(user => {
              var dervicelist = megRepo.GetOnlineDevicesList(user);
              if (dervicelist.length > 0) {
                dervicelist.forEach(device => {
                  if (socketslist != null) {
                    var issocket = true;
                    socketslist.forEach(socketsa => {
                      if (socketsa == device.socketid)
                        issocket = false;
                    });
                    if (issocket) {
                      topicRepo.GetUnreadTopicMessageList(user, message.TopicId, function (okay, topicinfo) {
                        if (okay) {
                          io.to(device.socketid).emit('postunreadmsgs', topicinfo);
                        }
                      });
                    }
                  }
                });
              }
            });
          }
          io.sockets.in(roomname).emit('postunreadmsg', message);
        } else {
          io.to(socket.id).emit('retunassignorder', {
            isSuccess: false,
            data: null,
            message: userid
          });
        }
      });
    });

    //客服关闭服务单
    socket.on("postcloseorder", function (userid, topicid) {
      topicRepo.ServiceCloseOrder(userid, topicid, function (okay, message, userlist) {
        if (okay) {
          var roomname = message.TopicId + "all";
          if (userlist != null) {
            var socketslist = [];
            if (io.sockets.adapter.rooms[roomname] != null) {
              for (var index in io.sockets.adapter.rooms[roomname].sockets) {
                socketslist.push(index);
              }
            }
            //推送消息到在线的未在会话中的人员
            userlist.forEach(user => {
              var dervicelist = megRepo.GetOnlineDevicesList(user);
              if (dervicelist.length > 0) {
                dervicelist.forEach(device => {
                  if (socketslist != null) {
                    var issocket = true;
                    socketslist.forEach(socketsa => {
                      if (socketsa == device.socketid)
                        issocket = false;
                    });
                    if (issocket) {
                      topicRepo.GetUnreadTopicMessageList(user, message.TopicId, function (okay, topicinfo) {
                        if (okay) {
                          io.to(device.socketid).emit('postunreadmsgs', topicinfo);
                        }
                      });
                    }
                  }
                });
              }
            });
          }
          io.sockets.in(roomname).emit('postunreadmsg', message);
        } else {
          io.to(socket.id).emit('retuncloseorder', {
            isSuccess: false,
            data: null,
            message: userid
          });
        }
      });
    });

    //客户确认关闭服务单
    socket.on("postconfirmcloseorder", function (userid, topicid) {
      topicRepo.CustomerCloseConfirm(userid, topicid, function (okay, message, userlist) {
        if (okay) {
          var roomname = message.TopicId + "group";
          if (userlist != null) {
            var socketslist = [];
            if (io.sockets.adapter.rooms[roomname] != null) {
              for (var index in io.sockets.adapter.rooms[roomname].sockets) {
                socketslist.push(index);
              }
            }
            //推送消息到在线的未在会话中的人员
            userlist.forEach(user => {
              var dervicelist = megRepo.GetOnlineDevicesList(user);
              if (dervicelist.length > 0) {
                dervicelist.forEach(device => {
                  if (socketslist != null) {
                    var issocket = true;
                    socketslist.forEach(socketsa => {
                      if (socketsa == device.socketid)
                        issocket = false;
                    });
                    if (issocket) {
                      topicRepo.GetUnreadTopicMessageList(user, message.TopicId, function (okay, topicinfo) {
                        if (okay) {
                          io.to(device.socketid).emit('postunreadmsgs', topicinfo);
                        }
                      });
                    }
                  }
                });
              }
            });
          }
          io.sockets.in(roomname).emit('postunreadmsg', message);
        } else {
          io.to(socket.id).emit('retunconfirmcloseorder', {
            isSuccess: false,
            data: null,
            message: userid
          });
        }
      });
    });

    //客户重现打开服务单
    socket.on("postcustomeropenorder", function (userid, topicid) {
      topicRepo.CustomerOpenOrder(userid, topicid, function (okay, message, userlist) {
        if (okay) {
          var roomname = message.TopicId + "group";
          if (userlist != null) {
            var socketslist = [];
            if (io.sockets.adapter.rooms[roomname] != null) {
              for (var index in io.sockets.adapter.rooms[roomname].sockets) {
                socketslist.push(index);
              }
            }
            //推送消息到在线的未在会话中的人员
            userlist.forEach(user => {
              var dervicelist = megRepo.GetOnlineDevicesList(user);
              if (dervicelist.length > 0) {
                dervicelist.forEach(device => {
                  if (socketslist != null) {
                    var issocket = true;
                    socketslist.forEach(socketsa => {
                      if (socketsa == device.socketid)
                        issocket = false;
                    });
                    if (issocket) {
                      topicRepo.GetUnreadTopicMessageList(user, message.TopicId, function (okay, topicinfo) {
                        if (okay) {
                          io.to(device.socketid).emit('postunreadmsgs', topicinfo);
                        }
                      });
                    }
                  }
                });
              }
            });
          }
          io.sockets.in(roomname).emit('postunreadmsg', message);
        } else {
          io.to(socket.id).emit('retuncustomeropenorder', {
            isSuccess: false,
            data: null,
            message: userid
          });
        }
      });
    });
  });
}
