
import { Component, OnInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { GroupService } from '../../../services/group.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { validateConfig } from '@angular/router/src/config';
import { Buffer } from 'buffer';
import { BlockingProxy } from 'blocking-proxy/built/lib/blockingproxy';
import { AuthenticateService } from '../../../services/authenticate.server';
import { Group } from '../../../modules/group';
import { AuthHttp, JwtHelper } from 'angular2-jwt';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { isNgTemplate } from '@angular/compiler';
import { user } from '../../../modules/user';
import { DomSanitizer } from '@angular/platform-browser';
import { url, fileurl } from '../../../config/config';
// import { MatDialog } from '@angular/material'
declare var $: any;

@Component({
  selector: 'app-myteam',
  templateUrl: './myteam.component.html',
  styleUrls: ['./myteam.component.css'],
  providers: [GroupService]
})
export class MyteamComponent implements OnInit {
  currentUser = this.auth.decodeToken(localStorage.getItem('token'));
  allUsers = new Array<any>();
  users: Array<any> = this.allUsers;
  //修改之前的成员列表
  oldUsers = new Array<any>();
  //当前选择成员
  currentUsers = new Array<any>();
  defaultLogo?: any = "./assets/images/add.png";
  defultGroupLogo?: any = "./assets/images/Support.png";
  defultUserLogo?: any = "./assets/images/head.png"
  logo?: any = this.defaultLogo;
  nameExists: boolean = false;
  isInviteUser: boolean = false;
  currentgroup = new Group();
  groupList = new Array<any>();
  searchTerms = new Subject<string>();
  @ViewChild("logofile")
  logofile
  constructor(private groupService: GroupService,
    private elem: ElementRef,
    private _fb: FormBuilder,
    private auth: AuthenticateService,
    private sanitization: DomSanitizer) {

  }

  ngOnInit() {
    this.groupService.getAllMember().subscribe(data => {
      if (data.isSuccess) {
        //this.allusers = new Array<any>();
        Array.prototype.push.apply(this.allUsers, data.data);
        console.log(this.users);
        //this.allusers=
      }
    });

    this.getMyGroup();

  }
  //获取当前登陆人管理的所有组
  getMyGroup() {

    this.groupService.getMyGroup().subscribe(data => {
      console.log(data.data[0].creator);
      console.log(data);
      if (data.isSuccess) {
        this.groupList = new Array<any>();
        if (data.data != null)
          Array.prototype.push.apply(this.groupList, data.data);
        console.log('成功');
      }
      else {
        console.log('失败');
      }
    });
  }
  //保存企业事件
  save(event) {
    var postUsers = Array<any>();
    if (this.currentgroup.id != 0) {
      for (var i = 0; i < this.currentUsers.length; i++) {
        var res = this.oldUsers.filter(f => { return f.account === this.currentUsers[i].account });
        //在this.oldUsers不存在，新增
        if (res.length == 0) {
          var d = this.currentUsers[i];
          d.status = 1;//1新增 0 删除
          postUsers.push(d);
        }
      }
      for (var i = 0; i < this.oldUsers.length; i++) {
        var res = this.currentUsers.filter(f => { return f.account === this.oldUsers[i].account });
        //在this.currentUsers不存在，删除
        if (res.length == 0) {
          var d = this.oldUsers[i];
          d.status = 0;//1新增 0 删除
          postUsers.push(d);
        }
      }
    }
    else {
      Array.prototype.push.apply(postUsers, this.currentUsers);
    }

    this.groupService.getGroupByName(this.currentgroup.name).subscribe(data => {
      if (data.data != null && data.data.id != this.currentgroup.id) {
        // 提示已經存在
        this.nameExists = true;
      }
      else {
        var postdata = {
          'id': this.currentgroup.id,
          'group': this.currentgroup,
          'users': postUsers
        };
        console.log(postdata);
        this.groupService.createGroup(postdata, this.currentgroup.id)
          .subscribe(res => {
            console.log(res);
            if (res.isSuccess) {
              this.currentgroup = new Group();
              this.logo = this.defaultLogo;
              this.getMyGroup();
            }
            else {
            }
          });
      }
    });
  }
  //LOGO上传控件，此处只展示上传图片，未保存
  fileChange(event) {
    let fileList: FileList = event.target.files;
    var div = this.elem.nativeElement.querySelector('#logofile');
    if (fileList.length > 0) {
      // 获取Blob 文件
      var file = fileList[0]
      console.log(file);
      if (file.size > 2097152) {
        div.value = "";
        alert("超出文件大小限制2M")
      }
      else {
        var file: File = fileList[0];
        var fileextension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
        //console.log(fileextension);
        let fr = new FileReader();
        fr.onload = (event: any) => {
          // 获取读取的文件内容，Blob 格式。
          //this.fileBlog = fr.result;
          // = new Buffer(fr.result);
          this.logo = fr.result;
          this.currentgroup.avatarsrc = fr.result;
          this.currentgroup.fileExt = fileextension;
          //event.target.result;
          //this.dataURLtoBlob(event.target.result);
        }
        fr.readAsDataURL(file);
      }
    }
  }

  //检查企业名称是否重复
  checkName(value) {
    console.log('查询重复名称');
    //如果非空
    if (this.currentgroup.name != "") {
      this.groupService.getGroupByName(this.currentgroup.name).subscribe(data => {
        if (data.data != null && data.data.id != this.currentgroup.id) {
          // 提示已經存在
          this.nameExists = true;
          console.log(data.data);
        }
        else {
          this.nameExists = false;
        }
      });
    }
  }
  //选择LOGO按钮事件
  changeLogo() {
    console.log(this.logofile);
    this.logofile.nativeElement.click();
    //this.logofile.click();
  }
  //创建组,编辑组
  createGroup(id: number) {
    this.nameExists = false;
    //每次，清空当前成员信息
    this.oldUsers = new Array<any>();
    this.currentUsers = new Array<any>();
    console.log(id);
    if (id === 0) {
      this.currentgroup = new Group();
      this.logo = this.defaultLogo;
    }
    else {
      var group = this.currentgroup;
      this.groupService.getGroupById(id).subscribe(data => {
        if (data.data != null) {
          //console.log(data.data)
          group.id = data.data.id;
          group.name = data.data.name;
          group.companyId = data.data.companyId;
          group.description = data.data.description;
          group.createdAt = data.data.createdAt;
          group.updatedAt = data.data.updatedAt;

          //此属性只做更新头像使用
          group.avatarsrc = null
          group.fileExt = data.data.fileExt;
          group.fileaddress = data.data.fileaddress;
          if (data.data.fileaddress != null) {
            this.logo = fileurl + data.data.fileaddress;
          }
          //获取组下成员列表
          this.groupService.getGroupMember(group.id).subscribe(data => {
            //console.log(data);
            if (data.isSuccess && data.data != null) {
              console.log(data);
              console.log(this.oldUsers);
              console.log(this.currentUsers);
              Array.prototype.push.apply(this.oldUsers, data.data);
              Array.prototype.push.apply(this.currentUsers, data.data);
            }
          });
        }
      });
    }
  }

  //根据数据库Blob数据，转图片数据
  getGroupLogoString(fileaddress) {
    var img: any;
    if (fileaddress != null) {
      img = fileurl + fileaddress;
      //return new Buffer(ImgData.data).toString("utf8");
    }
    else {
      img = this.defultGroupLogo;
    }
    return img;
  }
  //根据数据库Blob数据，转图片数据
  getUserLogoString(fileaddress) {
    if (fileaddress != null) {
      return fileurl + fileaddress;
      //return new Buffer(ImgData.data).toString("utf8");
    }
    else {
      return this.defultUserLogo;
    }
    //return this.defultUserLogo;
  }

  getFileBase64ByFilePath(serverfilepath) {

    //新建图片
    let image = new Image();
    image.src = serverfilepath;

    image.crossOrigin = '*';
    //image.crossOrigin = 'Anonymous';
    //通加载图片完毕保证快速读取
    image.onload = () => {
      var base64 = this.getBase64Image(image);
      console.log(base64);

    }
    image.onerror = function (e) {
      console.dir(e);
    };
  }
  loadImageAsync(url) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () {
        image.crossOrigin = '*';
        resolve(image);
      };
      image.onerror = function () {
        reject(new Error('Could not load image at ' + url));
      };
      image.src = url;
    });
  }
  getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    console.log(img)
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
    console.dir(canvas)
    var dataURL = canvas.toDataURL("image/jpeg");
    console.log(dataURL);
    return dataURL;
  }
  SearchUser(value): void {
    this.isInviteUser = false;
    if (value != null && value != '') {
      console.log(value + '#');
      var result = this.allUsers.filter(u => {
        if (u.name == null || u.name == '') {
          return false;
        }
        else {
          return u.name.toLowerCase().indexOf(value.toLowerCase()) >= 0;
        }
      });
      //console.log(result);
      this.users = result;
      if (result.length > 0) {

        this.isInviteUser = false;
      }
      else {
        //this.users= this.allUsers;
        this.isInviteUser = true;
      }
    }
    else {
      this.users = this.allUsers;
    }
  }
  //选择成员事件
  memberSelect(event: any, item) {
    console.log(item);
    if (event.target.checked == true && !this.checkSelectStatus(item)) {
      this.currentUsers.push(item);
    }
    else {
      console.log(item);
      this.removeByValue(this.currentUsers, item);
    }
  }
  removeMemberSelect(item) {
    console.log(item);
    console.log(this.currentUsers);
    this.removeByValue(this.currentUsers, item);
  }
  checkSelectStatus(item) {
    //console.log(item);
    var isSelect = false;
    //isSelect=this.contains(this.users2,item);
    var res = this.currentUsers.filter(f => f.account === item.account);
    if (res.length > 0) {
      isSelect = true;
    }
    //console.log(isSelect);
    return isSelect;
  }
  removeByValue(arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].account === val.account) {
        arr.splice(i, 1);
        break;
      }
    }
  }
  contains(arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].account === val.account) {
        return true;
      }
    }
    return false;
  }
  delGroup(groupid) {
    // this.groupService.deleteGroup(groupid).subscribe(data => {
    //   this.groupList = new Array<any>();
    //   if (data.data != null)
    //     Array.prototype.push.apply(this.groupList, data.data);
    //   console.log('成功');
    // });
  }
}