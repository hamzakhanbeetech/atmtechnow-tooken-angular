import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { PanelService } from '../../panel.service';
import { CommonService } from '../../../../services/common.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { IResetPassword } from '../../interfaces/interface';
import { CustomMessageService } from '../../../../services/custom-message.service';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss' , '../login/login.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  public resetPasswordForm: FormGroup;
  public showPassword: boolean;
  public showLoader: number = 2;
  public resetPwdBody: IResetPassword = <IResetPassword>{};
  constructor(private formBuilder: FormBuilder,
    private panelService: PanelService,
    public commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private router: Router, private customMessage: CustomMessageService) { }

  ngOnInit() {
    this.initResetPasswordForm();
    this.activatedRoute.queryParams.subscribe(
      (params) => {
        this.resetPwdBody.token = params['token'];
        this.resetPwdBody.email = params['email'];
        this.resetPwdBody.type = params['type'];
        // "https://test.tookanapp.com/#/page/resetpassword?token=08243ddab10a4b4b1c152c3b1011224314e7ccf92d&email=kojyq@amail.club&type=changeU"
      });
  }

  /** 
   * Initialization of form
  */
  initResetPasswordForm() {
    this.resetPasswordForm = this.formBuilder.group({
      'password': ['', [Validators.required, Validators.minLength(6)]],
      'confirmPassword': ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  public togglePassword(item: string) {
    let el = document.getElementById(item);
    if (!this.showPassword) {
      el.setAttribute('type', 'text');
      this.showPassword = true;
    }
    else {
      el.setAttribute('type', 'password');
      this.showPassword = false;
    }
  }

  /**
   * Api call for reset password
   */
  resetPassword() {
    if (!this.resetPasswordForm.valid) {
      return this.commonService.validateAllFormFields(this.resetPasswordForm);
    } else {
      const pwd = this.resetPasswordForm.controls.password.value.trim();
      const confirmPwd = this.resetPasswordForm.controls.confirmPassword.value.trim();
      if (pwd != confirmPwd) {
        //message service password entered must be same
        this.customMessage.showMessage({ severity: "error", summary: "error", detail: "Password entered must be same" });
      } else {
        this.resetPwdBody.password = pwd;
        this.panelService.resetPassword(this.resetPwdBody).subscribe(
          response => {
            //loader
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
            this.router.navigate(['/panel/login']);
          },
          error => {
            //loader
            this.resetPasswordForm.reset();
            this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
          });
      }
    }


  }
}
