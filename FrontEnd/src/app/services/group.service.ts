import { Injectable } from '@angular/core';
import { AuthHttp, JwtHelper } from 'angular2-jwt';
import { Http, Response, RequestOptionsArgs } from '@angular/http'
import { url } from '../config/config'
import { AuthenticateService } from './authenticate.server';
@Injectable()
export class GroupService {

  constructor(private authService: AuthenticateService, public authHttp: AuthHttp, public http: Http) {
    //this.authHttp.post()

  }
  createGroup(data, id) {
    //console.log(data);
    if (id == 0) {
      return this.authHttp.post(url + "/api/group/add", data).map(res => res.json());
    }
    else {
      return this.authHttp.post(url + "/api/group/update", data).map(res => res.json());
    }

  }
  getGroupByName(name) {
    return this.authHttp.get(url + "/api/group/getbyname" + "?name=" + name)
      .map(res => res.json());
  }
  getGroupById(id) {
    //console.log('getGroupById');
    return this.authHttp.get(url + "/api/group/getbyid" + "?id=" + id)
      .map(res => res.json());
  }
  getMyGroup() {
    return this.authHttp.get(url + "/api/group/getMyGroup")
      .map(res => res.json());
    // .subscribe(data=>{
    //   console.log(data);
    // });
  }
  //获取所有用户
  getAllMember() {
    return this.authHttp.get(url + "/api/user/all")
      .map(res => res.json());
  }
  //获取当前组下的成员
  getGroupMember(groupid) {
    //console.log('getGroupMember');
    return this.authHttp.get(url + "/api/groupuser/allmember?groupid=" + groupid)
      .map(res => res.json());
  }
  //获取所有组
  getAllGroup() {
    return this.authHttp.get(url + "/api/group/getAllGroup")
      .map(res => res.json());
  }

  //获取通讯录
  getContact(userid) {
    return this.authHttp.post(url + "/api/contact/getinfobyid", { 'id': userid })
      .map(res => res.json());
  }

  //获取会话
  getTopic(groupid) {
    var token = localStorage.getItem('token');
    if (token != null) {
      var tokendata: any = this.authService.decodeToken(token);
      //console.log(tokendata);
      console.log('userid:' + tokendata.id + "&&groupid:" + groupid);
      return this.authHttp.post(url + "/api/topic/addtopic", { 'userid': tokendata.id, 'groupid': groupid })
        .map(res => res.json());
    }
    else {
      return null;
    }
  }
  deleteGroup(groupid) {

    return this.authHttp.delete(url + "/api/group/delete", {
      body: {
        id: groupid
      }
    }).flatMap(n => this.getMyGroup());

  }
  // getFile(filepath)
  // {
  //   const headers = new Headers();
  //   headers.append('Access-Control-Allow-Headers', 'Content-Type');
  //   headers.append('Access-Control-Allow-Methods', 'GET');
  //   headers.append('Access-Control-Allow-Origin', '*');
  //   let options = new RequestOptionsArgs.({ headers: headers });
  //   return this.authHttp.get(filepath,{headers: headers});
  // }
}
