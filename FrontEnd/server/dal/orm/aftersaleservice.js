/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('AfterSaleService', {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      topicid: { //会话ID
        type: DataTypes.BIGINT,
        allowNull: false
      },
      groupid: { // 信息接收组
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
      },
      start_date: { //客服接单时间
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.NOW
      },
      close_date: { //客服关闭时间
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.NOW
      },
      reopen_date: { //客户重新开打时间
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.NOW
      },
      confirm_date: { //客户确认关闭时间
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.NOW
      },
  
    }, {
      tableName: 'td_aftersaleservice',
      freezeTableName: false
    });
  };
  