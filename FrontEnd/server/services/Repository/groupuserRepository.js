var db = require('../../dal/orm')
var companyRepo = {
  // 创建公司/团队
  createGroupUser: function (group, user, account, callback) {
    db.GroupUser.find({
      where: {
        userid: user.id,
        groupid: group.id
      }
    }).then(data => {
      if (data == null) {
        db.GroupUser.build({
            groupId: group.id,
            userId: user.id,
            usertype: 1,
            disabled:false,
            enableStatus: true,
            creator: account.id
          })
          .save()
          .then(data => callback(true, 'sucess', data))
          .catch(function (err) {
            callback(false, err, null);
            console.log(err);
          });
      }
    })
  },

  createManager: function (group, user, account, callback) {
    db.GroupUser.build({
        groupId: group.groupId,
        userId: account.id,
        usertype: 2,
        enableStatus: true,
        creator: account.id
      })
      .save()
      .then(data => callback(true, 'sucess', data))
      .catch(function (err) {
        callback(false, err, null);
        console.log(err);
      });
  },

  // 依据GroupId 获取特定组的信息
  getMyGroupUser: function (groupid, isfiltered, userid, callback) {
    var sql = '';
    if(isfiltered == 0){
      sql = `SELECT u.* FROM td_user  u
      INNER JOIN td_groupuser gu1
      ON gu1.userId=u.id
      AND groupid =
      (
      SELECT gu.groupId FROM td_groupuser gu
      INNER JOIN td_group g
      ON gu.groupId=g.id
      WHERE gu.userId=` + userid +` AND g.id=` + groupid + ` And gu.usertype =2 AND IFNULL(g.disabled,FALSE)=FALSE
      )
      WHERE IFNULL(gu1.disabled,FALSE)=FALSE
      AND IFNULL(u.disabled,FALSE)=FALSE`;
    }else{
      sql = `SELECT u.* FROM td_user  u
      INNER JOIN td_groupuser gu1
      ON gu1.userId=u.id
      AND groupid =
      (
      SELECT gu.groupId FROM td_groupuser gu
      INNER JOIN td_group g
      ON gu.groupId=g.id
      WHERE gu.userId=` + userid +` AND g.id=` + groupid + ` AND IFNULL(g.disabled,FALSE)=FALSE
      )
      WHERE IFNULL(gu1.disabled,FALSE)=FALSE
      AND IFNULL(u.disabled,FALSE)=FALSE`;
    }
    
    db.sequelize.query(sql, {
      type: db.sequelize.QueryTypes.SELECT
    }).then(function (data) {
      console.log(data);
      if (data && data.length > 0)
        callback(true, null, data);
      else
        callback(true, null, null);
    }).catch(function (err) {
      callback(false, err, null);
    });
  },

  // 更新当前用户状态关联关系
  removeMemberbyId: function (group, user, callback) {
    db.User.find({
      where: {
        account: user.account
      }
    }).then(u => {
      if (u != null) {
        db.GroupUser.update({
            disabled: true,
            modified_by:group.modified_by
          }, {
            where: {
              groupid: group.id,
              userId: u.id
            }
          }).then(data =>
            callback(true, 'sucess', data)
          )
          .catch(err =>
            callback(false, err, null));
      }
    })
  },

  removeMemberbyGroupId: function (groupid, callback) {
    db.GroupUser.destroy({
        where: {
          groupid: groupid
        }
      }).then(data => callback(true, null, data))
      .catch(err => callback(false, error, null))
  }
}
module.exports = companyRepo;
