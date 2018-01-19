import { ApiServiceService } from './../../services/api-service.service';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { user } from '../../modules/user';
import { md5 } from 'md5';
import { window } from 'rxjs/operators/window';
import { AuthenticateService } from '../../services/authenticate.server';
import { ToastrService } from 'ngx-toastr';
import { MessageService } from '../../services/message.service';
import { Topic } from '../../modules/topic';
import { ChatcommonService } from '../../services/chatcommon.service';
declare var $: any;
@Component({
    templateUrl: "login.component.html",
    styleUrls: ["login.component.css"],
    selector: "app-login",
    providers: [MessageService,ApiServiceService]
})

export class LoginComponment implements OnInit {

    isAuthed: boolean = true;
    @ViewChild("uname")
    uname;
    // connectsubscribeSocketMessage;
    constructor(private httpService: ApiServiceService, private router: Router,
        private elem: ElementRef,
        private auth: AuthenticateService,
        private actRoute: ActivatedRoute,
        private render: Renderer2,
        private toastr: ToastrService,
        private messageService: MessageService,
        private chatcommonService: ChatcommonService
    ) {

    }
    ngOnInit() {
        $(document).keyup(function (event) {
            if (event.keyCode == 13) {
                $(".loginbtn").trigger("click");
            }
        });
        this.actRoute.params.subscribe(data => {
            // 重定向后设置默认账号！
            if (data.phone != undefined) {
                this.uname.nativeElement.value = data.phone;
            }
            else {
                if (localStorage.getItem('autoLogin') != null) {
                    var localtoken = localStorage.getItem('token');
                    if (localtoken != null) {
                        try {
                            // 解析，如果解析成功，则跳转到聊天页面
                            var decodeToken = this.auth.decodeToken(localtoken)
                            if (decodeToken != null) {
                                this.router.navigate(['/mychat']);
                            }
                        }
                        finally {

                        }
                    }
                    //this.auth.decodeToken
                }
            }

        });

        this.auth.broadcast(false);
        $('.choose-tab').click(function (e) {
            var k = parseInt($(this).index());
            var str = ".tab-cont:eq(" + k + ")";


            $(this).addClass('tab-actvie');
            $(this).siblings().removeClass('tab-actvie');
            $(str).show();
            $(str).siblings().hide();
        });

    }
    ngOnDestroy() {
        //this.connectsubscribeSocketMessage.unsubscribe();
    }

    login(account: string, password: string) {
        var u = new user();
        u.account = account;
        u.password = password;
        var login = this.httpService.login(u)
            .subscribe(res => {
                console.log(res)
                if (res.data != null && res.data.token != null) {

                    localStorage.setItem('token', res.data.token);
                    this.auth.broadcast(true);
                    this.isAuthed = true;
                    this.router.navigate(['/mychat']);
                }
                else {
                    //认证失败
                    this.isAuthed = false;
                    console.log(this.elem.nativeElement.querySelector('input'));
                    this.elem.nativeElement.querySelector('input').value = "";
                }
            });
    }
    change() {
        this.auth.broadcast(false);
    }
    // 实现自动登录记录功能
    changeLoginType(event) {
        console.log(event.target.checked);
        if (event.target.checked) {
            localStorage.setItem('autoLogin', 'true')
        }
        else {
            localStorage.removeItem('autoLogin')
        }

    }
}

