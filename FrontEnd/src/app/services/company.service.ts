import { Injectable } from '@angular/core';
import { AuthHttp, JwtHelper } from 'angular2-jwt';
import { Http, Response } from '@angular/http'
import { url } from '../config/config'
@Injectable()
export class CompanyService {

  constructor(public authHttp: AuthHttp, public http: Http) {
    //this.authHttp.post()

  }
  createCompany(formValue) {
    console.log(formValue);
    return this.authHttp.post(url + "/api/company/add", { 'name': formValue.name, 'desc': formValue.description, 'avatar': formValue.file })
      .subscribe(data => {
        console.log(data);
      })
  }
 

}
