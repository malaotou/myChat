import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Route, Router } from '@angular/router'
import { DomSanitizer } from '@angular/platform-browser';
import { GroupService } from '../../../services/group.service';
import { ChatcommonService } from '../../../services/chatcommon.service';
import { Topic } from '../../../modules/topic';
import { url, fileurl } from '../../../config/config';

@Component({
  selector: 'app-contactdetail',
  templateUrl: './contactdetail.component.html',
  styleUrls: ['./contactdetail.component.css'],
  providers: []
})
export class ContactdetailComponent implements OnInit {
  @Input() company: Array<any>;
  companyInfo: any;
  defultGroupLogo?: any = "./assets/images/Support.png";
  constructor(private router: Router,
    private sanitization: DomSanitizer,
    private groupService: GroupService,
    private chatcommonService: ChatcommonService) {

  }

  ngOnInit() {
    //console.log(this.company);
  }
  ngOnChanges() {
    this.companyInfo = this.company;
    //console.log(this.companyInfo);
  }
  //发送消息事件
  chat(id) {
    //  1、获取本地消息
    //  2、跳转到对应的链接,with 参数
    this.groupService.getTopic(id).subscribe(res => {
      if (res.isSuccess) {
        var topic = <Topic>res.data
        this.chatcommonService.getUnReadMsgs(topic).then(r => {
          // 跳转到登录页面
          this.router.navigate(['/mychat'], { queryParams: { id: topic.id } });
        })
      }
    });

  }
  //根据数据库Blob数据，转图片数据
  getGroupLogoString(filepath) {
    if (filepath != null) {
      return fileurl + filepath;
    }
    else {
      return this.defultGroupLogo;
    }
  }
}
