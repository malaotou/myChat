var db = require('../../dal/orm');
var async = require('async');

var contactRepo = {
  getMyContact: function (token, callback) {
    var pageSize = config.pager.defaultPagerSize;
    var sql = `SELECT c.* FROM td_group g
    INNER JOIN td_contact c
    ON g.id=c.groupId
    WHERE c.userid=` + token.id;
    db.sequelize.query(sql, {
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
  createContact: function (contact) {
    console.log(contact);
    return new Promise((resolve, reject) => {
      db.sequelize.transaction({
        autocommit: true
      }).then(function (t) {
        async.mapSeries(contact, function (item, callback) {
          console.log(item);
          db.Contact.create({
            userId: item.userId,
            groupId: item.groupId,
            groupType: item.groupType,
            creator: item.creator,
            disabled: false
          }, {
            transaction: t
          }).then((rtn) => {
            callback(null, rtn);
          }).catch(err => {
            console.log(err)
            callback(err, null);
            throw new Error();
          })
        }, function (err, results) {
          if (err != null) {
            reject(err);
            t.rollback();
          } else {
            resolve('success');
            t.commit();
          }
        })
      });
    });
  },
  //通讯录查询
  getInfoByUserId: function (id, callback) {
    //return new Promise((resolve,reject)=>{
    //根据用户Id查询该用户所属的组
    var sql = 'select * from td_group as g where g.id IN (select distinct c.groupId from td_contact as c where c.userId = ' + id + ')';
    db.sequelize.query(sql, {
      type: db.sequelize.QueryTypes.SELECT
    }).then(data => {
      if (data.length > 0) {
        console.log(data);
        callback(true, null, data)
      } else {
        callback(false, 'user or group doesnot exist', null);
      }
    })
    //});
  },
  //根据用户id和组id禁用联系人
  deleteContactByIds: function (userId, groupId, callback) {
    db.User.find({
      where: {
        id: userId
      }
    }).then(u => {
      if (u != null) {
        db.GroupUser.update({
            disabled: true,
          }, {
            where: {
              groupId: groupId,
              userId: userId
            }
          }).then(data =>
            callback(true, 'disabled contact succeed', data)
          )
          .catch(err =>
            callback(false, err, null)
          );
      } else {
        callback(false, 'user doesnot exist', null)
      }
    })
  },
  //根据用户查和组查找内容
  GetContactCount: function (userid, groupId, callback) {
    db.Contact.findAll({
      where: {
        groupid: groupId,
        userid: userid
      }
    }).then(contact => {
      callback(true, contact);
    }).catch(err => {
      callback(false, err);
    });
  },
  //更新通讯录信息
  AddOrUpdateContactInfo: function (userid, groupid, grouptype, callback) {
    contactRepo.GetContactCount(userid, groupid, function (okay, contacts) {
      if (okay) {
        if (contacts.length == 0) {
          db.Contact.build({
              userId: userid,
              groupId: groupid,
              groupType: grouptype,
              creator: userid,
              disabled: false
            }).save()
            .then(contact => {
              callback(true, contact);
            }).catch(err => {
              callback(false, err);
            });
        } else {
          db.Contact.update({
            userId: userid, //
            groupId: groupid,
            groupType: grouptype,
            creator: userid,
            disabled: false //
          }, {
            where: {
              id: contacts[0]['id']
            }
          }).then(contact => {
            callback(true, contact);
          }).catch(err => {
            callback(false, err);
          });

        }
      } else {
        callback(false, contacts);
      }
    });
  }
}
module.exports = contactRepo;
