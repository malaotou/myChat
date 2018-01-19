import { Component, OnInit,Input } from '@angular/core';
import { url } from   '../../../config/config'
import { AuthHttp,JwtHelper } from 'angular2-jwt';
import { Http,Response} from '@angular/http'
import 'rxjs/Rx';
import {Md5} from "ts-md5/dist/md5";
import { AuthenticateService} from '../../../services/authenticate.server'
import { Router } from '@angular/router'

@Component({
  selector: 'app-change-pwd',
  templateUrl: './change-pwd.component.html',
  styleUrls: ['./change-pwd.component.css']
})
export class ChangePwdComponent implements OnInit {
  //Account= this.auth.decodeToken(localStorage.getItem('token')).account;
  userid= this.auth.decodeToken(localStorage.getItem('token')).id;
  model=new UserChangePwd(this.userid,null,null,null,null);
  baseurl=url;
  jwtHelper:JwtHelper=new JwtHelper();
  constructor(public authHttp:AuthHttp, private router: Router,public http:Http,private auth:AuthenticateService) { }
  ngOnInit() {
    console.log(this.auth.decodeToken(localStorage.getItem('token')));
  }
 onChangePwd()
 {
   //alert(JSON.stringify(this.model));
   //alert(Md5.hashStr('123456'));
   
   var oldpwd=Md5.hashStr(this.model.OldPwd);
   var newpwd=Md5.hashStr(this.model.NewPwd);
   console.log('开始',url);
   
   this.authHttp.post(this.baseurl+'/api/user/updatepwd',{'id':this.model.UserID,'oldpassword':oldpwd,'password':newpwd})
   .map(res=>  res.json())
   .subscribe(data=>{
     console.log(data);
     if(data.isSuccess)
     {
      localStorage.removeItem("token");
      this.router.navigate(['/login']);      

     }
     else{
       alert("修改失败");
     }

    });
   //console.log('结束');

 }
}
export class UserChangePwd{
  constructor(
    public UserID:number,
    public Account:string,
    public OldPwd: string,
    public NewPwd: string,
    public Pwd2: string
  ) {  }
}
