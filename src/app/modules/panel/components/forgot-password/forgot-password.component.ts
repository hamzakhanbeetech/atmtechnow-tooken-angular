import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { PanelService } from '../../panel.service';
import { CommonService } from '../../../../services/common.service';
import { Router } from '@angular/router';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { environment } from '../../../../../environments/environment';
import { constants } from '../../../../../constants/constants';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss', '../login/login.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  public forgotPwd: FormGroup;
  public showPassword: boolean;
  public showLoader: number = 2;
  constructor(private formBuilder: FormBuilder,
    private panelService: PanelService,
    public commonService: CommonService,
    private router: Router, private customMessage: CustomMessageService) { }

  ngOnInit() {
    this.initForgotPwd();
  }


  /** 
   * Form initialzation
  */
  initForgotPwd() {
    this.forgotPwd = this.formBuilder.group({
      'email': ['', [Validators.required, Validators.pattern(constants.emailPattern)]]
    })
  }

  /**
   * Api call for forgetPassword
   */

  forgotPassword() {
    if (!this.forgotPwd.valid) {
      return this.commonService.validateAllFormFields(this.forgotPwd);
    }
    else {
      const emailVal = this.forgotPwd.controls.email.value.trim();
      this.panelService.userForgotPasswordFromEmail(emailVal).subscribe(
        response => {
          //loader false
          this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
        },
        error => {
          //loader service
          this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
        });
    }

  }

}
