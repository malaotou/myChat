export class Message {
    //消息ID
    id: string;
    //发送人ID
    SendUserId: number;
    //会话ID 
    TopicId: number;
    Content: string;
    //消息类型 0文本，1.表情，3图片，4文件。
    MessageType: number;
    FileId: number;
    //消息状态 是否撤回，0未撤回，默认，1已撤回
    Status: number;
    disabled: boolean;
    //1客户，2客服回复客户，3协作，4组内聊天，5.系统消息(协作组)，6系统消息（客户）
    sendtype: number;
    created_date: Date;
    modified_date: Date;
    createdAt: Date;
    updatedAt: Date;
    FileOriginalName: string;
    FileExt: string;
    src: string; // 服务器文件路径
    name: string;
    fileaddress: string;
    constructor() {
    }
}
