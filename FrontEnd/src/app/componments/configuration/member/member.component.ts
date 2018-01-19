import { Component, OnInit,ViewChild,TemplateRef  } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.css']
})
export class MemberComponent implements OnInit {

  users:Array<any>;
  constructor() { }

  ngOnInit() {
  
  }
  openModal(value){

  }
}
