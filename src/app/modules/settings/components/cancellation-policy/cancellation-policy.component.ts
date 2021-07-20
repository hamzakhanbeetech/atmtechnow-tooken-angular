import { Component, OnInit, ViewChild, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { ConfirmationService } from '../../../jw-notifications/services/confirmation.service';
import { CommonService } from '../../../../services/common.service';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { CustomValidators } from '../../../../../utils/custom.validators';
import { constants } from '../../../../../constants/constants'

@Component({
  selector: 'app-cancellation-policy',
  templateUrl: './cancellation-policy.component.html',
  styleUrls: ['./cancellation-policy.component.scss', '../developers/developers.component.scss']
})
export class CancellationPolicyComponent implements OnInit {

  cancellationPolicyForm: FormGroup;
  constructor(private fb: FormBuilder, private confirmationService: ConfirmationService,
    private settingsService: SettingsService, private customMessage: CustomMessageService,
    public commonService: CommonService, private ngZone: NgZone, private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.initContactForm();
    this.getCancellationPriceData();
  }

  /**
   * initialize form
   */
  private initContactForm() {
    this.cancellationPolicyForm = this.fb.group({
      'minutes': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'price': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal)]],
      'no_access_fee': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal)]],
      'access_fee_minutes': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal)]],
      'no_access_wait_minutes': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal)]],
      'access_fee_interval_minutes': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal)]],
      'access_fee_interval_price': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal)]],
      'no_access_wait_time_fare': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal)]],
      'diagnostic_fee': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal)]],
      'diagnostic_time': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'base_fare': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal)]],
      'distance_fare': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal)]],
      'time_fare': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal)]],
    })
  }


  getCancellationPriceData() {
    this.settingsService.getCancellationPriceData().subscribe(
      response => {
        this.cancellationPolicyForm.setValue({
          'minutes': response.data.cancellation_minutes,
          'price': response.data.cancellation_charge,
          'no_access_fee': response.data.no_access_fee,
          'access_fee_minutes': response.data.access_fee_minutes,
          'no_access_wait_minutes':response.data.no_access_wait_minutes || 0,
          'access_fee_interval_minutes': response.data.extra_minutes || 0,
          'access_fee_interval_price': response.data.extra_fee,
          'no_access_wait_time_fare':response.data.no_access_wait_time_fare || 0,
          'diagnostic_fee': response.data.diagnostic_fee,
          'diagnostic_time': response.data.diagnostic_time || 0,
          'base_fare': response.data.base_fare || 0,
          'distance_fare': response.data.distance_fare || 0,
          'time_fare': response.data.time_fare || 0,
        })
      }, error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error);
      });
  }

  /* Update the contact info */
  onSubmit(formValue) {
    console.log(formValue)
    if (!this.cancellationPolicyForm.valid)
      return this.commonService.validateAllFormFields(this.cancellationPolicyForm);
    let cancellationData = {
      cancellation_minutes: '',
      cancellation_charge: '',
      no_access_fee: '',
      access_fee_minutes: '',
      access_fee_interval_minutes: '',
      access_fee_interval_price: '',
      no_access_wait_time_fare:'',
      no_access_wait_minutes:'',
      diagnostic_fee: '',
      diagnostic_time: '',
      base_fare: '',
      distance_fare: '',
      time_fare: ''

    };
    cancellationData.cancellation_minutes = this.cancellationPolicyForm.controls.minutes.value;
    cancellationData.cancellation_charge = this.cancellationPolicyForm.controls.price.value;
    cancellationData.no_access_fee = this.cancellationPolicyForm.controls.no_access_fee.value;
    cancellationData.access_fee_minutes = this.cancellationPolicyForm.controls.access_fee_minutes.value;
    cancellationData.access_fee_minutes = this.cancellationPolicyForm.controls.access_fee_minutes.value;
    cancellationData.no_access_wait_minutes = this.cancellationPolicyForm.controls.no_access_wait_minutes.value;
    cancellationData.access_fee_interval_price = this.cancellationPolicyForm.controls.access_fee_interval_price.value;
    cancellationData.access_fee_interval_minutes = this.cancellationPolicyForm.controls.access_fee_interval_minutes.value;
  cancellationData.no_access_wait_time_fare = this.cancellationPolicyForm.controls.no_access_wait_time_fare.value;
    cancellationData.diagnostic_fee = this.cancellationPolicyForm.controls.diagnostic_fee.value;
    cancellationData.diagnostic_time = this.cancellationPolicyForm.controls.diagnostic_time.value;
    cancellationData.base_fare = this.cancellationPolicyForm.controls.base_fare.value;
    cancellationData.distance_fare = this.cancellationPolicyForm.controls.distance_fare.value;
    cancellationData.time_fare = this.cancellationPolicyForm.controls.time_fare.value;
    this.commonService.showLoader = true;
    this.settingsService.updateCancellationInfo(cancellationData).subscribe(response => {
      this.commonService.showLoader = false;
      this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
    }, error => {
      this.commonService.handleError(error);
      this.commonService.showLoader = false;
    })
  }

}
