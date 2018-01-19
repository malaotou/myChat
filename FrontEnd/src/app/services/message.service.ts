import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import * as io from 'socket.io-client';
import { url, fileurl } from '../config/config';
import { AuthenticateService } from './authenticate.server';
import { AuthHttp, JwtHelper } from 'angular2-jwt';
import { Topic } from '../modules/topic';
import { ChatcommonService } from './chatcommon.service';
import { Message } from '../modules/message';
import { LogMessage } from '../modules/logMessage';

@Injectable()
export class MessageService {

  private URL = url.replace('http', 'ws');
  public socket;
  //测试消息，实时
  public subject = new Subject<any>();
  //获取未读消息列表
  public unReadMsgs = new Subject<any>();
  //用于订阅当前会话ID
  public currentTopic = new Subject<Topic>();
  //单条消息变更
  public singleMsg = new Subject<Message>();
  //获取会话所有未读消息
  public unreadTopicMsgs = new Subject<any>();
  private topicId: number;
  private currentSendType = new Subject<number>();

  constructor(private authService: AuthenticateService, private authHttp: AuthHttp, private chatcommonService: ChatcommonService) {

    this.socket = io(this.URL, { forceNew: true });
    //console.log(this.socket);
    this.currentTopic.subscribe(topic => this.topicId = topic.id);
  }


  // 取消服务端Socket的订阅。
  unSubscribeSocket(name) {
    this.socket.removeAllListeners(name);
    //this.socket.removeListener('chatMessage');
  }
  //断开socket链接
  socketDisconnect() {
    console.log(this.socket);
    this.socket.removeAllListeners();
    this.socket.emit('disconnect');
    console.log(this.socket);
  }



  setTestMessage(message) {
    this.subject.next(message);
  }
  getTestMessage() {
    return this.subject.asObservable();
  }
  getSendType() {
    return this.currentSendType.asObservable();
  }
  //设置当前会话ID
  setTopic(topic: Topic) {
    this.currentTopic.next(topic);
  }
  //测试从登陆开始订阅新消息
  subscribeTestMessage() {
    var observable = new Observable(observer => {
      this.socket.on('test', (data) => {
        observer.next(data);
      });
    })
    return observable;
  }
  //设置未读消息列表
  // setUnReadMsgs(msg) {
  //   this.unReadMsgs.next(msg);
  // }
  //获取未读消息列表
  getUnReadMsgs() {
    return this.unReadMsgs.asObservable();
  }
  //登陆获取未读消息会话列表
  subscribeSocketMessage() {
    var observable = new Observable(observer => {
      //不存在添加添加监听事件
      if (this.socket._callbacks.$postunreadmsgs == undefined) {
        this.socket.on('postunreadmsgs', (data) => {
          if (data != null)
            observer.next(data);
          console.log(data);
        });
      }
      else {
        //console.log('监听事件【postunreadmsgs】已存在');
      }

    })
    return observable;
  }
  //订阅单个未读消息变化
  getSingleMsg() {
    return this.singleMsg.asObservable();
  }
  //订阅当前会话所有未读消息变化
  getUnreadTopicMsgs() {
    return this.unreadTopicMsgs.asObservable();
  }
  SendLog(Content: String) {
    var msg = new LogMessage();
    msg.Content = Content;
    msg.SendBy = '杨广超';
    msg.SendTime = new Date();
    msg.SendTo = '杨豆豆';
    msg.State = '成功';
    this.socket.emit('logmsg', msg);
    console.log(msg);
  }
  //发送文本消息
  sendMessage(Content: string, sendtype: number) {
    var token = localStorage.getItem('token');
    if (token != null) {
      var tokendata: any = this.authService.decodeToken(token);
      var message = {
        SendUserId: tokendata.id,
        Content: Content,
        sendtype: sendtype,
        TopicId: this.topicId,
      }
      console.log(message);
      this.socket.emit('savetextmsg', message);
      this.SendLog(Content);
      console.log('发送');
    }
  }
  // 发送图片/文件消息 SendUserId/fileExt/pic
  sendFileMessage(Content: any, sendtype: number) {
    var token = localStorage.getItem('token');
    if (token != null) {
      var tokendata: any = this.authService.decodeToken(token);
      var message = {
        SendUserId: tokendata.id,
        pic: Content.data,
        fileExt: Content.ext,
        sendtype: sendtype,
        TopicId: this.topicId,
        name: Content.name
      }
      console.log(message);
      this.socket.emit('saveimgmsg', message);
    }
  }

  //发送消息失败，返回失败消息信息
  sendMsgError() {
    var observable = new Observable(observer => {
      //不存在添加添加监听事件
      if (this.socket._callbacks.$msgretunerr == undefined) {
        this.socket.on('msgretunerr', (data) => {
          observer.next(data);
          console.log(this.topicId + '发送失败的消息');
          console.log(data);
        });
      }
      else {
        //console.log('监听事件【msgretunerr】已存在');
      }

    })
    return observable;
  }
  //发送@消息
  sendAtMessage(Content: string, sendtype: number, atUserId: number) {
    var token = localStorage.getItem('token');
    if (token != null) {
      var tokendata: any = this.authService.decodeToken(token);
      var message = {
        SendUserId: tokendata.id,
        Content: Content,
        sendtype: sendtype,
        TopicId: this.topicId,
      }
      console.log(message);
      this.socket.emit('postuserintopic', message, atUserId);
    }
  }
  //发送@消息失败，返回失败消息信息
  sendAtMsgError() {
    var observable = new Observable(observer => {
      //不存在添加添加监听事件
      if (this.socket._callbacks.$retunuserintopic == undefined) {
        this.socket.on('retunuserintopic', (data) => {
          observer.next(data);
          console.log(this.topicId + '发送失败的@消息');
          console.log(data);
        });
      }
      else {
        //console.log('监听事件【retunuserintopic】已存在');
      }

    })
    return observable;
  }
  //获取单个消息（当前用户处于当前会话才接收单个消息）
  getSingleMessage() {
    // var observable = new Observable(observer => {
    //不存在添加添加监听事件
    if (this.socket._callbacks.$postunreadmsg == undefined) {
      this.socket.on('postunreadmsg', (datatmp) => {
        var data = datatmp;
        if (datatmp.MessageType != 0) {
          data = Object.assign({}, datatmp, { src: (fileurl + datatmp.Content).replace('/thumbnail', '') })
        }
        else {
          data = datatmp;
        }

        console.log(this.topicId + '单个消息：');
        console.log(data);
        var msg = <Message>data;
        var msgs = new Array<Message>();
        msgs.push(msg);
        //添加当前消息到本地
        this.chatcommonService.setLocalMessage(msgs, this.topicId).then(r => {
          //console.log('更新单个消息到本地');
          //observer.next(msg);
          this.singleMsg.next(msg);
          //设置消息已读接口
          this.postmessageread();
        });
        this.chatcommonService.updateUnReadMsgs(this.topicId, msg).then(r => {
          if (r != null) {
            console.log(r);
            this.unReadMsgs.next(r);
            console.log('更新最后一条消息');
          }
        });
      });
    }
    else {
      //console.log('监听事件【postunreadmsg】已存在');
    }

    // })
    //return observable;
  }
  //通知server获取会话未读消息
  getUnreadTopic() {
    var tokendata: any = this.authService.decodeToken(localStorage.getItem('token'));
    this.socket.emit('getunreadtopic', tokendata.id, this.topicId);
    console.log('已执行getunreadtopic');
  }
  //获取会话未读消息
  postUnreadTopic() {
    //var observable = new Observable(observer => {
    //不存在添加添加监听事件
    if (this.socket._callbacks.$postunreadtopics == undefined) {
      this.socket.on('postunreadtopics', (data) => {
        this.chatcommonService.setLocalMessage(<Array<Message>>data.messages, this.topicId).then(r => {
          //this.chatcommonService.setTopicSendType(this.topicId,)
          this.currentSendType.next(<number>data.sendtype);
          console.log(this.topicId + '获取会话所有未读消息：');
          console.log(data);
          this.unreadTopicMsgs.next(data);
          //observer.next(data);
          //设置消息已读接口
          this.postmessageread();
          this.chatcommonService.setTopicUnread(this.topicId).then(d => {
            this.unReadMsgs.next(this.currentTopic);
          });
        });
      });
    }
    else {
      //console.log('监听事件【postunreadtopics】已存在');
    }

    //})
    //return observable;
  }
  //用户离开会话
  userleaveroom() {
    var token = localStorage.getItem('token');
    if (token != null) {
      var tokendata: any = this.authService.decodeToken(token);
      console.log(this.topicId);
      if (this.topicId != 0 && this.topicId != undefined) {
        console.log('离开会话' + this.topicId);
        this.socket.emit('userleaveroom', tokendata.id, this.topicId);
      }
    }
    //监听离开房间是否成功，个人认为没有必要
    //retunleaveroom
  }
  //设置消息已读接口
  postmessageread() {
    console.log('设置已读消息');
    var token = localStorage.getItem('token');
    if (token != null) {
      var tokendata: any = this.authService.decodeToken(token);
      this.socket.emit('postmessageread', tokendata.id, this.topicId);
    }
  }
  //监听消息已读是否成功
  retunmessageread() {
    var observable = new Observable(observer => {
      //不存在添加添加监听事件
      if (this.socket._callbacks.$retunmessageread == undefined) {
        this.socket.on('retunmessageread', (data) => {
          console.log('已读消息接口反馈');
          console.log(data);
          observer.next(data);
        });
      }
      else {
        //console.log('监听事件【retunmessageread】已存在');
      }

    })
    return observable;
  }
  //登陆注册设备信息
  registerTopic() {
    var token = localStorage.getItem('token');
    if (token != null) {
      var tokendata: any = this.authService.decodeToken(token);
      //console.log(tokendata);
      this.socket.emit('getunreadmsgs', tokendata.id);
    }
  }
  //管理员指派客服
  postAssignOrder(userId: number) {
    var token = localStorage.getItem('token');
    if (token != null) {
      var tokendata: any = this.authService.decodeToken(token);
      //console.log(tokendata);
      this.socket.emit('postassignorder', tokendata.id, userId, this.topicId);
    }
  }
  //监听指派客服失败消息
  retunAssignOrder() {
    var observable = new Observable(observer => {
      //不存在添加添加监听事件
      if (this.socket._callbacks.$retunassignorder == undefined) {
        this.socket.on('retunassignorder', (data) => {
          observer.next(data);
          console.log(this.topicId + '指派客服失败');
          console.log(data);
        });
      }
      else {
        //console.log('监听事件【retunuserintopic】已存在');
      }

    })
    return observable;
  }
  //客服关闭服务
  closeService() {
    console.log('客服关闭服务');
    var token = localStorage.getItem('token');
    if (token != null) {
      var tokendata: any = this.authService.decodeToken(token);
      this.socket.emit('postcloseorder', tokendata.id, this.topicId);
    }
  }

  //客户确认关闭
  confirmService() {
    console.log('客户确认关闭');
    var token = localStorage.getItem('token');
    if (token != null) {

      var tokendata: any = this.authService.decodeToken(token);

      console.log(tokendata.id, this.topicId);
      this.socket.emit('postconfirmcloseorder', tokendata.id, this.topicId);
    }
  }

  //客户重新打开服务
  customerOpenService() {
    console.log('客户重新打开服务');
    var token = localStorage.getItem('token');
    if (token != null) {
      var tokendata: any = this.authService.decodeToken(token);
      this.socket.emit('postcustomeropenorder', tokendata.id, this.topicId);
    }
  }
  //客服确定接单
  OrderReceiving() {
    console.log('客服确定接单');
    var token = localStorage.getItem('token');
    if (token != null) {
      var tokendata: any = this.authService.decodeToken(token);
      this.socket.emit('SetTopicService', tokendata.id, this.topicId);
    }
  }
  getLogMessage() {
    return new Observable(observer => {
      this.socket.on('log', (data) => {
        observer.next(data);
      });
    })
  }
}
