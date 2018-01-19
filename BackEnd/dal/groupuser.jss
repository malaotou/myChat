/* jshint indent: 2 */
var user=require('./user');
var ProductGroup=require('./productgroup')
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('UserGroup', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        userid: { // User 表外键
            type: DataTypes.BIGINT,
            allowNull: false,
            /// <reference path="" />
            references:{
                model:user,
                key:'id',
            }
        },
        groupid: {
            type: DataTypes.BIGINT,
            allowNull: true,
            reference:ProductGroup,
            key:'id'
        },
        // ismanager:{
        //     type:Datatypes.BIGINT,
        //     allowNull:false
        // },
        enablestatus:{
            type:Datatypes.BIGINT,
            allowNull:false
        },
        creator: { //創建人
            type: DataTypes.BIGINT,
            allowNull: true
        },
        created_date: { //創建時間
            type: DataTypes.DATE,
            allowNull: true
        },
        modified_by: { //修改人
            type: DataTypes.BIGINT,
            allowNull: true
        },
        modified_date: { //修改時間
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'td_usergroup',
        freezeTableName: false
    });
};
