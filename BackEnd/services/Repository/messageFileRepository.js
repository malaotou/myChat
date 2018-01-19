var db = require('../../dal/orm')
var messageFileRepo = {
  // 创建消息文件
  createMessageFile: function (messageFile, callback) {
    console.log(messageFile);
    db.MessageFile.build({
        messageid: messageFile.id,
        FileContent: messageFile.FileContent,
        FileOriginalName: messageFile.FileOriginalName,
        FileExt: messageFile.FileExt,
        creator: messageFile.Creator,
        Disabled: false
      })
      .save()
      .then(function (message) {
        callback(message, messageFile)
      })
      .catch(err => {
        callback(null, null);
        //console.log(err);
      });
  }
}
module.exports = messageFileRepo;
