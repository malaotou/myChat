import {Message} from './message'
export class Topic {
    id:number;
    //1：新建会话，2：已有会话，3:新建组内会话，4：已有组内会话,5:错误
    code:number;
    //当前会话，当前登录人所属身份。（1用户，2客服，3协作人员,4错误）
    Sendtype:number;
    //聊天标题
    name:string;
    //聊天头像
    filepath:string;
    //客户ID
    userid:number;
    //组ID 
    groupid:number;
    //客服负责人ID
    ProfessionalId:number;
    //服务状态(0未关闭，1关闭，2客户未确认)
    servicestatus:number;
    //会话类型(0服务单会话，1组内会话)
    topictype:number;
    //话题内容
    topiccontent:string;
    //创建人ID
    creator:number;
    //创建时间
    created_date:Date;
    //修改人
    modified_by:number;
    //修改时间
    modified_date:Date;
    //是否禁用 默认0未禁用
    Disabled:boolean;
    //最后一次聊天消息
    messageinfo:Message;
    createdAt:Date;
    updatedAt:Date;
    //当前会话，当前登录人是否为管理员
    admin:boolean;
    //控制头像是否显示未读消息 true 有未读消息 false 没有
    isunread:boolean;
    constructor(){
        this.id=0;
        // this.userId=userid;
        // this.date=Date.now(); ;
        // this.message=message;
        // this.userName=username;
        // this.room=room;
        this.admin=false;
        this.isunread=false;
    }
}
