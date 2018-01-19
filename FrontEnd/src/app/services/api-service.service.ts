import { Injectable } from '@angular/core';
import { AuthHttp,JwtHelper } from 'angular2-jwt';
import { Http,Response} from '@angular/http'
import { user} from '../modules/user'
import { url } from   '../config/config'
import 'rxjs/Rx';
@Injectable()
export class ApiServiceService {
  
  baseurl=url;
  jwtHelper:JwtHelper=new JwtHelper();
  constructor(public authHttp:AuthHttp,public http:Http) { }
  thing:any;
  getData(){
    return this.authHttp.get(this.baseurl+'api/user')
    .map((data:Response)=>{ 
        let token= data.json() && data.json().id
        if(token){
          return data.json();
        }
    });                   
                         
  }
  login(u:user)  {
    return this.http.post(this.baseurl+"/api/user/login",u)
    .map( res=>res.json());
  }
  register(){
    return this.authHttp.post(this.baseurl+'/api/user/register',{'fdsa':''})
            .map(res=>  res.json())
            .subscribe(data=>console.log(data));
  }

  userReg(u:user){
    console.log(u);
    return this.authHttp.post(this.baseurl+'/api/company/add',{'id':123,'user':u},)
      .map(res=>res.json())
      .subscribe(data=>console.log(data));
  }
}
