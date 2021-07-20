import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { CommonService } from '../../../../services/common.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { CustomMessageService } from '../../../../services/custom-message.service';

@Component({
  selector: 'app-rights',
  templateUrl: './rights.component.html',
  styleUrls: ['./rights.component.scss', '../developers/developers.component.scss']
})
export class RightsComponent implements OnInit{
  rightsForm: FormGroup;
  rights = [
    { label: 'Right to be forgotten', value: 1 },
    { label: 'Right to portability', value: 2 },
    { label: 'Right to rectification', value: 3 },
    { label: 'Right to restriction of processing', value: 4 }
  ];
  selectedOption: any;
  constructor( public commonService: CommonService, private fb: FormBuilder, private route: ActivatedRoute, private settingsService: SettingsService,
  private customMessage: CustomMessageService  ) {
  }

  ngOnInit() {
    window['x']=this;
    this.initForm();
  }


  onSubmitClick() {
    if (!this.rightsForm.valid) {
      this.commonService.validateAllFormFields(this.rightsForm);
    } else {
      //API
      this.commonService.showLoader = true;
      const option = this.rightsForm.controls.option.value.value;
      const reason = this.rightsForm.controls.reason.value.trim();
      this.settingsService.submitUserRights(option, reason).subscribe(
        (response) => {
          this.commonService.showLoader = false;
          this.customMessage.showMessage({ severity: "success", summary: "success", detail: 'Thanks for contacting us! We will be in touch with you shortly.' });  
          this.rightsForm.reset();
        },
        error => {
          this.commonService.showLoader = false;
          this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });         
        });
    }
  }

  initForm() {
    this.rightsForm = this.fb.group({
      'option': ['', Validators.required],
      'reason': ['', Validators.required],
    })
  }
}
