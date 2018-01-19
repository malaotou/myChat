/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('GroupUser', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        groupId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        usertype: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        disabled: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },   
        creator: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        created_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        modified_by: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        modified_date: {
            type: DataTypes.DATE,
            allowNull: true
        },      
    }, {
        tableName: 'td_groupuser',
        freezeTableName: false
    });
};
    