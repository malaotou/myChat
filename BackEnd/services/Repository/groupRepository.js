var db = require('../../dal/orm');
var groupuserRep = require('./groupuserRepository');
var response = require('../modules/responsemodel');
var userRep = require('./userRepository');
var fileRep = require('./fileRepository');
var Sequelize = require('sequelize');
var async = require('async');
var md5 = require('md5');
var config = require('../../config')
var companyRepo = {
  // 创建公司/团队
  createGroup: (group, inviters, user, callback) => {
    console.log(user);
    db.Group.find({
        where: {
          name: group.name
        }
      })
      .then(data => {
        if (data == null) { //  组不存在
          // 创建组
          db.Group.build({
              name: group.name,
              avatarsrc: group.avatarsrc,
              description: group.description
            })
            .save()
            .then(group => {
              try {

                if (group != null) {
                  // 创建管理员
                  groupuserRep.createManager({
                    groupId: group.id,
                    description: group.description,
                    userId: user.id,
                    usertype: 2,
                    disabled: false,
                    creator: user.id
                  }, null, user, (status, message, data) => {});
                }
                if (inviters != null) {
                  async.eachSeries(inviters, (item, ballback) => {
                    userRep.addInviteUser(group, item, user, (status, message, data) => {

                    })
                  })
                }
                callback(null, null);
              } catch (err) {
                callback(null, err);
              }
            })
            .catch(err => {
              callback(null, err);
            });
        } else {
          callback(null, "组已经存在");
        }
      })
  },

  // CreateGroupV2 创建组及相关成员信息
  CreateGroupV2: (group, inviters, user) => {
    data = [];
    // 检测重名
    return new Promise((resolve, reject) => {
      db.sequelize.transaction({
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
        autocommit: false
      }).then(t => {
        //t.rollback();
        db.Group.find({
          where: {
            name: group.name
          }
        }, {
          transaction: null
        }).then(rtn => {
          if (rtn != null) {
            t.commit();
            reject("group With Name " + group.name + " 已经存在!")
          } else {
            var file = null;
            if (group.avatarsrc != undefined && group.avatarsrc != null) {
              fileRep.saveFile(group.name, group.fileExt, group.avatarsrc).then(fileObj => {
                file = fileObj.address;
                db.Group.create({
                  name: group.name,
                  avatarsrc: group.avatarsrc,
                  description: group.description,
                  creator: user.id,
                  fileaddress: file,
                  fileExt: group.fileExt,
                  disabled: false
                }, {
                  transaction: t
                }).then(rtn => {
                  db.GroupUser.create({
                    groupId: rtn.id,
                    userId: user.id,
                    usertype: 2,
                    disabled: false,
                    creator: user.id
                  }, {
                    transaction: t
                  }).then(groupuser => {
                    async.mapSeries(inviters, (item, callback) => {
                      db.User.find({
                        where: {
                          account: item.account
                        }
                      }).then(u => {
                        if (u == null) { //item.id == 0 && item.id == '' || item.id == null
                          db.User.create({
                              account: item.account,
                              password: md5('123456'),
                              creator: user.id,
                              disabled: false
                            }, {
                              transaction: t
                            })
                            .then(newUser => {
                              db.GroupUser.create({
                                groupId: rtn.id,
                                userId: newUser.id,
                                usertype: 1,
                                disabled: false,
                                creator: user.id
                              }, {
                                transaction: t
                              }).then(d => {
                                data.push({
                                  userId: newUser.id,
                                  creator: user.id,
                                  groupId: rtn.id,
                                  grouptype: 0
                                })
                                callback(null)
                              }).catch(err => {
                                t.rollback();
                                reject(err);
                              })
                            }).catch(err => {
                              t.rollback();
                              reject(err);
                            })
                        } else // if (item.id != 0 && item.id != '') 
                        {
                          db.GroupUser.find({
                            where: {
                              groupId: rtn.id,
                              userId: u.id
                            }
                          }, {
                            transaction: null
                          }).then(gu => {
                            if (gu == null) {
                              db.GroupUser.create({
                                groupId: rtn.id,
                                userId: u.id,
                                usertype: 1,
                                disabled: false,
                                creator: user.id
                              }, {
                                transaction: t
                              }).then(d => {
                                data.push({
                                  userId: u.id,
                                  grouptype: 0,
                                  creator: user.id,
                                  groupId: rtn.id

                                })
                                callback(null)
                              }).catch(err => {
                                callback(null);
                                t.rollback();
                              })
                            }
                          })
                        }
                        // })
                      })
                    }, (error, result) => {
                      t.commit();
                      //console.log(data);
                      resolve({
                        data
                      });
                    })
                  }).catch(err => {
                    console.log(err);
                    reject(err);
                    t.rollback();
                  })
                }).catch(err => {
                  // console.log(err);
                  reject(err);
                  t.rollback();
                })
              }).catch(err => {
                reject(err);
              })
            } else {
              db.Group.create({
                name: group.name,
                avatarsrc: group.avatarsrc,
                description: group.description,
                creator: user.id,
                fileaddress: file,
                fileExt: group.fileExt,
                disabled: false
              }, {
                transaction: t
              }).then(rtn => {
                db.GroupUser.create({
                  groupId: rtn.id,
                  userId: user.id,
                  usertype: 2,
                  disabled: false,
                  creator: user.id
                }, {
                  transaction: t
                }).then(groupuser => {
                  async.mapSeries(inviters, (item, callback) => {
                    db.User.find({
                      where: {
                        account: item.account
                      }
                    }).then(u => {
                      if (u == null) { //item.id == 0 && item.id == '' || item.id == null
                        db.User.create({
                            account: item.account,
                            password: md5('123456'),
                            creator: user.id,
                            disabled: false
                          }, {
                            transaction: t
                          })
                          .then(newUser => {
                            db.GroupUser.create({
                              groupId: rtn.id,
                              userId: newUser.id,
                              usertype: 1,
                              disabled: false,
                              creator: user.id
                            }, {
                              transaction: t
                            }).then(d => {
                              data.push({
                                userId: newUser.id,
                                creator: user.id,
                                groupId: rtn.id,
                                grouptype: 0
                              })
                              callback(null)
                            }).catch(err => {
                              t.rollback();
                              reject(err);
                            })
                          }).catch(err => {
                            t.rollback();
                            reject(err);
                          })
                      } else // if (item.id != 0 && item.id != '') 
                      {
                        db.GroupUser.find({
                          where: {
                            groupId: rtn.id,
                            userId: u.id
                          }
                        }, {
                          transaction: null
                        }).then(gu => {
                          if (gu == null) {
                            db.GroupUser.create({
                              groupId: rtn.id,
                              userId: u.id,
                              usertype: 1,
                              disabled: false,
                              creator: user.id
                            }, {
                              transaction: t
                            }).then(d => {
                              data.push({
                                userId: u.id,
                                grouptype: 0,
                                creator: user.id,
                                groupId: rtn.id

                              })
                              callback(null)
                            }).catch(err => {
                              callback(null);
                              t.rollback();
                            })
                          }
                        })
                      }
                      // })
                    })
                  }, (error, result) => {
                    t.commit();
                    //console.log(data);
                    resolve({
                      data
                    });
                  })
                }).catch(err => {
                  console.log(err);
                  reject(err);
                  t.rollback();
                })
              }).catch(err => {
                // console.log(err);
                reject(err);
                t.rollback();
              })
            }

          }
        }).catch(err => {
          reject(err);
          t.rollback();
        })
      })
    })
  },


  // 获取所有或特定公司/团队
  getmyAllGroup: (user, callback) => {
    var sql = `SELECT g.* FROM td_groupuser gu
                INNER JOIN td_user u
                ON u.id=gu.userId
                INNER JOIN td_group g
                ON g.id=gu.groupId
                WHERE IFNULL(u.disabled,false)=false 
                and IFNULL(g.disabled,false)=false 
                and ifnull(gu.disabled,false)=false and  
                gu.usertype =2 and u.account=` + user;
    db.sequelize.query(sql, {
      type: db.sequelize.QueryTypes.SELECT
    }).then(data => {
      if (data && data.length > 0)
        callback(true, null, data);
      else
        callback(true, null, null);
    }).catch(err => {
      callback(false, err, null);
    });
  },

  // 获取所有或特定公司/团队
  getmyAllGroupbyPager: (user, pageIndex, callback) => {
    var pageSize = config.pager.defaultPagerSize;
    var sql = `SELECT g.* FROM td_groupuser gu
    INNER JOIN td_user u
    ON u.id=gu.userId
    INNER JOIN td_group g
    ON g.id=gu.groupId
    WHERE IFNULL(u.disabled,false)=false and IFNULL(g.disabled,false)=false and ifnull(gu.disabled,false)=false and  gu.usertype =2 and u.account=` + user +
      " order by createdAt desc LIMIT :Limit OFFSET :Offset";
    db.sequelize.query(sql, {
      replacements: {
        Limit: pageSize,
        Offset: pageSize * (pageIndex - 1),
      },
      type: db.sequelize.QueryTypes.SELECT
    }).then(function (data) {
      if (data && data.length > 0)
        callback(true, null, data);
      else
        callback(true, null, null);
    }).catch(function (err) {
      console.log(err);
      callback(false, err, null);
    });
  },






  // 根据组名称查询组
  getGroupByName: (name, callback) => {
    db.Group.find({
        where: {
          name: name
        }
      }).then(group => {
        console.log(group);
        callback(group, 1, null);
      })
      .catch(err => callback(null, 0, err));
  },

  // 依据Id检索特定的组信息
  getGroupById: (id, callback) => {
    db.Group.find({
        where: {
          Id: id
        }
      }).then(group => {
        console.log(group);
        callback(group, 1, null);
      })
      .catch(err => callback(null, 0, err));
  },

  //更新组的信息
  updateGroupById: (group, callback) => {
    console.log(group);
    if (group.id == null) {
      callback(false, "group.id 参数不能为空");
    }
    db.Group.update({
        name: group.name,
        description: group.description,
        avatarsrc: group.avatarsrc
      }, {
        where: {
          id: group.id
        }
      })
      .then(
        data => {
          callback(true, 'sucess', data);
        })
      .catch(err => callback(false, err, null))
  },
  UpdateGroupByIdV2: (group, callback) => {
    return new Promise((resolve, reject) => {
      if (group.id == null) {
        reject('group.id参数不能为空')
      } else {
        db.Group.find({
          where: {
            id: group.id
          }
        }).then(rtn => {
          if (rtn == null) {
            reject('不存在该组信息');
          } else {
            if (group.avatarsrc != undefined && group.avatarsrc != '') {
              fileRep.saveFile(group.name, group.fileExt, group.avatarsrc).then(fileObj => {
                rtn.updateAttributes({
                  fileaddress: fileObj.address,
                  fileExt: group.fileExt,
                  name: group.name,
                  description: group.description
                })
              }).catch(err => {
                callback(false, 'update failed' + err, null);
              });
              callback(true, 'succeed', null);
            } else {
              rtn.updateAttributes({
                name: group.name,
                description: group.description,
              }).then(data => {
                console.log(data);
                callback(true, 'success', data);
              }).catch(err => {
                callback(false, 'failed ' + err, null);
              })
            }
          }
        })
      }
    })
  },
  // 获取系统中所有的组信息。
  getAllGroup: callback => {
    db.Group.findAll({}).then(group => {
        console.log(group);
        callback(true, 'success', group);
      })
      .catch(err => callback(false, err, null));
  },
  removeGroupById: (groupid, callback) => {
    return new Promise((resolve, reject) => {
      db.Group.update({
          disabled: 1
        }, {
          where: {
            id: groupid
          }
        })
        .then(group => {
          resolve({
            sucess: true,
            data: group,
            message: 'sucess'
          })
        })
        .catch(err => {
          reject({
            sucess: false,
            data: null,
            message: err
          })
        })
    })

  }
}

module.exports = companyRepo;
