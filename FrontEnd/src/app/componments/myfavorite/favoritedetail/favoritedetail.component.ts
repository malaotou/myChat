import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Route,Router } from '@angular/router'
import { DomSanitizer } from '@angular/platform-browser';
import { GroupService } from '../../../services/group.service';
import { ChatcommonService } from '../../../services/chatcommon.service';
import { StorageService } from '../../../services/storage.service';
import { Topic } from '../../../modules/topic';
import { url,fileurl } from '../../../config/config';
@Component({
  selector: 'app-favoritedetail',
  templateUrl: './favoritedetail.component.html',
  styleUrls: ['./favoritedetail.component.css'],
  providers:[StorageService]
})
export class FavoritedetailComponent implements OnInit {

  @Input() company: Array<any>;
  companyInfo:any;
  //没有头像，默认头像
  defultGroupLogo?: any = "./assets/images/Support.png";
  constructor(private router:Router,
              private sanitization: DomSanitizer,
              private groupService:GroupService,
              private chatcommonService:ChatcommonService,
              private storageService:StorageService) {

  }

  ngOnInit() {
    //console.log(this.company);
  }
  ngOnChanges() {
    this.companyInfo =this.company;
    //console.log(this.companyInfo);
  }
  chat(id){

    // 加入当前所选的Room
    // console.log(this.company);
    // console.log(this.company[0].id);
    // this.socketService.joinRoom(this.company[0].id,localStorage.getItem('uname'));
    //this.socketService.joinRoom(room,localStorage.getItem('uname'));
    
    this.groupService.getTopic(id).subscribe(res=>{
      console.log(res);
      if(res.isSuccess)
      {
         var topic=<Topic>res.data
         //var code=topic.code;
         console.log('更新本地存储');
         console.log(topic);
         this.chatcommonService.getUnReadMsgs(topic).then(r=>{
         console.log(topic.id);
          
         //更新本地通讯录
         this.chatcommonService.getContacts(true).then(r=>{
           console.log(r);
          // 跳转到登录页面
          this.router.navigate(['/mychat'], { queryParams: { id: topic.id } });
         });
        })
      }
    });
    

  }
  getGroupLogoString(filepath) {
    if (filepath != null) {
      return fileurl + filepath;
      //return new Buffer(ImgData.data).toString("utf8");
    }
    else {
      return this.defultGroupLogo;
    }
  }

}
