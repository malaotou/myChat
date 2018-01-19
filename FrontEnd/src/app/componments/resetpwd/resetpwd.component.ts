import { Component, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

declare var $: any;
@Component({
  selector: 'app-resetpwd',
  templateUrl: './resetpwd.component.html',
  styleUrls: ['./resetpwd.component.css']
})
export class ResetpwdComponent implements OnInit {
  errorMsg: any;
  constructor() { }

  ngOnInit() {
    var patt = new RegExp("^1[3|4|5|7|8][0-9]{9}$");
    $("#getcode").attr("disabled", true);
    $("#phone,#verfiycode,#password,#repassword").focusin(function (e) {
      $(this).siblings(".msg-tip").hide();
    })
    $("#phone").focusout(function (e) {
      if (!patt.test($('#phone').val()) && $('#phone').val() != '') {
        $(this).siblings(".msg-tip").text("手机号码不正确！").css("display", "block");
      }



    })
    $("#phone").keyup(function () {
      if ($(this).val().length >= 11 && patt.test($('#phone').val()) ) {
        $("#getcode").attr("disabled", false);
      }

    });




    $("#next_btn").click(function (e) {
      if ($('#phone').val() != '' && $('#verfiycode').val() != '' && patt.test($('#phone').val())) {
        $("#first").hide();
        $("#second").show();
      }
      else {
        if ($('#phone').val() == '') {
          $(".tip-hpone").text("手机号码不能为空！").show();
        }
        else {
          if (!patt.test($('#phone').val())) {
            $(".tip-hpone").text("手机号码不正确！").show();
          }
          
          if ($('#verfiycode').val() == '') {
            $(".tip-verfiycode").text("验证码不能为空！").show();
          }
        }
      }
    })

    $("#reset_btn").click(function(e){
      
        if($("#password").val()!="" && $("#repassword").val()!="" && $("#password").val()== $("#repassword").val()){
          //alert("密码重置成功！");
          $("#second ").hide();
          $(".msg-bar").text("密码重置成功，请您移步登录界面，重新登录，谢谢！").show();
        }
        else
          if($("#password").val()=="" ){
            $(".tip-pwd").text("密码不能为空！").show();
          }
          else
          if($("#repassword").val()=="" ){
            $(".tip-repwd").text("确认密码不能为空！").show();
          }
          else
          if($("#password").val()!=$("#repassword").val()){
            $(".tip-repwd").text("两次输入密码不一致！").show();
          }


    })

    $(".pwd-ico").click(function(){
      
      $(this).toggleClass("eye-close");
      var str=$(this).attr("class");
      var pattstr=/eye-close/g;
      alert(str);
      if(pattstr.test(str))
        $(this).siblings("input").attr("type","text");
      else
        $(this).siblings("input").attr("type","password");
    })



  }

}
