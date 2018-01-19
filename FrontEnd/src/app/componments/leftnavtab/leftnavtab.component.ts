import { Component, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { environment } from '../../../environments/environment'

declare var $: any;
@Component({
  selector: 'app-leftnavtab',
  templateUrl: './leftnavtab.component.html',
  styleUrls: ['./leftnavtab.component.css']
})
export class LeftnavtabComponent implements OnInit {

  prod:boolean=environment.production;
  constructor() { }

  ngOnInit() {
    $("li").click(function (e) {
      $(this).addClass("active");
      $(this).siblings().removeClass('active');
      $(this).parents(".left-nav").siblings(".left-nav").find("li").removeClass('active');

    });

  }

}
