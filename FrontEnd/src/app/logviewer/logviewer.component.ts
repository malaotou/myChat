import { Component, OnInit } from '@angular/core';
import { MessageService } from '../services/message.service';
@Component({
  selector: 'app-logviewer',
  templateUrl: './logviewer.component.html',
  styleUrls: ['./logviewer.component.css']
})
export class LogviewerComponent implements OnInit {
  messages: Array<any> = [];
  messagesShow: Array<any> = [];
  constructor(private messageService: MessageService) { }

  ngOnInit() {
    // this.messageService.getLogMessage().subscribe(data => {
    //   // console.log(data);
    //   // this.messagesShow=this.messages.reverse();
    //   // this.messagesShow.push(data);
    //   // this.messages=this.messagesShow.reverse();
    //   this.messages.push(data);
    // });
  }

}
