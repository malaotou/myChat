/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Message', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    SendUserId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    TopicId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    Content: { //消息内容
      type: DataTypes.STRING,
      allowNull: false
    },
    MessageType: { //0文本，1.表情，3图片，4文件。
      type: DataTypes.BIGINT,
      allowNull: false
    },
    FileId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    Status: { //消息状态
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    disabled: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    created_date: { //創建時間
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.NOW
    },
    modified_date: { //修改時間
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.NOW
    },
    sendtype: { //发送类型，1客户，2客服回复客户，3协作，4组内聊天
      type: DataTypes.BIGINT,
      allowNull: false
    }

  }, {
    tableName: 'td_message',
    freezeTableName: false
  });
};
