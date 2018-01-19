/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('MessagePush', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        MessageId: { // 消息ID
            type: DataTypes.BIGINT,
            allowNull: false
        },
        TopicId:{ // 会话ID
            type:DataTypes.BIGINT,
            allowNull:false
        },
        ReceiveUserId: { // 接收人ID
            type: DataTypes.BIGINT,
            allowNull: false
        },
        ReceiveStatus:{ // 接收状态
            type:DataTypes.BIGINT,
            allowNull:false
        },
        messagetype:{ // 消息类型：0客服，1协作
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
        Disabled:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:false
        }

    }, {
        tableName: 'td_messagepush',
        freezeTableName: false
    });
};
