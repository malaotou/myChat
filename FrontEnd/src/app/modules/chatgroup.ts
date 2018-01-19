import {Message} from './message'
export class ChatGroup {
    //会话id，Topic表ID
    id:number;
    //聊天标题
    name:string;
    //聊天头像
    avatarsrc:string;
    //当前人员ID
    userid:number;
    //分组ID
    groupid:number;
    //会话是否禁用，默认0位禁用
    Disabled:boolean;
    //客服负责人ID
    ProfessionalId:number;
    //服务状态（暂未说明用途）
    servicestatus:number;
    //会话内容
    topiccontent:string;
    //会话类型（0服务单会话，1组内会话）
    topictype:number;
    //最后一次聊天消息
    messageinfo:Message;
    constructor(){
    }
}
