/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Cooperator', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        UserId: { // 賬號
            type: DataTypes.BIGINT,
            allowNull: false
        },
        TopicId:{ // 密碼
            type:DataTypes.BIGINT,
            allowNull:false
        },
        creator: { //創建人
            type: DataTypes.BIGINT,
            allowNull: true
        },
        created_date: { //創建時間
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue:sequelize.NOW
        },
        modified_by: { //修改人
            type: DataTypes.BIGINT,
            allowNull: true
        },
        modified_date: { //修改時間
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue:sequelize.NOW
        },
        disabled:{ //0启用1禁用
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue:false
        }

    }, {
        tableName: 'td_cooperator',
        freezeTableName: false
    });
};
