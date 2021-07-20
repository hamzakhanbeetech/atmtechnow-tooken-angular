import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../services/common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { CustomMessageService } from '../../../../services/custom-message.service';

@Component({
  selector: 'app-requestotp',
  templateUrl: './requestotp.component.html',
  styleUrls: ['./requestotp.component.scss']
})
export class RequestotpComponent implements OnInit {

  public otpForm: FormGroup;
  constructor(public commonService: CommonService, private formBuilder: FormBuilder,
     private settingService: SettingsService,  private customMessage: CustomMessageService) { }

  ngOnInit() {
    this.initOtpForm();
    this.getOtpInfo();
  }

  initOtpForm() {
  this.otpForm = this.formBuilder.group({
    'sms_text': ['', Validators.required]
  })
  }

  onOtpMessageSubmit() {
    if(!this.otpForm.valid) {
      return this.commonService.validateAllFormFields(this.otpForm);
    }
    else {
      this.commonService.showLoader = true;
      const smstext = this.otpForm.controls.sms_text.value.trim() || '';
      this.settingService.requestOtpMessage(smstext).subscribe(
        (response) => {
          this.commonService.showLoader = false;
          this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          // this.otpForm.reset();
        }, 
        error => {
          this.commonService.showLoader = false;
          this.commonService.handleError(error);
        }
      )
    }
   
  }
  getOtpInfo(){
    this.settingService.otpMessage().subscribe(
      response => {
        console.log(response);
        if(response.data && response.data.messageText) {
          this.otpForm.controls.sms_text.setValue(response.data.messageText);
        }
      },
      error => {
        this.commonService.handleError(error);
      }
    )
  }
}
