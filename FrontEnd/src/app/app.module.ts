import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'
import { AppComponent } from './app.component';
import { LeftnavtabComponent } from './componments/leftnavtab/leftnavtab.component'
import { LoginComponment } from './componments/login/login.component'
import { LogoutComponent } from './componments/logout/logout.componment'
import { routing } from './app.routing'
import { RouteGuard } from './services/routeguard.guard';
import { AuthenticateService } from './services/authenticate.server'
import { AuthHttp, AuthConfig, JwtHelper } from 'angular2-jwt';
import { AuthModule } from './services/http/AuthHttp';
import { AccordionModule, AlertModule, ButtonsModule } from 'ngx-bootstrap';
import { EqualValidator } from './componments/configuration/change-pwd/equal-validator.directive'; // 导入验证器

import { NoEqualValidator } from './componments/configuration/change-pwd/noequal-validator.directive';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { GroupService } from './services/group.service';
import { MessageService } from './services/message.service';
import { StorageService } from './services/storage.service';
import { ChatcommonService } from './services/chatcommon.service';
import { LogviewerComponent } from './logviewer/logviewer.component';
/*
  Rect Fact
*/
import { ConfigurationModule } from './componments/configuration/configuration.module';
import { ChatModule } from './componments/mychat/chat.module';
import { ResetpwdModule } from './componments/resetpwd/resetpwd.module';
import { AllteamModule } from './componments/myfavorite/allteam.module';
import { MycontactModule } from './componments/mycontact/mycontact.module';
import { RegisterModule } from './componments/register/register.module';
@NgModule({
  declarations: [
    AppComponent,
    LeftnavtabComponent,
    LoginComponment,
    LogoutComponent,
    EqualValidator,
    NoEqualValidator,
    LogviewerComponent,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    routing,
    AuthModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot({
      timeOut: 1000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    ConfigurationModule,
    ChatModule,
    ResetpwdModule,
    AllteamModule,
    MycontactModule,
    RegisterModule,
  ],
  providers: [
    RouteGuard,
    AuthenticateService,
    JwtHelper,
    GroupService,
    MessageService,
    StorageService,
    ChatcommonService,
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
