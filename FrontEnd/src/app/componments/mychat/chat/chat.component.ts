import { SEND_MESSAGE } from './../store/action';
import { Component, OnInit, Input, OnChanges, OnDestroy, AfterViewInit, DoCheck, Output, EventEmitter, ElementRef, ViewChild, Renderer2, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../services/message.service';
import { Topic } from '../../../modules/topic';
import { AuthenticateService } from '../../../services/authenticate.server'
import { ChatcommonService } from '../../../services/chatcommon.service';
import { Message } from '../../../modules/message';
import { GroupService } from '../../../services/group.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CaretEvent, EmojiEvent, EmojiPickerOptions } from 'angular2-emoji-picker';
import { EmojiPickerAppleSheetLocator } from "angular2-emoji-picker/lib-dist/sheets";
import { url, fileurl } from '../../../config/config';
import uuid from 'uuid/v4';
import { concat } from 'rxjs/observable/concat';
import { utf8Encode } from '@angular/compiler/src/util';
import { select, NgRedux } from 'ng2-redux';
import { IAppState } from '../store/store';

declare var $: any;
declare var window: any;
//const electron = window.require('electron');
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  socket = null;
  topicId: any;
  toggled = false;
  @Input() chatRoom: Topic;
  @ViewChild("transfile")
  tfile;

  @select()
  users;

  //当前会话当前登陆人身份,默认普通用户（1用户，2客服，3协作人员）
  currentSendtype: number = 1;
  //当前消息发送类型，1 用户发送消息 2 客服发送消息 3 协作消息 （因客服人员可以发送2种消息，特此区分）
  messageSendtype: number = 1;
  currentUser = this.auth.decodeToken(localStorage.getItem('token'));
  //普通聊天记录
  msgList = new Array<Message>();
  //协同聊天记录
  cooperativeMsgList = new Array<Message>();
  //订阅链接释放部分
  getSendTypeConnection
  SingleMessageConnection;
  UnreadTopicConnection;
  MsgErrorConnection;
  retunmessagereadConnection;

  //团队成员
  userList = new Array<any>();
  defultUserLogo?: any = "./assets/images/Neo_48px.png";//./assets/images/head.png
  //定义emoji
  //public eventMock;

  public direction = Math.random() > 0.5 ? (Math.random() > 0.5 ? 'top' : 'bottom') : (Math.random() > 0.5 ? 'right' : 'left');
  //public toggled = false;

  inputpos: number = 0;

  //private _lastCaretEvent: CaretEvent;
  constructor(
    private ngRecux: NgRedux<IAppState>,
    private el: ElementRef,
    private acRoute: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private auth: AuthenticateService,
    private chatcommonService: ChatcommonService,
    private groupService: GroupService,
    private sanitization: DomSanitizer,
    private emojiPickerOptions: EmojiPickerOptions,
    private ref: ChangeDetectorRef) {
    this.ref = ref;
    this.emojiPickerOptions.setEmojiSheet({
      url: './sheet_apple_32.png',
      locator: EmojiPickerAppleSheetLocator
    });
  }

  ngOnInit() {
    this.ngRecux.dispatch({
      type: SEND_MESSAGE,
      topicid: 123,
      message: { hello: 'hello' }

    });
    // console.log('消息页面初始化');
    window.onresize = function resetHeight() {
      var h = $(".right-top-panel").height();
    };
    //获取团队成员
    this.groupService.getGroupMember(this.chatRoom.groupid)
      .subscribe(data => {
        if (data.isSuccess && data.data != null) {
          var users = data.data.filter(f => f.id != this.currentUser.id);
          Array.prototype.push.apply(this.userList, users);
        }
      }
      );

    //更新当前会话，当前用户身份，目前可能不需要
    this.getSendTypeConnection = this.messageService.getSendType().subscribe(sendtype => {
      if (sendtype != null)
        this.currentSendtype = sendtype;
    });

    //订阅单个消息
    this.SingleMessageConnection = this.messageService.getSingleMsg().subscribe(message => {
      console.log(message);
      this.chatcommonService.getLocalMessage(this.chatRoom.id).then(d => {
        console.log(d);
        var msgs = d.filter(f => f.sendtype != 3 && f.sendtype != 5);
        console.log(msgs);
        this.msgList = this.quickSort(msgs, "createdAt", false);
        console.log(this.msgList);
        var cooperativemsg = d.filter(f => f.sendtype == 3 || f.sendtype == 5);
        this.cooperativeMsgList = this.quickSort(cooperativemsg, "createdAt", false);
        //this.cooperativeMsgList = cooperativemsg
        this.ref.markForCheck();
        this.ref.detectChanges();
        this.scrollToBottom();
      });
    });
    console.log(this.SingleMessageConnection);

    //订阅错误消息，（消息发送失败，提示当前用户）
    this.MsgErrorConnection = this.messageService.sendMsgError().subscribe(errorMsg => {

    })
    //
    this.retunmessagereadConnection = this.messageService.retunmessageread().subscribe(data => {
      console.log('消息已读，订阅执行');
    })
    //调用
    $(".msg-container-base").resize(function () {
      // 当id为main的div大小变化时的处理函数写在这里.....
      // 当然了#main只不过是id选择器，你也可以换成任何jquery的选择器......
      console.log($(this).scrollTop());
      console.log($(this).prop('scrollHeight'));
      $(this).scrollTop($(this).prop('scrollHeight'));
    });

    //初始化设置当前容器滚动条位置为最低部

    $(".msg-container-base").bind('DOMNodeInserted', function (e) {
      $(this).scrollTop($(this).prop('scrollHeight'));
    });

    console.log(this.messageService.socket);
  }
  ngOnChanges() {
    console.log("current Topic Id:" + this.chatRoom.id);
    //设置会话ID
    this.messageService.setTopic(this.chatRoom);
    this.currentSendtype = this.chatRoom.Sendtype;
    this.messageSendtype = this.chatRoom.Sendtype;
    if (this.UnreadTopicConnection) {
      this.UnreadTopicConnection.unsubscribe();
    }
    //订阅当前会话所有未读消息，每次变更都执行此订阅
    this.UnreadTopicConnection = this.messageService.getUnreadTopicMsgs()
      .subscribe(message => {
        console.log('sssss');
        this.chatcommonService.getLocalMessage(this.chatRoom.id).then(d => {
          console.log(d);
          var msgs = d.filter(f => f.sendtype != 3 && f.sendtype != 5);
          console.log(msgs);
          this.msgList = this.quickSort(msgs, "createdAt", false);
          console.log(this.msgList);
          var cooperativemsg = d.filter(f => f.sendtype == 3 || f.sendtype == 5);
          this.cooperativeMsgList = this.quickSort(cooperativemsg, "createdAt", false);
          this.ref.markForCheck();
          this.ref.detectChanges();
          this.scrollToBottom();
        });
      });
    //每次变更清空消息
    this.msgList = new Array<Message>();
    this.cooperativeMsgList = new Array<Message>();
    //先获取本地消息，只执行一次
    this.chatcommonService.getLocalMessage(this.chatRoom.id).then(data => {
      var msgs = data.filter(f => f.sendtype != 3 && f.sendtype != 5);
      Array.prototype.push.apply(this.msgList, this.quickSort(msgs, "createdAt", false));
      var cooperativemsg = data.filter(f => f.sendtype == 3 || f.sendtype == 5);
      Array.prototype.push.apply(this.cooperativeMsgList, this.quickSort(cooperativemsg, "createdAt", false));
      console.log(this.msgList);
      this.scrollToBottom();
      //通知server获取会话未读消息
      this.messageService.getUnreadTopic();
    });
    console.log(this.messageService.socket);
  }

  ngOnDestroy() {
    //离开会话
    this.messageService.userleaveroom();
    var topicEmpty = new Topic();
    //设置为空会话ID为0
    this.messageService.setTopic(topicEmpty);
    this.ref.detach(); // try this
    this.getSendTypeConnection.unsubscribe();
    this.SingleMessageConnection.unsubscribe();
    this.UnreadTopicConnection.unsubscribe();
    this.MsgErrorConnection.unsubscribe();
    this.retunmessagereadConnection.unsubscribe();
    console.log(this.SingleMessageConnection);
    // 取消服务端的订阅
    //this.messageService.unSubscribeSocket('postunreadmsg');

  }

  reGenerateImgSrc(data) {
    return Object.assign({}, data, { src: fileurl + data.Content })
  }
  ngAfterViewInit() {

    $(function () {
      $.contextMenu({
        selector: '.myMsgMenu',
        callback: function (key, options) {
          console.dir(options.$trigger[0]);
          var msgId = $(options.$trigger[0]).attr("msgId");
          console.log(options.$trigger[0].textContent.trim());
          var m = "clicked: " + key + "&&id:" + msgId;
          window.console && console.log(m) || alert(m);
        },
        items: {
          "edit": { name: "Edit", icon: "edit" },
          "cut": { name: "Cut", icon: "cut" },
          copy: { name: "Copy", icon: "copy" },
          "paste": { name: "Paste", icon: "paste" },
          "delete": { name: "Delete", icon: "delete" },
          "sep1": "---------",
          "quit": {
            name: "Quit", icon: function () {
              return 'context-menu-icon context-menu-icon-quit';
            }
          }
        }
      });
    });


  }
  // 滾動當前頁面到數據
  scrollToBottom(): void {
    //  const scrollPane: any = this.el.nativeElement.querySelector('.msg-container-base');
    //     console.log(this.el.nativeElement.querySelector('.msg-container-base'));
    //       console.log(scrollPane.scrollTop);
    //       console.log(scrollPane.scrollHeight);
    //     scrollPane.scrollTop = scrollPane.scrollHeight;
    //     console.log(scrollPane.scrollTop);
    //     console.log(scrollPane.scrollHeight);
  }



  //根据数据库Blob数据，转图片数据
  getUserLogoString(filepath) {
    if (filepath != null) {
      return fileurl + filepath;
    }
    else {
      return this.defultUserLogo;
    }
  }
  //修改当前发送消息类型
  changeMessageSendtype(sendtype: number) {


    let divEle = this.el.nativeElement.querySelector('#editable');
    divEle.innerHTML = '';
    console.log(sendtype);
    this.messageSendtype = sendtype;

    const scrollPane: any = this.el.nativeElement.querySelector('.msg-container-base');
    console.log(scrollPane);
    console.log('scrollHeight', scrollPane.scrollHeight);
    scrollPane.scrollTop = scrollPane.scrollHeight;
    console.log('scrollTop', scrollPane.scrollTop);

    var scroll = $(".msg-container-base");
    var scr_h = scroll.height();
    console.log(scr_h);
    if (sendtype == 2) {
      $($('#editable').eq(0)).atwho('destroy') // 初始化
      $("#team").css("display", "none");
      $("#customer").css("display", "block");
      scroll.height(scr_h + 1);
    }
    else if (sendtype == 3) {
      $("#team").css("display", "block");
      $("#customer").css("display", "none");
      scroll.height(scr_h - 1);
      var users = $.map(this.userList, function (user, i) {
        return { 'id': user.id, 'name': user.name == null ? user.account : user.name };
      });
      var atAll = { 'id': 0, 'name': 'All' };
      if (this.currentSendtype == 2) {
        //新增追加到索引第一个
        users.splice(0, 0, atAll);
      }
      var at_config = {
        at: "@",                              // 这个是触发弹出菜单的按键
        data: users,                     // 这里是源码中封装的一个AJAX   可以是绝对路径相对路径  我这里是一段模拟的JSON
        insertTpl: '<span class="inputor_span" data-id="${id}">@${name}</span>',       //你的dom结构里显示的内容  你可以给span加样式  绑定id
        displayTpl: "<li > ${name} </li>",                       // 这个是显示的弹出菜单里面的内容 
        limit: 200
      };

      $($('#editable').eq(0)).atwho(at_config) // 初始化 
    }

  }
  //管理员指派客服
  assignSelect() {
    var assignRadios = $('input:radio[name=assignRadio]:checked');
    //目前指派给一个客服
    if (assignRadios.length > 0) {
      var userid = $(assignRadios[0]).val();
      this.messageService.postAssignOrder(userid);
      $('#bill').modal('hide');
    }
    else {
      alert('没有选中项');
    }
  }
  getpos() {
    this.inputpos = $($('#editable').eq(0)).caret('pos');
    console.log(this.inputpos + '&&' + $('#editable').caret('pos'));
  }
  //发送文本消息
  send() {
    //,keycode?: any
    let divEle = this.el.nativeElement.querySelector('#editable');
    //查看属性
    console.dir(divEle);
    var message = divEle.textContent;
    console.log((message));
    var usershtml = $(divEle).find('.inputor_span');
    usershtml.each(function (i, e) {
      console.log($(e).attr("data-id"));
    })

    if (message != '') {
      console.log(message + '&&&' + this.messageSendtype);
      //只有在协作时，查询@
      if (this.messageSendtype == 3 && usershtml.length > 0) {
        var userid = $(usershtml[0]).attr("data-id");
        console.log(userid);
        if (userid == 0) {
          console.log('@所有人');
        }
        else {
          this.messageService.sendAtMessage(message, this.messageSendtype, userid);
        }

      }
      else {
        this.messageService.sendMessage(message, this.messageSendtype);
      }
      divEle.innerHTML = '';
      console.log(this.SingleMessageConnection);
    }
    else {
      console.log('信息为空');
    }

  }

  //客服关闭服务
  closeService() {
    this.messageService.closeService();
  }

  //客户确认关闭
  confirmService() {
    this.messageService.confirmService();
  }

  //客户重新打开服务
  customerOpenService() {
    this.messageService.customerOpenService();
  }
  //客服确定接单
  OrderReceiving() {
    console.log('接单');
    this.messageService.OrderReceiving();
  }
  //排序
  quickSort(arr, name, snum) {
    //如果数组<=1,则直接返回
    if (arr.length <= 1) { return arr; }
    var pivotIndex = Math.floor(arr.length / 2);
    //找基准，并把基准从原数组删除
    var pivot = arr.splice(pivotIndex, 1)[0];
    var middleNum = pivot[name];
    // 定义左右数组
    var left = [];
    var right = [];
    //比基准小的放在left，比基准大的放在right
    if (snum) {
      for (var i = 0; i < arr.length; i++) {
        if (Number(arr[i][name]) <= Number(middleNum)) {
          left.push(arr[i]);
        } else {
          right.push(arr[i]);
        }
      }
    } else {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i][name] <= middleNum) {
          left.push(arr[i]);
        } else {
          right.push(arr[i]);
        }
      }
    }
    //递归,返回所需数组
    return this.quickSort(left, name, snum).concat([pivot], this.quickSort(right, name, snum));
  }


  handleSelection(event: EmojiEvent) {

    let divEle = this.el.nativeElement.querySelector('#editable');
    //查看属性
    console.dir(divEle);
    var message = divEle.textContent;
    divEle.textContent = message.slice(0, this.inputpos) + event.char + message.slice(this.inputpos);
    this.inputpos = this.inputpos + 2;
  }
  //处理文件拖拽上传的功能
  dropfile(event) {
    event.preventDefault();
    var file = event.dataTransfer.files[0];
    console.log(this.getFile(file).then(data => {
      console.log(data);
      this.messageService.sendFileMessage(data, this.messageSendtype);
    }
    ));
    // 此处可发送文件消息；

  }
  dragfile(event) {
    event.preventDefault();
  }
  // 获取文件Blob
  private getFile(file) {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onload = function (event: any) {
        var rtn = {
          data: event.target.result,
          ext: file.name.split('.').pop(),
          name: file.name,
          id: uuid()
        }
        resolve(rtn);
      };
      reader.readAsDataURL(file);
    })

  }
  selectFile(event) {
    console.log('clicked');
    console.log(this.tfile.nativeElement.click());
  }
  //LOGO上传控件，此处只展示上传图片，未保存
  fileChange(event) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.getFile(fileList[0]).then(data => {
        console.log(data);
        this.messageService.sendFileMessage(data, this.messageSendtype);
      })
    }
  }
  downloadAndOpen(url, name, fileid) {
    console.log('file download')
    //electron.ipcRenderer.send('download-file', url, name, fileid);
  }

}
