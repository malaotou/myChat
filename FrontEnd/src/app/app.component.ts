import { Component, ViewChild, OnInit, ViewContainerRef, ViewEncapsulation } from '@angular/core';
// import { Overlay  } from 'ngx-modialog';
// import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { Subject, Observable, BehaviorSubject } from 'rxjs'
import { AuthenticateService } from './services/authenticate.server'
import { Router } from '@angular/router';
import { MessageService } from './services/message.service';
import { setInterval } from 'timers';
import { StorageService } from './services/storage.service';
import { Topic } from './modules/topic';
import { ChatcommonService } from './services/chatcommon.service';

declare global {
  interface Window {
    require: any;
  }
}
//const electron = window.require('electron');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  isAuthened: Boolean;
  constructor(private auth: AuthenticateService,
    private router: Router,
    private messageService: MessageService,
    private chatcommonService: ChatcommonService) {
    this.isAuthened = auth.isAuthenticated();
  }
  ngOnInit() {
    // electron.ipcRenderer.on('downloadFinished', id => {
    //   console.log(id);
    // })
    this.auth.getisLogInStatus().subscribe(data => {
      this.isAuthened = data;
      if (this.isAuthened) {
        console.log('执行登陆注册设备');
        //获取未读消息会话列表
        this.messageService.subscribeSocketMessage()
          .subscribe(message => {
            console.log('实时监听未读消息postunreadmsgs');

            var re = <Array<Topic>>message;

            //保存本地之后，通知本地订阅更新
            this.chatcommonService.setUnReadMsgs(re).then(r => {
              //console.log(r);
              this.messageService.unReadMsgs.next(re);
            });
          });
        this.messageService.getSingleMessage();
        this.messageService.postUnreadTopic();
        //登陆成功，注册设备
        this.messageService.registerTopic();
        console.log(this.messageService.socket);
      }
      else {
        this.messageService.socketDisconnect();

      }
    }, err => { console.log(err) })
    console.log('是否登陆：' + this.isAuthened);
    if (this.isAuthened) {
      //获取未读消息会话列表
      this.messageService.subscribeSocketMessage()
        .subscribe(message => {
          console.log('实时监听未读消息postunreadmsgs');

          var re = <Array<Topic>>message;
          //console.log(re);
          //保存本地之后，通知本地订阅更新
          this.chatcommonService.setUnReadMsgs(re).then(r => {
            //console.log(r);
            this.messageService.unReadMsgs.next(re);
          });
        }, err => { console.log(err) });
      this.messageService.getSingleMessage();
      this.messageService.postUnreadTopic();
      //页面刷新重新，注册设备
      this.messageService.registerTopic();
    }
  }

  min() {
    //electron.ipcRenderer.send('window-min');
  }
  max() {
    //electron.ipcRenderer.send('window-max');
  }
  close() {
    //electron.ipcRenderer.send('window-close');
  }

  test() {
    //electron.ipcRenderer.send('download-file', 'http://pic5.nipic.com/20091229/3200045_132337088105_2.jpg', 'laohan.jpg', '12345678');
  }
}
