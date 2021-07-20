import { Component, OnInit, ViewChild, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { ConfirmationService } from '../../../jw-notifications/services/confirmation.service';
import { CommonService } from '../../../../services/common.service';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { CustomValidators } from '../../../../../utils/custom.validators';
import { constants } from '../../../../../constants/constants'
import { Country } from '../../../jw-tel-input/interfaces/country.interface';
import { IntPhonePrefixComponent } from '../../../jw-tel-input/components/int-phone-prefix.component';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.scss', '../developers/developers.component.scss']
})
export class ContactusComponent implements OnInit {
  @ViewChild("intlTelInput") phoneInputField: IntPhonePrefixComponent;

  loc: google.maps.LatLng;

  placeChanged(place,id) {
    if(id==1){
      this.ngZone.run(() => {
        this.contactForm.controls.address.setValue(place.formatted_address);
      });
    }else{
      this.ngZone.run(() => {
        this.contactForm.controls.address1.setValue(place.formatted_address);
      });
    }
   
  }

  contactForm: FormGroup;
  countries: Array<any> = constants.countries;
  file;
  constructor(private fb: FormBuilder, private confirmationService: ConfirmationService,
    private settingsService: SettingsService, private customMessage: CustomMessageService,
    public commonService: CommonService, private ngZone: NgZone, private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.initContactForm();
    this.getContactData();
  }

  ngAfterViewInit() {
  }

  /**
   * initialize contact form
   */
  private initContactForm() {
    let country: any = constants.countries[229];
    if (this.commonService.loginData.country) {
      const _country = this.retrieveCountry(this.commonService.loginData.country)
      country = _country ? _country[0] : country;
    }
    this.contactForm = this.fb.group({
      'phone': ['', [Validators.required]],
      'email': ['', [Validators.required, CustomValidators.validateEmail("Please enter a valid email.")]],
      'link': ['', [Validators.required,Validators.pattern(constants.linkPattern)]],
      'address':['',Validators.required],
      'address1':['',Validators.required],
    })
  }
  private retrieveCountry(countryname: string) {
    return constants.countries.filter(item => {
      if (item.name == countryname)
        return item;
    });
  }
  getContactData() {
    this.settingsService.getContactData().subscribe(
      response => {
        if(response.data.phone.substring(0,2)== '+1'){
          response.data.phone = response.data.phone.replace('+1','')
        }else{
          response.data.phone = response.data.phone.replace('+91','')
        } 
        this.contactForm.setValue({
          'phone': response.data.phone,
          'email': response.data.email,
          'link': response.data.link,
          'address':response.data.address1,
          'address1':response.data.address2,

        })
      }, error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error);
      });
  }

  /* Update the contact info */
  onContactSubmit(formValue) {
    console.log(formValue)
    if (!this.contactForm.valid)
      return this.commonService.validateAllFormFields(this.contactForm);
      let contactData = {
        email:'',
        phone:'',
        link:'',
        address1:'',
        address2:'',
      };
      // console.log(this.contactForm);
      let phoneValue: string = this.contactForm.controls.phone.value.toString();
      const countryData: Country = this.phoneInputField.selectedCountry;
      if (!phoneValue.startsWith('+')) {
        phoneValue = `+${countryData.dialCode.toString()}${phoneValue}`;
      }
      contactData.email = this.contactForm.controls.email.value;
      contactData.phone = phoneValue;
      contactData.link = this.contactForm.controls.link.value;
      contactData.address1 = this.contactForm.controls.address.value;
      contactData.address2 = this.contactForm.controls.address1.value;
    this.commonService.showLoader = true;
    this.settingsService.updateContactInfo(contactData).subscribe(response => {
      this.commonService.showLoader = false;
      this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
    }, error => {
      this.commonService.handleError(error);
      this.commonService.showLoader = false;
    })
  }

}
