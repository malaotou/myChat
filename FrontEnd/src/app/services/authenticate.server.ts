import { Injectable } from '@angular/core'
import { AuthHttp, JwtHelper, tokenNotExpired } from 'angular2-jwt';
import { Router, CanActivate } from '@angular/router'
import { Subject, BehaviorSubject } from 'rxjs'
@Injectable()
export class AuthenticateService {
    public _isAuthed: Subject<Boolean>;

    constructor(private router: Router, private jwthelper: JwtHelper) {
        this._isAuthed = new Subject<Boolean>();
    }


    broadcast(value: boolean) {
        this._isAuthed.next(value);
    }

    getisLogInStatus() {
        return this._isAuthed.asObservable();
    }

    public isAuthenticated(): boolean {
        let rtn = false
        var token = localStorage.getItem('token')
        if (token != undefined) {

            //check token
            // var jwtHelper= new JwtHelper();
            // var decodeToken= jwtHelper.decodeToken(token);
            // var expireDate = jwtHelper.getTokenExpirationDate(token);
            // console.log("decodeToken");
            // console.log(expireDate);
            // 检测Token 是否过期
            // if(!jwtHelper.isTokenExpired(token))
            // {                      
            //     rtn=true;
            // }
            // {
            //     console.log('redirect')
            // }
            return true;
        }
        else {
            console.log('not login no token')
            //this.router.navigate(['/login']);
            return false;
        }
        //return rtn;
    }
    public decodeToken(token: any): any {
        if (tokenNotExpired())
            return this.jwthelper.decodeToken(token);
        else return null;
    }
    public getUserInfo(token: any): any {
    }
}