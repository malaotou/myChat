/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('PermisionRequest', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        userid: { // 申请人
            type: DataTypes.STRING,
            allowNull: false
        },
        groupid:{ // 申请状态
            type:DataTypes.STRING,
            allowNull:false
        },
        approveStatus:{
            type:DataTypes.BIGINT,
            allowNull:false,
            default:0
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
        tableName: 'td_permisionrequest',
        freezeTableName: false
    });
};
