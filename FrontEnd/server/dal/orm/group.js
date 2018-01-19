/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Group', {
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
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        companyId: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        // productgroup: {
        //     type: DataTypes.BIGINT,
        //     allowNull: true
        // },
        avatarsrc: {
            type: DataTypes.BLOB('long'),
            allowNull: true
        },
        fileaddress:{ //头像文件地址
            type:DataTypes.STRING,
            allowNull:true
        },
        fileExt:{ 
            type:DataTypes.STRING,
            allowNull:true
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
        }

    }, {
        tableName: 'td_group',
        freezeTableName: false
    });
};
