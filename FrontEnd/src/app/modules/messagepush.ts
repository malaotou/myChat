export class MessagePush {
    id:number;
    //消息ID
    messageId:number;
    //会话ID
    topicId:number;
    //接收人ID
    receiveUserId:number;
    //接收状态(0未接收，1已接收)
    receiveStatus:number;
    //创建人ID
    creator:number;
    //创建时间
    created_date:Date;
    //修改人
    modified_by:number;
    //修改时间
    modified_date:Date;
    //是否禁用 默认0未禁用
    disabled:boolean;

    constructor(){
        // this.Id=UUID.UUID();
        // this.userId=userid;
        // this.date=Date.now(); ;
        // this.message=message;
        // this.userName=username;
        // this.room=room;
    }
}
