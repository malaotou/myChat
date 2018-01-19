import { Component, OnInit, ElementRef } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms'
//import { Validators } from '@angular/forms/src/validators';

declare var $: any;
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [UserService]
})

export class RegisterComponent implements OnInit {

  constructor(private uService: UserService,
    private route: Router,
    private elem: ElementRef,
    private fb: FormBuilder) { }
  error: boolean = false;
  isOpen: boolean = false;
  errorMsg: string = "";
  regForm: FormGroup;
  ngOnInit() {
    //this.toast.popToast();
    this.regForm = this.fb.group({
      phone: [null, null],//regFormValidator.isPhoneValid
      verifyCode: [null, null],
      password: [null, null]//Validators.minLength(6)
    })

  }
  changeStatus() {
    this.isOpen = !this.isOpen;
    //console.log(this.elem.nativeElement.querySelector('#password'));
    if (this.isOpen) {
      this.elem.nativeElement.querySelector('#password').type = "text";
    }
    else {
      this.elem.nativeElement.querySelector('#password').type = "password";
    }

  }
  register(user, pwd) {
    var myreg = /^0{0,1}(13[4-9]|15[7-9]|15[0-2]|18[7-8])[0-9]{8}$/;
    if (myreg.test(user) || 1 == 1) {
      console.log(user, pwd);
      this.uService.register({
        account: user,
        password: pwd
      }).subscribe(res => {
        console.log(res);
        // 注册成功
        if (res.isSuccess) {
          this.route.navigate(["/login", { phone: user }]);
        }
        else {
          this.error = true;
          this.errorMsg = "用户名已经注册，请登录！";
          //alert("注册失败");

        }
      });
    }
    else {
      this.error = true;
      this.errorMsg = "请输入正确的手机号码！";
      console.log(this.errorMsg)
    }
  }
  checkEmpty(event) {
    console.log(event.target);
    console.log(event.target.value);
    if (event.target.value == "") {
      event.target.focus();
    }

  }
}

export class regFormValidator {
  static isPhoneValid(control: FormControl): any {

    var myreg = /^0{0,1}(13[4-9]|15[7-9]|15[0-2]|18[7-8])[0-9]{8}$/;;
    if (!myreg.test(control.value)) {

      return {
        "手机号不正确！": true
      }
    }

    return null;
  }
}
