import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { CommonService } from '../../../../services/common.service';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../../../../../utils/custom.validators';
@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss', './../developers/developers.component.scss']
})
export class EmailComponent implements OnInit {
  public selectedOption;
  public options = [
    { label: 'Free', value: 'free' },
    { label: 'Paid ($10 per month)', value: 'paid' }
  ];
  public paidForm: FormGroup;
  private whiteListedResponse;
  public hideSaveCancelBtn: boolean = false;
  constructor(private settingsService: SettingsService, public commonService: CommonService,
    private customMessage: CustomMessageService, private fb: FormBuilder) { }

  ngOnInit() {
    window['e'] = this;
    if (this.commonService.loginData.whitelisted_user_email) {
      this.hideSaveCancelBtn = true;
      this.initForm();
      this.selectedOption = this.options[1];
      this.settingsService.getWhitelistedEmailDetails()
        .subscribe(response => {
          this.whiteListedResponse = response;
          this.setWhitelistedPaidPlanValues(response);
        }, error => {
          this.commonService.handleError(error);
        })
    }
    else {
      this.initForm();
      this.setDefaultPaidPlanValues();
    }

  }


  private setWhitelistedPaidPlanValues(response: any) {
    this.paidForm.controls.email.setValue(response.data.from_email);
    this.paidForm.controls.sender.setValue(response.data.from_name);
  }

  private setDefaultPaidPlanValues() {
    this.paidForm.controls.email.setValue(this.commonService.loginData.email);
    const sender = this.commonService.loginData.company_name &&
      this.commonService.loginData.company_name != 'Company Name' ?
      this.commonService.loginData.company_name : this.commonService.loginData.username;
    this.paidForm.controls.sender.setValue(sender);
    this.selectedOption = this.options[0];
  }

  private initForm() {
    this.paidForm = this.fb.group({
      'email': [{ value: '', disabled: this.hideSaveCancelBtn }, [Validators.required, CustomValidators.validateEmail('Please enter valid email.')]],
      'sender': [{ value: '', disabled: this.hideSaveCancelBtn }, Validators.required]
    })
  }

  onSaveClick() {
    if (this.hideSaveCancelBtn) return;
    if (!this.paidForm.valid)
      return this.commonService.validateAllFormFields(this.paidForm);

    const email = this.paidForm.controls.email.value.trim();
    const sender = this.paidForm.controls.sender.value.trim();
    this.settingsService.requestWhiteListedEmail(email, sender)
      .subscribe(response => {
        //this.customMessage.showMessage({ summary: "success", severity: 'success', detail: response.message });
        this.commonService.errorMessage = 'We appreciate you contacting us about Email white-labeling. One of our representative will get back to you shortly.';
      }, error => {
        this.commonService.handleError(error);
      })
  }

  onCancelClick() {
    if (this.commonService.loginData.whitelisted_user_email) {
      this.setWhitelistedPaidPlanValues(this.whiteListedResponse);
    } else {
      this.setDefaultPaidPlanValues();
    }
  }
}
