import { Component, OnInit,Input } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { MessageService } from '../../../services/message.service';
import { GroupService } from '../../../services/group.service';
var $ = document.querySelector.bind(document);
@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent implements OnInit {

  
  @Input()
  topic;
  constructor(private route: ActivatedRoute,private router:Router,private messageService: MessageService,private groupService:GroupService) { }

  ngOnInit() {
   
  }
}
