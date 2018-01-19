import { Component, OnInit, ElementRef } from '@angular/core';
import { GroupService } from '../../services/group.service';
import { Group } from '../../modules/group';
import { DomSanitizer } from '@angular/platform-browser';
import { url, fileurl } from '../../config/config';
import { validateConfig } from '@angular/router/src/config';

declare var $: any;
@Component({
  selector: 'app-myfavorite',
  templateUrl: './myfavorite.component.html',
  styleUrls: ['./myfavorite.component.css'],
  providers: [GroupService]
})
export class MyfavoriteComponent implements OnInit {
  //companys:Array<any>;
  companys = new Array<Group>();
  currentitem: any;
  allCompanys = new Array<Group>();
  isActive: boolean;
  //默认头像
  defultGroupLogo?: any = "./assets/images/Support.png";
  constructor(private groupService: GroupService, private sanitization: DomSanitizer) { }
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


    this.groupService.getAllGroup().subscribe(data => {
      console.log(data);
      if (data.data != null) {
        //console.log("0");
        var result = <Array<Group>>data.data;
        //console.log(data.data[0].name);
        Array.prototype.push.apply(this.allCompanys, result);
        Array.prototype.push.apply(this.companys, result);
      }
    });

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
  //根据ID获取详情
  getCompanyDetail(id: number) {

    this.currentitem = this.companys.filter(item => { return item.id === id });

  }
  //输入关键字搜索
  search(value: any) {
    this.currentitem = [];
    if (value != null && value != '') {
      var result = this.allCompanys.filter(c => {
        if (c.name == null || c.name == '') {
          return false;
        }
        else {
          return c.name.toLowerCase().indexOf(value.toLowerCase()) >= 0;
        }
      });
      console.log(result);
      if (result.length > 0) {
        var sh = new Array<Group>();
        console.log(sh);
        sh.push(result[0]);
        this.currentitem = sh;

      }
      else {
        this.currentitem = [];
      }
      this.companys = result;
    }
    else {
      var sh = new Array<Group>();
      sh.push(this.allCompanys[0]);
      this.currentitem = sh;
      this.companys = this.allCompanys;
    }

  }

}
