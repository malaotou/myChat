import { Component, OnInit, OnDestroy } from '@angular/core';
import { GroupService } from '../../services/group.service'
import { Group } from '../../modules/group';
import { DomSanitizer } from '@angular/platform-browser';
import { StorageService } from '../../services/storage.service'
import { url, fileurl } from '../../config/config';
import { ChatcommonService } from '../../services/chatcommon.service';
declare var $: any;
@Component({
  selector: 'app-mycontact',
  templateUrl: './mycontact.component.html',
  styleUrls: ['./mycontact.component.css'],
  providers: [GroupService, StorageService]
})
export class MycontactComponent implements OnInit {
  allCompanys = new Array<Group>();
  companys = new Array<Group>();
  currentitem: any;
  isActive: boolean;
  defultGroupLogo?: any = "./assets/images/Support.png";
  constructor(private groupService: GroupService, private storageService: StorageService, private sanitization: DomSanitizer,private chatcommonService:ChatcommonService) { }

  ngOnInit() {

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

    this.chatcommonService.getContacts().then(data => {
      if (data != null) {
        Array.prototype.push.apply(this.allCompanys, data);
        Array.prototype.push.apply(this.companys, data);
      }

    })

  }
  ngOnDestroy() {

  }
  //根据数据库Blob数据，转图片数据
  getGroupLogoString(filepath) {
    if (filepath != null) {
      return fileurl + filepath;
      //return new Buffer(ImgData.data).toString("utf8");
    }
    else {
      return this.defultGroupLogo;
    }
  }
  getCompanyDetail(id: number) {
    console.log(id);
    this.currentitem = this.companys.filter(item => { return item.id === id });
    console.log(this.currentitem);
  }
  search(value: any) {
    // if(value!=''){
    //   this.companys=this.companys.filter(item=>{return item.id===value});
    //   this.currentitem=Companys.filter(item=>{return item.id===value});
    // }
    // else{
    //   this.companys=Companys;
    // }

    //this.currentitem = [];
    if (value != null && value != '') {
      console.log("搜索:" + value);
      var result = this.allCompanys.filter(c => {
        if (c.name == null || c.name == '') {
          return false;
        }
        else {
          return c.name.indexOf(value) >= 0;
        }
      });
      console.log(result);
      if (result.length > 0) {
        var s = new Array<Group>();
        s.push(result[0]);
        this.currentitem = s;
      }
      else {
        this.currentitem = [];
      }
      this.companys = result;
    }
    else {
      // var s = new Array<Group>();
      // s.push(this.allCompanys[0]);
      // this.currentitem = s;
      console.log("搜索2:" + value);
      this.companys = this.allCompanys;
    }

  }
}
