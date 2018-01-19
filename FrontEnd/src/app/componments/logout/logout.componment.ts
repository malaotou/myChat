import {Component,OnInit} from '@angular/core'
import { Router } from '@angular/router';
import { AuthenticateService } from '../../services/authenticate.server';
@Component({
    templateUrl:'logout.componment.html',
    styleUrls:['logout.componment.css'],
    selector:'app-logout'
})
export class LogoutComponent implements OnInit{
    constructor(private router:Router,private auth:AuthenticateService){
    }
    ngOnInit(){

    }
    logout(){
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
        this.auth.broadcast(false);
    }
}
