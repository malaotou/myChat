import { Injectable } from '@angular/core';
import { AuthHttp, JwtHelper } from 'angular2-jwt';
import { Http, Response } from '@angular/http'
import { url } from '../config/config'
@Injectable()
export class UserService {

    constructor(public authHttp: AuthHttp, public http: Http) {
        //this.authHttp.post()

    }
    register(registerForm) {
        console.log(registerForm);
        return this.authHttp.post(url + "/api/user/register", registerForm
        ).map(res=>  res.json());
    }
}
