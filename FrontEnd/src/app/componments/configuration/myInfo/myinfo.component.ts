import { Component, OnInit, ElementRef } from '@angular/core';
import { ApiServiceService } from '../../../services/api-service.service';
import { user } from '../../../modules/user';
import { AuthenticateService } from '../../../services/authenticate.server'
import { AuthHttp, JwtHelper } from 'angular2-jwt';
import { url, fileurl } from '../../../config/config'
import { DomSanitizer } from '@angular/platform-browser';
import { userInfo } from 'os';

declare var $: any;
@Component({
    selector: 'my-info',
    templateUrl: 'myinfo.component.html',
    styleUrls: ['myinfo.component.css'],
    providers: [ApiServiceService]

})
export class MyinfoComponment implements OnInit {
    defultUserLogo?: any = "../../assets/images/myhead.png"
    avator?: any = this.defultUserLogo;
    model = new user();
    baseurl = url;
    Account = this.auth.decodeToken(localStorage.getItem('token')).account;
    UserID = this.auth.decodeToken(localStorage.getItem('token')).id;
    genderList: any = [
        { id: 0, name: '男' },
        { id: 1, name: '女' }
    ];
    constructor(public authHttp: AuthHttp, private elem: ElementRef, private api: ApiServiceService, private auth: AuthenticateService
        , private sanitization: DomSanitizer) { }
    ngOnInit() {

        this.getUserInfo(this.Account);

    }
    getUserInfo(account: string) {
        var userinfo = this.model;
        console.log(account);
        this.authHttp.post(this.baseurl + '/api/user/getuserinfobyaccount', { 'account': account })
            .map(res => res.json())
            .subscribe(data => {
                console.log(data);
                if (data.isSuccess) {
                    var d = data.data;
                    userinfo.id = d.id;
                    userinfo.name = d.name;
                    userinfo.nickname = d.nickname;
                    userinfo.account = d.account;
                    userinfo.gender = d.gender;
                    userinfo.fileaddress = d.fileaddress;
                    userinfo.fileExt = d.fileExt;
                    if (d.fileaddress != null) {
                        this.avator = fileurl + d.fileaddress;
                    }
                }
                else {
                }

            });
        //return u;
    }
    //根据数据库Blob数据，转图片数据
    getUserLogoString(filepath: string) {
        if (filepath.indexOf(fileurl) > 0) {
            return filepath;
        }
        else if (filepath != this.defultUserLogo) {
            return filepath;
        }
        else {
            return this.defultUserLogo;
        }
    }
    fileChange(event) {
        let fileList: FileList = event.target.files;
        var div = this.elem.nativeElement.querySelector('#file');
        if (fileList.length > 0) {
            // 获取Blob 文件
            var file = fileList[0]
            if (file.size > 2097152) {
                div.value = "";
                alert("超出文件大小限制2M")
            }
            else {
                var file: File = fileList[0];
                var fileextension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
                let fr = new FileReader();
                fr.onload = (event: any) => {

                    this.authHttp.post(this.baseurl + '/api/user/updateavatarsrc', { 'id': this.UserID, "avatarsrc": fr.result, "fileExt": fileextension })
                        .map(res => res.json())
                        .subscribe(data => {
                            console.log(data);
                            if (data.isSuccess) {
                                // var userinfo = this.model;
                                this.avator = fr.result;
                            }
                            else {
                                alert("修改头像失败");
                            }
                        });
                }
                fr.readAsDataURL(file);
            }
        }
    }
    save() {
        this.authHttp.post(this.baseurl + '/api/user/updateinfo', { 'id': this.model.id, 'account': this.model.account, 'name': this.model.name, 'nickname': this.model.nickname, 'gender': this.model.gender })
            .map(res => res.json())
            .subscribe(data => {
                console.log(data);
                if (data.isSuccess) {
                    //localStorage.removeItem("token");
                    //this.router.navigate(['/login']);     
                    $(".myinfo-content").find("span").css("display", "inline-block");
                    $("#btnEdit").css("display", "inline-block");
                    $(".edit-show").css("display", "none");
                }
                else {
                    alert("修改失败");
                }

            });
        //alert(s);
    }
    //切换当前为编辑模式，显示输入框
    editClick() {
        $(".myinfo-content").find("span").css("display", "none");
        $("#btnEdit").css("display", "none");
        $(".edit-show").css("display", "inline-block");
    }

}