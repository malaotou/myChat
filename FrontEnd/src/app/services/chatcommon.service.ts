import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { AuthenticateService } from './authenticate.server'
import { GroupService } from './group.service';
import { StorageService } from './storage.service';
import { Topic } from '../modules/topic';
import { Message } from '../modules/message';
import { Group } from '../modules/group';

@Injectable()
export class ChatcommonService {

  constructor(
    public groupService: GroupService,
    private auth: AuthenticateService,
    private storageService: StorageService) {
    // if(this.auth.isAuthenticated)
    // {
    //   this.currentUser=this.auth.decodeToken(localStorage.getItem('token'));
    // }
  }
  //设置未读消息会话列表到本地
  setUnReadMsgs(msgs: Array<Topic>) {
    return new Promise((resolve, reject) => {
      var currentUser = this.auth.decodeToken(localStorage.getItem('token'));
      //获取本地数据，验证是否存在不存在添加，存在更新最后一条消息
      this.storageService.getItem<Array<Topic>>('chatRooms' + currentUser.id).then(c => {
        var result = new Array<Topic>();
        if (c != null)
          Array.prototype.push.apply(result, c);
        //如果本地没有缓存数据，添加
        if (result.length == 0) {
          msgs.forEach((item, index) => {
            item.isunread = true;
          })
          Array.prototype.push.apply(result, msgs);
          this.storageService.setItem('chatRooms' + currentUser.id, result);
          resolve(result);
        }
        else {
          //var updateresult=new Array<ChatGroup>();
          msgs.forEach((val, index) => {
            var res = result.filter(f => f.id == val.id && f.groupid == val.groupid && f.topictype == val.topictype);
            if (res.length == 0) {
              val.isunread = true;
              //新增追加到索引第一个
              result.splice(0, 0, val);
            }
            else {
              //如果本地存在，更新
              res[0].name = val.name;
              res[0].filepath = val.filepath;
              res[0].messageinfo = val.messageinfo;
              res[0].topiccontent = val.topiccontent + ':测试修改后的数据';
              res[0].topictype = val.topictype;
              res[0].ProfessionalId = val.ProfessionalId;
              res[0].servicestatus=val.servicestatus;
              res[0].userid = val.userid;
              res[0].groupid = val.groupid;
              res[0].Disabled = val.Disabled;
              res[0].Sendtype = val.Sendtype;
              res[0].code = val.code;
              res[0].admin = val.admin;
              res[0].isunread = true;
              //updateresult.push(val);
              console.log('此处被调用');
            }
          })
          this.storageService.setItem('chatRooms' + currentUser.id, result);
          resolve(result);
        }
      })
    });
  }
  //获取本地未读消息会话列表到
  getUnReadMsgs(topic: Topic): Promise<Array<Topic>> {
    return new Promise((resolve, reject) => {
      var currentUser = this.auth.decodeToken(localStorage.getItem('token'));
      //console.log(currentUser);
      this.storageService.getItem<Array<Topic>>('chatRooms' + currentUser.id).then(g => {
        var result = new Array<Topic>();
        //console.log(g);
        //console.log(topic);
        //当本地数据为空,添加当前会话到本地
        if (g == null && topic != null) {
          topic.messageinfo = null;
          result.push(topic);
          this.storageService.setItem('chatRooms' + currentUser.id, result);
          resolve(result);
        }
        else if (topic == null) {
          if (g != null)
            Array.prototype.push.apply(result, g);
          // var s=g.filter(f=>f.id!=81);
          // this.storageService.setItem('chatRooms' + currentUser.id, s);
          resolve(result);
        }
        else {
          Array.prototype.push.apply(result, g);
          //本地不为空，但是本地不存在当前会话，添加到索引第一条
          var res = result.filter(f => f.id == topic.id);
          if (res.length == 0) {
            topic.messageinfo = null;
            //新增追加到索引第一个
            result.splice(0, 0, topic);
          }
          else {
            //如果本地存在，更新
            res[0].name = topic.name;
            res[0].filepath = topic.filepath;
            if (topic.messageinfo)
              res[0].messageinfo = topic.messageinfo;
            res[0].topiccontent = topic.topiccontent + ':get测试修改后的数据';
            res[0].topictype = topic.topictype;
            res[0].ProfessionalId = topic.ProfessionalId;
            res[0].servicestatus=topic.servicestatus;
            res[0].userid = topic.userid;
            res[0].groupid = topic.groupid;
            res[0].Disabled = topic.Disabled;
            res[0].Sendtype = topic.Sendtype;
            res[0].code = topic.code;
            res[0].admin = topic.admin;
            res[0].isunread = false;
          }
          this.storageService.setItem('chatRooms' + currentUser.id, result);
          resolve(result);
        }
      })
        .catch(err => console.log(err));
    });
  }
  //更新本地会话最后一条消息
  updateUnReadMsgs(topicId: number, msg: Message): Promise<Array<Topic>> {
    return new Promise((resolve, reject) => {
      var currentUser = this.auth.decodeToken(localStorage.getItem('token'));
      //console.log(currentUser);
      this.storageService.getItem<Array<Topic>>('chatRooms' + currentUser.id).then(g => {
        if (g != null) {
          var res = g.filter(f => f.id == topicId);
          if (res.length > 0) {
            //如果本地存在，更新
            res[0].messageinfo = msg;
            res[0].isunread = false;
            this.storageService.setItem('chatRooms' + currentUser.id, g);
            // //更新当前会话最后一条消息，通知订阅页面显示
            // this.messageService.unReadMsgs.next(g);
            resolve(g);
          }
          else {
            resolve(null);
          }
        }
        else {
          resolve(null);
        }
      });
    });
  }
  //设置当前会话的聊天记录
  setLocalMessage(msgs: Array<Message>, topicId: number) {
    return new Promise((resolve, reject) => {
      var currentUser = this.auth.decodeToken(localStorage.getItem('token'));
      //获取本地消息数据，验证是否存在不存在添加，存在更新最后一条消息
      this.storageService.getItem<Array<Message>>('messagelist' + topicId + currentUser.id).then(c => {
        var result = new Array<Message>();
        if (c != null)
          Array.prototype.push.apply(result, c);
        //如果本地没有缓存数据，添加
        if (result.length == 0) {
          Array.prototype.push.apply(result, msgs);
          //此处需要排序后保存（待补充）
          //result.sort()
          this.storageService.setItem('messagelist' + topicId + currentUser.id, result).then(r=>{
            resolve(result);
          });
        }
        else {
          //var updateresult=new Array<ChatGroup>();
          msgs.forEach((val, index) => {
            var res = result.filter(f => f.id == val.id);
            if (res.length == 0) {
              //新增追加到数组尾部
              result.push(val);
              //result.splice(0,0,val);
            }

          })
          this.storageService.setItem('messagelist' + topicId + currentUser.id, result).then(r=>{
            resolve(result);
          });
        }
      })
    });
  }
  //获取当前会话的聊天记录
  getLocalMessage(topicId: number): Promise<Array<Message>> {
    return new Promise((resolve, reject) => {
      var currentUser = this.auth.decodeToken(localStorage.getItem('token'));
      //获取本地消息数据
      this.storageService.getItem<Array<Message>>('messagelist' + topicId + currentUser.id).then(c => {
        var result = new Array<Message>();
        if (c != null)
          Array.prototype.push.apply(result, c);
        resolve(result);
      });
    });
  }
  //设置当前会话消息为已读状态
  setTopicUnread(topicId: number): Promise<Array<Topic>> {
    return new Promise((resolve, reject) => {
      console.log('设置会话：' + topicId + ' 消息已读')
      var currentUser = this.auth.decodeToken(localStorage.getItem('token'));
      //console.log(currentUser);
      this.storageService.getItem<Array<Topic>>('chatRooms' + currentUser.id).then(g => {
        if (g != null) {
          var res = g.filter(f => f.id == topicId);
          if (res.length > 0) {
            res[0].isunread = false;
            this.storageService.setItem('chatRooms' + currentUser.id, g);
            resolve(g);
          }
          else {
            resolve(g);
          }
        }
        else {
          resolve(null);
        }
      });
    });
  }
  //
  //设置当前会话当前登陆人所属身份
  setTopicSendType(topicId: number, sendType: number) {
    return new Promise((resolve, reject) => {
      var currentUser = this.auth.decodeToken(localStorage.getItem('token'));
      //获取本地消息数据，验证是否相同，不相同更新
      this.storageService.getItem<number>('topicSendType' + topicId + currentUser.id).then(c => {
        var result: number;
        result = c;
        if (c != null && sendType != c) {
          result = sendType;
        }
        this.storageService.setItem('topicSendType' + topicId + currentUser.id, result);
        resolve(result);
      })
    });
  }
  //获取当前会话当前登陆人所属身份
  getTopicSendType(topicId: number): Promise<number> {
    return new Promise((resolve, reject) => {
      var currentUser = this.auth.decodeToken(localStorage.getItem('token'));
      //获取本地消息数据
      this.storageService.getItem<number>('topicSendType' + topicId + currentUser.id).then(c => {
        resolve(c);
      })
    });
  }
  //通讯录本地数据存储
  //根据当前用户ID，获取通讯录
  getContacts(isRefresh: boolean = false): Promise<Array<Group>> {
    return new Promise((resolve, reject) => {
      var currentUser = this.auth.decodeToken(localStorage.getItem('token'));
      this.storageService.getItem<Array<Group>>('allContacts' + currentUser.id).then(g => {
        var result = new Array<Group>();
        Array.prototype.push.apply(result, g);
        //如果缓存没有数据，强制更新
        if (result.length == 0) {
          isRefresh = true;
          console.log('contacts被执行11');
        }
        else {
          resolve(result);
          console.log('contacts被执行22');
        }
        //判断是否更新本地数据
        if (isRefresh) {
          this.groupService.getContact(currentUser.id)
            .subscribe(data => {
              console.log("通讯录", data);
              if (data.data != null) {
                this.storageService.setItem('allContacts' + currentUser.id, data.data);
                //Array.apply(result,data.data);
                Array.prototype.push.apply(result, data.data);
                //this.arraydemo.next(Array.apply(result,data.data));
                //console.log(result);
                console.log('contacts被执行33');
                resolve(result);
                console.log(result);

              }
              else {
                resolve(result);
              }
              //return result;
            });
        }
        //console.log(result);
      });
    })

    //   return result;
  }
}
