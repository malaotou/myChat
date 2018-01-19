/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Topic', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    groupid: { // 信息接收组
      type: DataTypes.BIGINT,
      allowNull: true
    },
    aftersaleid:{//售后服务单ID
      type: DataTypes.BIGINT,
      allowNull: true
    },
    userid: { //客户ID
      type: DataTypes.BIGINT,
      allowNull: false
    },
    ProfessionalId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    servicestatus: { //单据状态 0未关闭，1关闭，2客户未确认
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    topictype: { //0服务单会话，1组内会话
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    topiccontent: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Disabled: {
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
    }

  }, {
    tableName: 'td_topic',
    freezeTableName: false
  });
};
