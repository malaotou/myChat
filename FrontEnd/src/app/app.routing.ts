import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MycontactComponent } from "./componments/mycontact/mycontact.component";
import { MychatComponent } from './componments/mychat/mychat.component';
import { MyfavoriteComponent } from './componments/myfavorite/myfavorite.component';
import { LoginComponment } from './componments/login/login.component';
import { ChatComponent } from './componments/mychat/chat/chat.component';
import { ConfigurationComponent } from './componments/configuration/configuration.component';
import { ChangePwdComponent } from './componments/configuration/change-pwd/change-pwd.component';
import { RouteGuard } from './services/routeguard.guard';
import { MyteamComponent } from './componments/configuration/myteam/myteam.component';
import { MyinfoComponment } from './componments/configuration/myInfo/myinfo.component';
import { LogoutComponent } from './componments/logout/logout.componment';
import { MemberComponent } from './componments/configuration/member/member.component';
import { RegisterComponent } from './componments/register/register.component';
import { ResetpwdComponent } from './componments/resetpwd/resetpwd.component';
import { LogviewerComponent } from './logviewer/logviewer.component';
export const routes: Routes = [
    {
        path: 'mychat',
        component: MychatComponent,
        canActivate: [RouteGuard],
        children: [
            {
                path: '',
                component: MychatComponent,
                children: [

                    {
                        path: ':id',
                        component: MychatComponent
                    }
                ]
            },
            {
                path: ':id',
                component: MychatComponent
            }
        ]
    },
    {
        path: 'mycontact',
        component: MycontactComponent,
        canActivate: [RouteGuard],
        // ,
        // canActivate:[RouteGuard]
    },
    {
        path: 'resetpwd',
        component: ResetpwdComponent
    },
    {
        path: 'myfavorite',
        component: MyfavoriteComponent,
        canActivate: [RouteGuard],
        //canActivate:[RouteGuard]
    },
    {
        path: 'login',
        component: LoginComponment,
        //canActivate:[RouteGuard],
    },
    {
        path: 'log',
        component: LogviewerComponent
    },
    {
        path: 'register',
        component: RegisterComponent,
        //  canActivate:[RouteGuard],
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },

    {
        path: "conf",
        component: ConfigurationComponent,
        canActivate: [RouteGuard],
        children: [

            {
                path: "pwd",
                component: ChangePwdComponent
            },
            {
                path: 'team',
                component: MyteamComponent

            },
            {
                path: 'my',
                component: MyinfoComponment
            },
            {
                path: 'logout',
                component: LogoutComponent
            }
            ,
            {
                path: 'member',
                component: MemberComponent

            }
        ]
    },
    {
        path: "**",
        component: MycontactComponent
    }
]

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, { enableTracing: false, useHash: true });