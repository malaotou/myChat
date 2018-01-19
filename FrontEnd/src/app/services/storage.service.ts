import { Injectable } from '@angular/core';
import * as localforage from "localforage";
import { Subject, BehaviorSubject } from 'rxjs';
import { AuthenticateService } from './authenticate.server'

@Injectable()
export class StorageService {

  topics: Subject<any> = new Subject<any>();
  constructor(private auth: AuthenticateService) { }

  setItem(key: string, value: any) {
    return localforage.setItem(key, value);
  }
  getItem<T>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      localforage.getItem(key).then(data => {
        let value: any = data;
        if (value && value != "undefined" && value != "null") {
          resolve(<T>value);
        }
        resolve(null);
      }).catch(err=>reject(err));
    });
  }
  removeItem(key: string) {
    return localforage.removeItem(key);
  }

  // setItem(key: string, value: any) {
  //   return localForage.setItem(key, value);
  // }
  // getItem<T>(key: string): T {
  //   let value: any = localForage.getItem(key);
  //   if (value && value != "undefined" && value != "null") {
  //       return <T>value;
  //   }
  //   return null;
  // }
  // removeItem(key:string)
  // {
  //   return localForage.removeItem(key);
  // }
}
