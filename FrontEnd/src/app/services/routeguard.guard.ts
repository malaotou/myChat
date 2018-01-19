import { Injectable } from '@angular/core';
import {  Router } from '@angular/router'
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthenticateService } from './authenticate.server'


@Injectable()
export class RouteGuard implements CanActivate {
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if(this.auth.isAuthenticated())
      {
        return true;
      }
      
      else{
        this.router.navigate(['/login']);
        return false;
      }
  }
  constructor(private auth:AuthenticateService,private router:Router){
  }
}
