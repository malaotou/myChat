/* jshint indent: 2 */
var db = require('../orm')
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('ProductGroup', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        companyid: { // 所屬公司的名稱
            type: DataTypes.BIGINT,
            allowNull: true
            // ,
            // references:{
            //     model:db.Company,
            //     key:'id'
            // }
            /// <reference path="" />
        },
        name: {     // 所屬公司的產品組名稱。
            type: DataTypes.BIGINT,
            allowNull: true
        },
        parentid:{  // 父級組Id，暫時不使用該功能
            type: DataTypes.BIGINT,
            allowNull: true
        },
        avatarsrc: { //頭像
            type: DataTypes.STRING,
            allowNull: true
        },
        description:{
            type: DataTypes.STRING,
            allowNull: true
        },
        creator: {  //創建人
            type: DataTypes.BIGINT,
            allowNull: true
        },
        created_date: { // 
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue:sequelize.NOW
        },
        modified_by: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        modified_date: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue:sequelize.NOW
        }
    }, {
        tableName: 'td_productgroup',
        freezeTableName: false
    });
};
