import { Component, OnInit, OnChanges, AfterViewInit } from '@angular/core';
import { Params, Router, ActivatedRoute } from '@angular/router'
import { Topic } from '../../modules/topic';
import { StorageService } from '../../services/storage.service'
import { GroupService } from '../../services/group.service'
import { DomSanitizer } from '@angular/platform-browser';
import { MessageService } from '../../services/message.service';
import { ChatcommonService } from '../../services/chatcommon.service';
import { url, fileurl } from '../../config/config';
declare var $: any;
@Component({
  selector: 'app-mychat',
  templateUrl: './mychat.component.html',
  styleUrls: ['./mychat.component.css'],
  providers: [ StorageService, GroupService, ChatcommonService]
})
export class MychatComponent implements OnInit {
  defultGroupLogo?: any = "./assets/images/Support.png";

  chatTopics = new Array<Topic>();
  currentTopic: Topic;
  currentTopicId: number;
  chatTopicsList = [''];

  chatList: Array<any> = [];
  dic = new Map<number, any>();
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private groupService: GroupService,
    private sanitization: DomSanitizer,
    private messageService: MessageService,
    private chatcommonService: ChatcommonService
  ) { }

  ngOnInit() {
    console.log('zhixing');
    $("#listviwe").height($("body").height() - 62)
    $(window).resize(function () {
      $("#listviwe").height($("body").height() - 62)
    });
    $("#listviwe").mouseover(function (e) {
      $(this).addClass("listviwe");
    })
    $("#listviwe").mouseout(function (e) {
      $(this).removeClass("listviwe");
    })
    this.chatcommonService.getUnReadMsgs(null).then(r => {
      this.chatTopics = r;
      console.log(r);
      //this.currentRoom = r.find(r => r.id == this.currentRoomId);
      //url地址参数变更时,设置本地当前选中会话
      this.route.queryParams.subscribe(item => {
        console.log(item);
        this.currentTopicId = <number>item['id'];
        console.log(this.currentTopicId);
        if (this.currentTopicId != undefined) {
          this.currentTopic = this.chatTopics.find(r => r.id == this.currentTopicId);
        }
        else {
          this.currentTopic = null;
        }
      });
      //订阅未读消息
      this.messageService.getUnReadMsgs().subscribe(msg => {
        this.chatcommonService.getUnReadMsgs(null).then(r => {
          this.chatTopics = r;
        });
      });
      //console.log(this.chatTopics);
    })
  }
  goto(id) {
    this.currentTopic = this.chatTopics.find(r => r.id == id);
    //切换会话，上一次回话需要离开
    this.messageService.userleaveroom();
    this.router.navigate(['/mychat'], { queryParams: { id: id } });
    //this.currentTopicId = id;
  }
  ngAfterViewInit() {
  }
  ngOnChage() {

  }
  //根据数据库Blob数据，转图片数据
  getTopicLogoString(filepath) {
    if (filepath != null) {
      return fileurl + filepath;
    }
    else {
      return this.defultGroupLogo;
    }

  }
  getTheLastMsg(data) {
    console.log(data.text)

  }
  getcurrentRoom(value) {

  }
}
