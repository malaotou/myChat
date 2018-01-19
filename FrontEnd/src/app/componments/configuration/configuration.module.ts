import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangePwdComponent } from './change-pwd/change-pwd.component';
import { MemberComponent } from './member/member.component';
import { MyinfoComponment } from './myInfo/myinfo.component';
import { MyteamComponent } from './myteam/myteam.component'
import { ConfigurationComponent } from './configuration.component';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  declarations: [
    ChangePwdComponent,
    MemberComponent,
    MyinfoComponment,
    ConfigurationComponent,
    MyteamComponent,
  ]
})
export class ConfigurationModule { }
