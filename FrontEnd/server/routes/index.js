module.exports = function (app) {
  app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    //res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
  });
  //用户模块
  // 用户模块
  app.use("/api/user", require("./user"));

  //公司模块
  app.use("/api/company", require("./company"));

  //产品组模块
  app.use("/api/productgroup", require("./productgroup"));
  // 团队组模块
  app.use("/api/group", require("./group"));
  // 消息模块
  app.use("/api/message", require("./message"));
  // 团队成员管理模块
  app.use("/api/groupuser", require("./groupuser"));
  //会话管理模块
  app.use("/api/topic", require("./topic"));
  //注册
  //app.use("/signup", require('./signup'));
  //获取token
  //app.use('/authorize', require('./authorize'));
  // 通讯录管理模块
  app.use("/api/contact", require("./contact"));

  // 文件Api -内部使用
  app.use("/api/file",require("./file"));
  app.use("/api/message/testfile",require("./message"));
}
