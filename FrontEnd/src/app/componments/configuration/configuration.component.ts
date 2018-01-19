import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticateService } from '../../services/authenticate.server';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {

  constructor(private route:Router,private auth:AuthenticateService) { }

  ngOnInit() {
  }
  logout(){
    this.auth.broadcast(false);
    localStorage.removeItem('token');
    this.route.navigate(['/login']);

  }
}
