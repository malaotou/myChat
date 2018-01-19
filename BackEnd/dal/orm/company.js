/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Company', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    companylogo: { //頭像
      type: DataTypes.BLOB,
      allowNull: true
    },
    approve: { //頭像
      type: DataTypes.BIGINT,
      allowNull: true
    },
    LegalPerson: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IDCardFont: {
      type: DataTypes.BLOB('long'),
      allowNull: true
    },
    IDCardBack: {
      type: DataTypes.BLOB('long'),
      allowNull: true
    },
    businessLicenseNo: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    businessLicense: {
      type: DataTypes.BLOB('long'),
      allowNull: true
    },
    Manager: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    disabled: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    creator: { //創建人
      type: DataTypes.BIGINT,
      allowNull: true
    },
    created_date: { //創建時間
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.NOW
    },
    modified_by: { //修改人
      type: DataTypes.BIGINT,
      allowNull: true
    },
    modified_date: { //修改時間
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.NOW
    }
  }, {
    tableName: 'td_company',
    freezeTableName: false
  });
};
