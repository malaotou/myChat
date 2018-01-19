import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'
import { MycontactComponent } from './mycontact.component';
import { ContactdetailComponent } from './contactdetail/contactdetail.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [
    MycontactComponent,
    ContactdetailComponent,]
})
export class MycontactModule { }
