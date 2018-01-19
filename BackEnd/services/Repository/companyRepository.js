var db = require('../../dal/orm')
var companyRepo = {
  // 创建公司/团队
  createCompany: function (company, callback) {
    db.Company.build({
          name:company.name,
          avatarsrc:company.avatarsrc,
          address:company.description
      })
      .save()
      .then(function (user) {
      })
      .catch(err => {

      });
  },
  // 获取所有或特定公司/团队
  getAllCompany: function (user, callback) {
    // db.User.findAll({})
    //   .then(users => {
    //     callback(users);
    //   })
  },

  // 获取指定名称的用公司/团队信息
  getCompanyByUserId: function (id, callback) {
    // db.User.find({
    //     where: {
    //       account: id
    //     }
    //   })
    //   .then(user => {
    //     if (user != null) {
    //       callback(1, user);
    //     } else {
    //       callback(0, 'User not exists')
    //     }
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     callback(2, err);
    //   })
  }
}
module.exports = companyRepo;
