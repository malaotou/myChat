var db = require('../../dal/orm')
var md5 = require('md5');
var messagerep = require('./messageRepository');
var usererep = require('./userRepository');
var contactrepo = require('./contactRepository');
var grouprepo = require('./groupRepository');
var async = require('async');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
var devices = require('../modules/globalvariables').devices;
//会话管理
var topicrepo = {
    //根据用户ID、组ID查找是否已有会话，有返回会话，无创建会话,
    //1：新建会话，2：已有会话，3:新建组内会话，4：已有组内会话,5:错误
    AddTopic: function (userid, groupid, callback) {
        topicrepo.GetUserInGroup(userid, groupid, function (okay, groupuser) {
            if (!okay) {
                //非组内专业用户
                if (groupuser == null) {
                    //查看是否有关联会话
                    topicrepo.GetTopicInfo(userid, groupid, function (okay, topic) {
                        if (okay) {
                            topicrepo.GetTopicName(userid, groupid, topic.userid, topic.topictype, function (okay, name, filepath) {
                                if (okay) {
                                    messagerep.GetSendUserRole(userid, topic.id, function (okay, err, admin) {
                                        var da = topic.dataValues;
                                        da.name = name;
                                        da.filepath = filepath;
                                        da.code = 2;
                                        da.Sendtype = okay;
                                        da.admin = admin;
                                        callback(2, da)
                                    });
                                }
                                else
                                    callback(5, name)
                            })
                        }
                        else {
                            if (topic == null) {
                                //创建新的会话
                                db.Topic.build({
                                    groupid: groupid,
                                    userid: userid,
                                    servicestatus: 0,
                                    topictype: 0,
                                    Disabled: 0,
                                    created_date: Date.now()
                                })
                                    .save()
                                    .then(function (topic) {
                                        console.log('Topic add success');
                                        //创建未读消息
                                        messagerep.SaveMessageText({
                                            SendUserId: 0,
                                            TopicId: topic.id,
                                            Content: "请简单描述您遇到的问题",
                                            sendtype: 6
                                        }, function (okay, err, userlist) {
                                            if (okay) {
                                                //添加通信录
                                                contactrepo.AddOrUpdateContactInfo(topic.userid, topic.groupid, 1, function (okay, contact) {
                                                    if (okay) {
                                                        topicrepo.GetTopicName(userid, groupid, topic.userid, topic.topictype, function (okay, name, filepath) {
                                                            if (okay) {
                                                                messagerep.GetSendUserRole(userid, topic.id, function (okay, err, admin) {
                                                                    var da = topic.dataValues;
                                                                    da.name = name;
                                                                    da.filepath = filepath;
                                                                    da.code = 1;
                                                                    da.Sendtype = okay;
                                                                    da.admin = admin;
                                                                    callback(1, da);
                                                                });
                                                            }
                                                            else
                                                                callback(5, name)
                                                        })
                                                    }
                                                    else
                                                        callback(5, err);
                                                })

                                            }
                                            else {
                                                callback(5, err);
                                            }
                                        })
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        callback(5, err);
                                    });
                            }
                            else {
                                callback(5, topic);
                            }
                        }
                    })
                }
                else {
                    callback(5, groupuser);
                }

            }
            else {
                //组内会话
                topicrepo.GetGroupTopic(groupid, function (okay, topic) {
                    if (okay) {
                        topicrepo.GetTopicName(userid, groupid, topic.userid, topic.topictype, function (okay, name, filepath) {
                            if (okay) {
                                messagerep.GetSendUserRole(userid, topic.id, function (okay, err, admin) {
                                    var da = topic.dataValues;
                                    da.name = name;
                                    da.filepath = filepath;
                                    da.code = 4;
                                    da.Sendtype = okay;
                                    da.admin = admin;
                                    callback(4, da);
                                });
                            }
                            else
                                callback(5, name)
                        })
                        //callback(4,topic);
                    }
                    else {
                        if (topic == null) {
                            //创建新的组内会话
                            db.Topic.build({
                                groupid: groupid,
                                userid: userid,
                                topictype: 1,
                                Disabled: 0,
                                created_date: Date.now()
                            })
                                .save()
                                .then(function (topic) {
                                    console.log('Topic In Group add success');
                                    //callback(3, topic);
                                    topicrepo.GetTopicName(userid, groupid, topic.userid, topic.topictype, function (okay, name, filepath) {
                                        if (okay) {
                                            messagerep.GetSendUserRole(userid, topic.id, function (okay, err, admin) {
                                                var da = topic.dataValues;
                                                da.name = name;
                                                da.filepath = filepath;
                                                da.code = 3;
                                                da.Sendtype = okay;
                                                da.admin = admin;
                                                callback(3, da);
                                            });
                                        }
                                        else
                                            callback(5, name)
                                    })
                                })
                                .catch(err => {
                                    console.log(err);
                                    callback(5, err);
                                });
                        }
                        else {
                            callback(5, topic);
                        }
                    }
                })
            }
        })
    },
    //根据条件查找与用户关联的会话。
    GetTopicInfo: function (userid, groupid, callback) {
        db.Topic.find({
            where: {
                userid: userid,
                groupid: groupid,
                topictype: 0,
                Disabled: 0
            }
        })
            .then(topic => {
                if (topic != null) {
                    callback(true, topic);
                }
                else {
                    callback(false, null);
                }
            })
            .catch(err => {
                console.log(err);
                callback(false, err);
            })
    },
    //根据用户ID和组ID查询是否在组内的专业用户
    GetUserInGroup: function (userid, groupid, callback) {
        db.GroupUser.find({
            where: {
                userId: userid,
                groupId: groupid,
                disabled: 0
            }
        })
            .then(groupuser => {
                if (groupuser != null) {
                    callback(true, groupuser);
                }
                else {
                    callback(false, null);
                }
            })
            .catch(err => {
                console.log(err);
                callback(false, err);
            })
    },
    //查找组内会话
    GetGroupTopic: function (groupid, callback) {
        db.Topic.find({
            where: {
                groupid: groupid,
                topictype: 1,
                disabled: 0
            }
        })
            .then(topic => {
                if (topic != null) {
                    callback(true, topic);
                }
                else {
                    callback(false, null);
                }
            })
            .catch(err => {
                console.log(err);
                callback(false, err);
            })
    },
    //判断是否需要自动接单
    AssignService: function (userid, topicid, callback) {
        db.Topic.find({
            where: {
                id: topicid
            }
        }).then(topicinfo => {
            if (topicinfo.ProfessionalId == null && topicinfo.servicestatus == 0) {
                db.Message.findAll({
                    where: {
                        SendUserId: userid,
                        TopicId: topicid,
                        disabled: 0,
                        created_date: {
                            [Op.gt]: topicinfo.modified_date
                        }
                    }
                })
                    .then(counts => {
                        if (counts.length == 1) {
                            callback(true, counts);
                        }
                        else {
                            callback(false, counts);
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        callback(false, err);
                    });
            }
            else
                callback(false, null);
        })
            .catch(err => {
                console.log(err);
                callback(false, err);
            });
    },
    //是否有人接单
    GetTopicProfessionalId:function(topicid,callback)
    {
        db.Topic.find({
            where: {
                id: topicid
            }
        }).then(topicinfo => {
            if (topicinfo.ProfessionalId == null)
                callback(1,topicinfo);
            else
                callback(2,topicinfo);
            })
        .catch(err=>{
            callback(3,err);
        });
    },
    //自动接单
    AutoAssignService: function (topicid, messageContent, callback) {
        //查询当前是否有空闲客服人员
        var sql = `SELECT userid FROM td_groupuser
       WHERE groupId = (SELECT groupid FROM td_topic WHERE id = `+ topicid + `)
       AND userId NOT IN
       (SELECT ProfessionalId FROM td_topic WHERE
       groupId = (SELECT groupid FROM td_topic WHERE id = `+topicid+`)
        AND servicestatus = 0 AND ProfessionalId IS NOT NULL and disabled = 0) and disabled = 0 `;
       db.sequelize.query(sql, {
            type: db.sequelize.QueryTypes.SELECT
        }).then(prouserid => {
            var onlineProUser = new Array();
            if (prouserid.length > 0) {
                //获取在线的空余客服                    
                prouserid.forEach(prouser => {
                    devices.forEach(device => {
                        if (device.userid == prouser.userid)
                            onlineProUser.push(device);
                    });
                });
            }
            //是否有在线客服
            var JudgePro = false;
            //在线客服列表
            var sendProUser = new Array();
            //判断在线的客服数量，超过三个随机选择
            switch (onlineProUser.length) {
                case 0:
                    JudgePro = false;
                    break;
                case 1:
                case 2:
                case 3:
                    JudgePro = true;
                    sendProUser = onlineProUser;
                    break;

                default:
                    while(sendProUser.length <3){
                        var okay = true;
                        var id = Math.floor(Math.random() * onlineProUser.length);
                        sendProUser.forEach(user =>{
                            if(user.userid == onlineProUser[id].userid)
                             okay = false;
                        });
                        if(okay)
                        sendProUser.push(onlineProUser[id]);
                    }
                    JudgePro = true;
                    break;
            }
            if(JudgePro){
                //获取会话信息
                topicrepo.GetTopicInfoById(parseInt(topicid),function(okay,topicinfo){
                    if(okay){
                        var ProUserList = new Array();
                        async.mapSeries(sendProUser, function (user, cb) {
                            //循环发送接单信息到在线客服
                            topicrepo.PushAutoAssignServiceMessage(
                                topicinfo.userId,topicid,topicinfo.modified_date,user.userid,function(okay,msg){
                                    if(okay){
                                        topicrepo.GetTopicName(userid, topicinfo.groupid, topicinfo.userid, topicinfo.topictype, function (okay, name, filepath) {
                                            if (okay) {
                                                messagerep.GetSendUserRole(userid, topicinfo.id, function (okay, err, admin) {
                                                    var da = topicinfo.dataValues;
                                                    da.messageinfo = msg;
                                                    da.name = name;
                                                    da.filepath = filepath;
                                                    da.Sendtype = okay;
                                                    da.admin = admin;
                                                    ProUserList.push({user,da});
                                                    cb(null,da);
                                                });            
                                            }
                                            else
                                                cb(null, name);            
                                        });
                                    }                                            
                                    else
                                        cb(false,msg);
                                });
                        }, function (error, result) {
                            if (error == null) {
                                callback(true, ProUserList);
                            }
                            else
                                callback(false, error);
                        });
                    }
                    else
                        callback(false, topicinfo);
                });
                
            }
            else{
                callback(false,null);
            }
        }).catch(function (err) {
            callback(false, err);
        });
    },

    //无人接单发送消息到管理员
    PushAssignServiceToFroupAdmin:function(topicid,messageContent,callback){
                    //无空闲客服，发送信息到组管理员
                    //获取管理员信息
                    topicrepo.GetGroupAdminInfo(topicid, function (okay, userinfo) {
                        if (okay) {
                            //保存消息并发送到指定人员
                            messagerep.SaveAndPushMessageToUser({
                                SendUserId: 0,
                                TopicId: topicid,
                                Content: "暂无空闲人员，请指定客服人员。",
                                MessageType: 0,
                                sendtype: 5
                            }, userinfo[0].id, function (okay, message) {
                                if (okay) {
                                    db.Topic.update({
                                        topiccontent: messageContent
                                    }, {
                                            where: {
                                                id: topicid
                                            }
                                        })
                                        .then(topic => {
                                            callback(true, userinfo[0].id);
                                        })
                                        .catch(err => {
                                            callback(false, err);
                                        })

                                }
                                else
                                    callback(false, message);
                            })
                        }
                        else
                            callback(false, userinfo);
                    });
    },
    //接单
    SetTopicService:function(topicid,userid,callback){
        topicrepo.GetTopicProfessionalId(topicid,function(okay,topicinfo){
            if(okay == 1){
                //更新会话状态
                db.Topic.update({
                    ProfessionalId: userid,
                    modified_date: Date.now()
                }, {
                        where: {
                            id: topicid
                        }
                    })
                    .then(topic => {
                        //添加客服到会话协作组
                        topicrepo.addUserInCooperation(userid, topicid, function (okay, cooper) {
                            if (okay) {
                                topicrepo.GetTopicInfoById(parseInt(topicid), function (okay, topicinfo) {
                                    if (okay) {
                                        //推送已发送信息到接单人员
                                        topicrepo.GetTopicMessageListToServiceId(topicinfo.id, topicinfo.userid, topicinfo.ProfessionalId, parseInt(userid), function (okay, error) {
                                            if (okay) {
                                                usererep.getUserById(userid, function (okay, user) {
                                                    if (okay) {
                                                        //保存系统信息
                                                        messagerep.SaveMessageText({
                                                            SendUserId: 0,
                                                            TopicId: topicid,
                                                            Content: "客服" + user.name + "加入会话。",
                                                            sendtype: 6
                                                        }, function (okay, message, userlist) {
                                                            if (okay)
                                                                callback(1, message, userlist);
                                                            else
                                                                callback(3, message, null);
                                                        });
                                                    }
                                                    else {
                                                        callback(3, user, null);
                                                    }
                                                });
                                            }
                                            else
                                                callback(3, error, null);
                                        });
                                    }
                                    else
                                        callback(3, topicinfo, null);
                                })

                            }
                            else
                                callback(3, cooper, null);
                        });
                        //callback(true, prouserid);
                    })
                    .catch(err => {
                        callback(3, err, null);
                    });
                
            }
            else if(okay == 2)
            {
                usererep.getUserById(topicinfo.ProfessionalId,function(okay,userinfo){
                    if(okay ==1){
                        //推送系统消息到发送人
                        megRepo.SaveAndPushMessageToUser({
                            SendUserId: 0,
                            TopicId: topicid,
                            Content: userinfo.name+"已经接单",
                            MessageType: 0,
                            sendtype: 5
                        }, userid, function (okay, sysmsg) {
                            if (okay) {
                                callback(2,sysmsg,null);
                            } else {
                                callback(3,sysmsg,null);
                            }
                        });
                    }
                    else
                        callback(3,userinfo,null);
                });
            }
            else{
                callback(3,topicinfo,null);
            }
        });
    },
    //保存并推送自动派单消息到相应人员
    PushAutoAssignServiceMessage: function (userid, topicid, modified_date, serviceid, callback) {
        db.Message.findAll({
            where: {
                SendUserId: {
                    [Op.in]: [userid, 0]
                },
                TopicId: topicid,
                disabled: 0,
                sendtype: {
                    [Op.in]: [1, 2, 6]
                },
                created_date: {
                    [Op.gt]: modified_date
                }
            }
        }, { order: [['created_date', 'DESC']] })
            .then(messages => {
                async.mapSeries(messages, function (msg, cb) {
                    topicrepo.AddAndUpdateUnreadMessage(msg.id, msg.TopicId, serviceid, 0, function (okay, msgpush) {
                        if (okay)
                            cb(null, msgpush);
                        else
                            cb(false, msgpush);
                    })
                }, function (error, result) {
                    if (error == null) {
                        usererep.getUserById(serviceid, function (okay, user) {
                            if (okay) {
                                //保存系统信息
                                messagerep.SaveAndPushMessageToUser({
                                    SendUserId: 0,
                                    TopicId: topicid,
                                    Content: "系统选择" + user.name + "为待选客服",
                                    MessageType:0,
                                    sendtype: 5
                                }, serviceid, function (okay, messageinfo) {
                                    if (okay) {
                                        callback(true, messageinfo);
                                    }
                                    else{
                                        callback(false, messageinfo);
                                    }
                                });
                            }
                            else {
                                callback(false, user);
                            }
                        });
                    }
                    else
                        callback(false, error);
                });
            })
            .catch(err => {
                callback(false, err);
            });
    },

    //添加人员到协作组内
    addUserInCooperation: function (userid, topicid, callback) {
        db.Cooperator.findAll({
            where: {
                UserId: userid,
                TopicId: topicid,
                disabled: 0
            }
        }).then(cooperlist => {
            if (cooperlist.length == 0) {
                db.Cooperator.build({
                    UserId: userid,
                    TopicId: topicid,
                    creator: 0,
                    created_date: Date.now(),
                    disabled: 0
                })
                    .save()
                    .then(cooper => {
                        callback(true, cooper);
                    })
                    .catch(err => {
                        callback(false, err);
                    });
            } else {
                callback(true, cooperlist);
            }

        }).catch(err => {
            callback(false, err);
        });
    },
    //获取组管理员信息
    GetGroupAdminInfo: function (topicid, callback) {
        var sql = `SELECT * FROM td_user
        where id = (SELECT userId FROM td_groupuser
        WHERE groupid = (SELECT groupid FROM td_topic
        WHERE id = `+ topicid + ` AND disabled = 0 ) AND disabled = 0 AND usertype = 2)
        AND disabled = 0`;
        db.sequelize.query(sql, {
            type: db.sequelize.QueryTypes.SELECT
        }).then(userinfo => {
            callback(true, userinfo);
        })
            .catch(err => {
                callback(false, err);
            })
    },
    //获取指定用户的所有未读消息的会话
    GetALLUnreadTopicMessageList: function (userid, callback) {
        var topiclist = new Array();
        var sql = `SELECT muz.* FROM (SELECT mu.* FROM (SELECT m.*,u.name,u.fileaddress FROM td_message AS m LEFT JOIN td_user AS u ON m.SendUserId = u.id) as mu
        WHERE mu.id in (SELECT MessageId FROM td_messagepush WHERE
                        ReceiveUserId = `+ userid + ` and ReceiveStatus = 0 AND disabled = 0)
                        ORDER BY mu.created_date DESC)  AS muz GROUP BY muz.TopicId`;
        db.sequelize.query(sql, {
            type: db.sequelize.QueryTypes.SELECT
        }).then(messages => {
            if (messages.length > 0) {
                async.mapSeries(messages, function (msg, cb) {
                    db.Topic.find({
                        where: {
                            id: msg.TopicId
                        }
                    })
                        .then(topic => {
                            //topic["messageinfo"] = msg;
                            topicrepo.GetTopicName(userid, topic.groupid, topic.userid, topic.topictype, function (okay, name, filepath) {
                                if (okay) {
                                    messagerep.GetSendUserRole(userid, topic.id, function (okay, err, admin) {
                                        var da = topic.dataValues;
                                        da.messageinfo = msg;
                                        da.name = name;
                                        da.filepath = filepath;
                                        da.Sendtype = okay;
                                        da.admin = admin;
                                        topiclist.push(da);
                                        cb(null, topiclist);
                                    });

                                }
                                else
                                    cb(null, name)

                            })
                            //topiclist.push({topicinfo:{topic:topic,msg:msg}});

                        })
                        .catch(err => {
                            cb(null, err);
                        });
                }, function (error, result) {
                    if (error == null)
                        callback(true, topiclist);
                    else
                        callback(false, error);
                });
            }
            else
                callback(false, null);
        })
            .catch(err => {
                callback(false, err);
            });

    },
    //获取指定用户和会话的未读消息信息（包含会话信息）
    GetUnreadTopicMessageList: function (userid, topicid, callback) {
        var topiclists = new Array();
        db.Topic.find({
            where: {
                id: topicid,
                Disabled: 0
            }
        }).then(topicinfo => {
            var sql = `SELECT mu.* FROM (SELECT m.*,u.name,u.fileaddress FROM td_message AS m 
                LEFT JOIN td_user AS u ON m.SendUserId = u.id) as mu
                            WHERE mu.id in (SELECT MessageId FROM td_messagepush WHERE TopicId = `+ topicid + `
                                        AND ReceiveUserId = `+ userid + ` and ReceiveStatus = 0 AND disabled = 0)
                            ORDER BY mu.created_date DESC limit 1`;
            db.sequelize.query(sql, {
                type: db.sequelize.QueryTypes.SELECT
            }).then(message => {
                topicrepo.GetTopicName(userid, topicinfo.groupid, topicinfo.userid, topicinfo.topictype, function (okay, name, filepath) {
                    if (okay) {
                        messagerep.GetSendUserRole(userid, topicid, function (okay, err, admin) {
                            var da = topicinfo.dataValues;
                            da.messageinfo = message[0];
                            da.name = name;
                            da.filepath = filepath;
                            da.Sendtype = okay;
                            da.admin = admin;
                            topiclists.push(da);
                            callback(true, topiclists);
                        });
                    }
                    else
                        callback(false, name);
                })
            })
                .catch(err => {
                    callback(false, err);
                })
        })
            .catch(err => {
                callback(false, err);
            })
    },
    //获取会话的名称和头像地址
    GetTopicName: function (userid, groupid, topicuserid, topictype, callback) {
        //获取组信息
        grouprepo.getGroupById(groupid, function (groupinfo, okay, err) {
            if (okay == 1) {
                if (groupinfo != null) {
                    if (topictype == 1) {
                        //返回组名称和Logo地址
                        callback(true, groupinfo.name, groupinfo.fileaddress);
                    }
                    else {
                        //判断是否在组内
                        topicrepo.GetUserInGroup(userid, groupid, function (okay, groupuser) {
                            if (okay) {
                                //获取用户信息
                                usererep.getUserById(topicuserid, function (okay, userinfo) {
                                    if (okay == 1) {
                                        //返回用户名称与组名称及用户头像地址
                                        callback(true, userinfo.name + "-" + groupinfo.name, userinfo.fileaddress);
                                    }
                                    else {
                                        callback(false, userinfo, null);
                                    }
                                });
                            }
                            else {
                                //返回组名称和Logo地址
                                callback(true, groupinfo.name, groupinfo.fileaddress);
                            }
                        });
                    }
                } else {
                    callback(false, err, null);
                }
            }
            else
                callback(false, err, null);
        });
    },

    //获取并推送会话信息到指定人员
    GetTopicMessageListToServiceId: function (topicid, userid, proid, serviceid, callback) {
        db.Message.findAll({
            where: {
                SendUserId: {
                    [Op.in]: [userid, proid, 0]
                },
                TopicId: topicid,
                disabled: 0,
                sendtype: {
                    [Op.in]: [1, 2, 6]
                }
            }
        }, { order: [['created_date', 'DESC']] })
            .then(messages => {
                async.mapSeries(messages, function (msg, cb) {
                    topicrepo.AddAndUpdateUnreadMessage(msg.id, msg.TopicId, serviceid, 0, function (okay, msgpush) {
                        if (okay)
                            cb(null, msgpush);
                        else
                            cb(false, msgpush);
                    })
                }, function (error, result) {
                    if (error == null)
                        callback(true, result);
                    else
                        callback(false, error);
                });
            })
            .catch(err => {
                callback(false, err);
            })

    },
    //判断是否有未读消息
    AddAndUpdateUnreadMessage: function (messageid, topicid, userid, messagetype, callback) {
        db.MessagePush.find({
            where: {
                MessageId: messageid,
                TopicId: topicid,
                ReceiveUserId: userid
            }
        }).then(msg => {
            if (msg != null) {
                db.MessagePush.update(
                    {
                        ReceiveStatus: 0,
                        messagetype: messagetype,
                        Disabled: 0,
                        modified_date: Date.now()
                    }, {
                        where: {
                            id: msg.id
                        }
                    })
                    .then(messagepush => {
                        callback(true, messagepush);
                    })
                    .catch(err => {
                        console.log(err);
                        callback(false, err);
                    });
            }
            else {
                db.MessagePush.build({
                    MessageId: messageid,
                    TopicId: topicid,
                    ReceiveUserId: userid,
                    ReceiveStatus: 0,
                    messagetype: messagetype,
                    created_date: Date.now(),
                    Disabled: 0
                })
                    .save()
                    .then(messagepush => {
                        callback(true, messagepush);
                    })
                    .catch(err => {
                        callback(false, err);
                    });
            }
        })
            .catch(err => {
                callback(false, err);
            })
    },
    //根据ID获取会话信息
    GetTopicInfoById: function (topicid, callback) {
        db.Topic.find({
            where: { id: topicid }
        }).then(topicinfo => {
            if (callback != null)
                callback(true, topicinfo);
            else
                callback(false, "No Topic Info");
        })
            .catch(err => {
                callback(false, err);
            })
    },
    //管理员派单
    AdminAssignService: function (adminuserid, userid, topicid, callback) {
        //更新会话状态
        db.Topic.update({
            ProfessionalId: userid,
            modified_date: Date.now()
        }, {
                where: {
                    id: topicid
                }
            })
            .then(topic => {
                //添加客服到会话协作组
                topicrepo.addUserInCooperation(userid, topicid, function (okay, cooper) {
                    if (okay) {
                        topicrepo.GetTopicInfoById(parseInt(topicid), function (okay, topicinfo) {
                            if (okay) {
                                //推送已发送信息到接单人员
                                topicrepo.GetTopicMessageListToServiceId(topicinfo.id, topicinfo.userid, topicinfo.ProfessionalId, parseInt(userid), function (okay, error) {
                                    if (okay) {
                                        usererep.getUserById(userid, function (okay, user) {
                                            if (okay) {
                                                //保存系统信息
                                                messagerep.SaveMessageText({
                                                    SendUserId: 0,
                                                    TopicId: topicid,
                                                    Content: "管理员指定" + user.name + "为客服，请尽快解答问题。",
                                                    sendtype: 5
                                                }, function (okay, message, userlist) {
                                                    if (okay)
                                                        callback(true, message, userlist);
                                                    else
                                                        callback(false, message, null);
                                                });
                                            }
                                            else {
                                                callback(false, user, null);
                                            }
                                        });
                                    }
                                    else
                                        callback(false, error, null);
                                });
                            }
                            else
                                callback(false, topicinfo, null);
                        })

                    }
                    else
                        callback(false, cooper, null);
                });
                //callback(true, prouserid);
            })
            .catch(err => {
                callback(false, err, null);
            });
    },

    //服务人员关闭单据
    ServiceCloseOrder: function (userid, topicid, callback) {
        db.Topic.update({
            servicestatus: 2,
            modified_date: Date.now()
        }, {
                where: {
                    id: topicid
                }
            })
            .then(topic => {
                usererep.getUserById(userid, function (okay, user) {
                    if (okay) {
                        //保存系统信息
                        messagerep.SaveMessageText({
                            SendUserId: 0,
                            TopicId: topicid,
                            Content: "客服" + user.name + "关闭了服务单。",
                            sendtype: 6
                        }, function (okay, message, userlist) {
                            if (okay)
                                callback(true, message, userlist);
                            else
                                callback(false, message, null);
                        });
                    }
                    else {
                        callback(false, user, null);
                    }
                });
            })
            .catch(err => {
                callback(false, err, null);
            });
    },

    //客户确认关闭单据
    CustomerCloseConfirm: function (userid, topicid, callback) {
        db.Topic.update({
            servicestatus: 1,
            modified_date: Date.now()
        }, {
                where: {
                    id: topicid
                }
            })
            .then(topic => {
                usererep.getUserById(userid, function (okay, user) {
                    if (okay) {
                        //保存系统信息
                        messagerep.SaveMessageText({
                            SendUserId: 0,
                            TopicId: topicid,
                            Content: "客户" + user.name + "确认关闭了服务单。",
                            sendtype: 6
                        }, function (okay, message, userlist) {
                            if (okay)
                                callback(true, message, userlist);
                            else
                                callback(false, message, null);
                        });
                    }
                    else {
                        callback(false, user, null);
                    }
                });
            })
            .catch(err => {
                callback(false, err, null);
            });
    },

    //客户重新打开单据
    CustomerOpenOrder: function (userid, topicid, callback) {
        db.Topic.update({
            servicestatus: 0,
            modified_date: Date.now()
        }, {
                where: {
                    id: topicid
                }
            })
            .then(topic => {
                usererep.getUserById(userid, function (okay, user) {
                    if (okay) {
                        //保存系统信息
                        messagerep.SaveMessageText({
                            SendUserId: 0,
                            TopicId: topicid,
                            Content: "客户" + user.name + "重新打开了服务单。",
                            sendtype: 6
                        }, function (okay, message, userlist) {
                            if (okay)
                                callback(true, message, userlist);
                            else
                                callback(false, message, null);
                        });
                    }
                    else {
                        callback(false, user, null);
                    }
                });
            })
            .catch(err => {
                callback(false, err, null);
            });
    },
    //@某一组内人员
    AddUserToCooperationAndPushMessage: function (message, adduserid, callback) {
        //添加人员到会话协作组
        topicrepo.addUserInCooperation(adduserid, message.TopicId, function (okay, cooper) {
            if (okay) {
                //保存并推送消息
                messagerep.SaveMessageText({
                    SendUserId: message.SendUserId,
                    TopicId: message.TopicId,
                    Content: message.Content,
                    sendtype: 3
                }, function (okay, message, userlist) {
                    if (okay)
                        callback(true, message, userlist);
                    else
                        callback(false, message, null);
                });

            }
            else
                callback(false, cooper, null);
        });
    },
    //@ALL人员
    AddAllToCooperationAndPushMessage: function (message, callback) {
        //获取组内所有人员
        topicrepo.GetGroupUsersforTopicId(message.TopicId, function (okay, userlist) {
            if (okay) {
                if (userlist.length > 0) {
                    async.mapSeries(userlist, function (user, cb) {
                        //循环添加人员到协作组
                        topicrepo.addUserInCooperation(user.userId, message.TopicId, function (okay, cooper) {
                            if (okay)
                                cb(null, cooper);
                            else
                                cb(false, cooper);
                        });
                    }, function (error, result) {
                        if (error == null) {
                            //保存并推送消息
                            messagerep.SaveMessageText({
                                SendUserId: message.SendUserId,
                                TopicId: message.TopicId,
                                Content: message.Content,
                                sendtype: 3
                            }, function (okay, message, userlist) {
                                if (okay)
                                    callback(true, message, userlist);
                                else
                                    callback(false, message, null);
                            });
                        }
                        else
                            callback(false, error, null);
                    });

                } else {
                    callback(true, null, null);
                }
            } else {
                callback(false, userlist, null);
            }
        })
    },
    //根据会话ID获取对应组的所有成员
    GetGroupUsersforTopicId: function (topicid, callback) {
        var sql = `SELECT * FROM td_groupuser WHERE groupId = 
            (SELECT groupId FROM td_topic WHERE id = `+ topicid + `)`;
        db.sequelize.query(sql, {
            type: db.sequelize.QueryTypes.SELECT
        }).then(userlist => {
            callback(true, userlist);
        })
            .catch(err => {
                callback(false, err);
            });
    },
    //发送转单信息到转单的人员
    PushTransferTopicMessage:function(topicid,userid,TransferUserid,callback){
        usererep.getUserById(userid,function(okay,userinfo){
            if(okay ==1){
                usererep.getUserById(userid,function(okay,TransferUserinfo){
                    if(okay == 1){
                        //推送系统消息到发送人
                        megRepo.SaveAndPushMessageToUser({
                            SendUserId: 0,
                            TopicId: topicid,
                            Content: userinfo.name+"转单给"+TransferUserinfo.name,
                            MessageType: 0,
                            sendtype: 5
                        }, userid, function (okay, sysmsg) {
                            if (okay) {
                                callback(true,sysmsg);
                            } else {
                                callback(false,sysmsg);
                            }
                        });
                    }
                    else
                        callback(false,TransferUserinfo);
                });
            }
            else
                callback(false,userinfo);
        });
    },
    //接受转单信息
    AcceptTheTopicService:function(topicid,userid){
        //更新会话状态
        db.Topic.update({
            ProfessionalId: userid,
            modified_date: Date.now()
        }, {
                where: {
                    id: topicid
                }
            })
            .then(topic => {
                //添加客服到会话协作组
                topicrepo.addUserInCooperation(userid, topicid, function (okay, cooper) {
                    if (okay) {
                        topicrepo.GetTopicInfoById(parseInt(topicid), function (okay, topicinfo) {
                            if (okay) {
                                //推送已发送信息到接单人员
                                topicrepo.GetTopicMessageListToServiceId(topicinfo.id, topicinfo.userid, topicinfo.ProfessionalId, parseInt(userid), function (okay, error) {
                                    if (okay) {
                                        usererep.getUserById(userid, function (okay, user) {
                                            if (okay) {
                                                //保存系统信息
                                                messagerep.SaveMessageText({
                                                    SendUserId: 0,
                                                    TopicId: topicid,
                                                    Content: user.name + "接受转单成为客服。",
                                                    sendtype: 5
                                                }, function (okay, message, userlist) {
                                                    if (okay)
                                                        callback(true, message, userlist);
                                                    else
                                                        callback(false, message, null);
                                                });
                                            }
                                            else {
                                                callback(false, user, null);
                                            }
                                        });
                                    }
                                    else
                                        callback(false, error, null);
                                });
                            }
                            else
                                callback(false, topicinfo, null);
                        })

                    }
                    else
                        callback(false, cooper, null);
                });
                //callback(true, prouserid);
            })
            .catch(err => {
                callback(false, err, null);
            });
    }



}
module.exports = topicrepo;
