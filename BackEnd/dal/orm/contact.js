/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Contact', {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {  //用户 ID
        type: DataTypes.BIGINT,
        allowNull: false
      },
      groupId: { //组 ID
        type: DataTypes.BIGINT,
        allowNull: true
      },
      groupType: { // 0，加入的团队，1，咨询过的组
        type: DataTypes.BIGINT,
        allowNull: true
      },
      disabled: { //是否禁用
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      creator: { //創建人
        type: DataTypes.BIGINT,
        allowNull: true
      },
    //   created_date: { //創建時間
    //     type: DataTypes.DATE,
    //     allowNull: true,
    //     defaultValue: sequelize.NOW
    //   },
      modified_by: { //修改人
        type: DataTypes.BIGINT,
        allowNull: true
      },
    //   modified_date: { //修改時間
    //     type: DataTypes.DATE,
    //     allowNull: true,
    //     defaultValue: sequelize.NOW
    //   }
    }, {
      tableName: 'td_contact',
      freezeTableName: false
    });
  };
  