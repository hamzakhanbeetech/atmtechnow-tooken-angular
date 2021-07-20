import { Component, OnInit, ViewChild, ElementRef, NgZone ,ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { ConfirmationService } from '../../../jw-notifications/services/confirmation.service';
import { CommonService } from '../../../../services/common.service';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { CustomValidators } from '../../../../../utils/custom.validators';
import { constants } from '../../../../../constants/constants'
import { Country } from '../../../jw-tel-input/interfaces/country.interface';
import { IntPhonePrefixComponent } from '../../../jw-tel-input/components/int-phone-prefix.component';
import { MapsAPILoader } from '@agm/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss', '../developers/developers.component.scss']
})
export class ProfileComponent implements OnInit {
  loc: any;
  @ViewChild('search') searchElementRef: ElementRef;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('fileInput1') fileInput1: ElementRef;
  @ViewChild('fileInput5') fileInput5: ElementRef;


  @ViewChild("intlTelInput") phoneInputField: IntPhonePrefixComponent;
  @ViewChild('oldpassword') oldpasswordEl:ElementRef;
  @ViewChild('deletePasswordInput') deletePasswordInput:ElementRef;
  
  profileForm: FormGroup;
  changePasswordForm: FormGroup;
  deleteAccountPasswordModalForm: FormGroup;
  //  pendingAmount : number;
  private password: string;
  countries: Array<any> = constants.countries;
  file;
  logoFile;
  fleet_background=0;
  public openedAccordion: number = 1;
  constructor(private fb: FormBuilder, private confirmationService: ConfirmationService,
    private settingsService: SettingsService, private customMessage: CustomMessageService,
    public commonService: CommonService, private mapsAPILoader: MapsAPILoader, private ngZone: NgZone ,  private ref: ChangeDetectorRef,
    private http: HttpClient) { }

  ngOnInit() {
    this.initProfileForm();
    this.initChangePasswordForm();
    this.initAutoComplete();
    this.openDeleteAccountPasswordModal();
  }

  ngAfterViewInit() {
    this.openedAccordion = 1;
  }

  /**
   * initialize profile form
   */
  private initProfileForm() {
    let country: any = constants.countries[229];
    const displayType = this.commonService.loginData.company_image ? 1 : 2;

    if (this.commonService.loginData.country) {
      const _country = this.retrieveCountry(this.commonService.loginData.country)
      country = _country ? _country[0] : country;
    }
    if(this.commonService.loginData.phone.substring(0,2)== '+1'){
      this.commonService.loginData.phone = this.commonService.loginData.phone.replace('+1','')
    }else{
      this.commonService.loginData.phone = this.commonService.loginData.phone.replace('+91','')
    }
    this.profileForm = this.fb.group({
      'first_name': [this.commonService.loginData.first_name || '', [Validators.required]],
      'last_name': [this.commonService.loginData.last_name || '', []],
      'phone': [this.commonService.loginData.phone || '', [Validators.required]],
      'email': [this.commonService.loginData.email || '', [Validators.required, CustomValidators.validateEmail("Please enter a valid email.")]],
      'company_name': [this.commonService.loginData.company_name || '', [Validators.required]],
      'company_address': [this.commonService.loginData.company_address || '', [Validators.required]],
      'country': [country, [Validators.required]],
      'user_id': [{ value: this.commonService.loginData.user_id || '', disabled: true }, [Validators.required]],
      'call_agent_as': [this.commonService.loginData.call_fleet_as || '', [Validators.required]],
      'display_image': [displayType, [Validators.required,
      CustomValidators.updateSiblingValidators('1', 'image', [Validators.required])]],
      'image': [this.commonService.loginData.company_image || ''],
      'logo':[this.commonService.loginData.fleet_background_image || ''],
      'driver_image':[this.commonService.loginData.fleet_job_image || ''],
      'banner_image':[this.commonService.loginData.promotional_banner_image || ''],

      'start_job_radius':[this.commonService.loginData.start_job_radius,[Validators.required]]

    })
  }
  private retrieveCountry(countryname: string) {
    return constants.countries.filter(item => {
      if (item.name == countryname)
        return item;
    });
  }

  /**
   * initialize change password modal form
   */
  private initChangePasswordForm() {
    this.changePasswordForm = this.fb.group({
      'old_password': ['', [Validators.required]],
      'new_password': ['', [Validators.required, Validators.minLength(6)]],
      'confirm_password': ['', [Validators.required, , Validators.minLength(6), CustomValidators.confirmPassword('Confirm password must match new password', 'new_password')]],
    })
  }
  /**
   * update New Password
   */
  updateNewPassword() {
    if (!this.changePasswordForm.valid) {
      return this.commonService.validateAllFormFields(this.changePasswordForm);
    } else {
      const new_password = this.changePasswordForm.controls.new_password.value;
      const old_password = this.changePasswordForm.controls.old_password.value;
      const confirm_password = this.changePasswordForm.controls.confirm_password.value;
      if (new_password != confirm_password) {

      }
      this.commonService.showLoader = true;
      this.settingsService.changePassword(old_password, new_password).subscribe(response => {
        this.commonService.showLoader = false;
        this.commonService.loginData.access_token = response.data.access_token;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
        this.commonService.emitDataToParentWindow('', { access_token: response.data.access_token, }, 'password_change')
        this.changePasswordForm.reset();
      }, error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error);
      })
    }
  }
  /**
   * open password modal for delete account
   */
  openDeleteAccountPasswordModal() {
    this.deleteAccountPasswordModalForm = this.fb.group({
      'password': ['', Validators.required],
    })
  }
  /**
   * check and delete customer's card
   *
   */
  checkDeleteCard() {
    if (!this.deleteAccountPasswordModalForm.valid) {
      return this.commonService.validateAllFormFields(this.deleteAccountPasswordModalForm);
    } else {
      this.commonService.showLoader = true;
      this.password = this.deleteAccountPasswordModalForm.controls.password.value;
      this.settingsService.checkDeleteUserCard(this.password).subscribe(response => {
        //loaderhide
        this.commonService.showLoader = false;
        const pendingAmount = response.data.pending_amount;
        if (pendingAmount > 0) {
          this.clearPendingDues(pendingAmount);
        }
        else {
          this.deleteAccount();
        }

      }, error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error);
      })
    }

  }

  /**
    * confirm & delete account
    */
  private deleteAccount() {
    this.confirmationService.confirm({
      header: "Confirm Delete",
      message: "Are you sure you want to delete this account?",
      accept: () => {
       this.commonService.showLoader = true;
        this.settingsService.deleteUserCard(this.password)
          .subscribe(response => {
            this.commonService.showLoader = false;
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
            this.commonService.emitDataToParentWindow('page.login');
          }, error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error);
          })
      }
    })
  }

  /**
    * clear pending dues
    *@param pending amount of customer
    */
  private clearPendingDues(pendingAmount: number) {
    this.confirmationService.confirm({
      //header: "Pay Due Amount",
      confirmBtnText: "Pay $" + pendingAmount + " now",
      message: "We have noticed there is an outstanding payment of $" + pendingAmount + " against this account. Kindly clear this amount to proceed ahead.",
      accept: () => {
        this.commonService.showLoader = true;
        this.settingsService.payUserAmount()
          .subscribe(response => {
           this.commonService.showLoader = false;
            this.deleteAccount();
          }, error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error);
          })
      }
    })
  }

  /**
   * scroll down
   * @param template ref
   */
  // scrollToOldPassword(e) {
  //   setTimeout(() => {
  //     e.scrollIntoView({ behavior: 'smooth' });
  //   }, 300)
  // }
  /**
   * close other accordion
   * @param accordionNumber accordion ref
   */
  closeOtherAccordion(accordionNumber:number){
    this.openedAccordion= accordionNumber;
    if(accordionNumber==2){
      this.oldpasswordEl.nativeElement.focus();
    }
    if(accordionNumber==4){
      this.deletePasswordInput.nativeElement.focus();
    }
  }

  /**
   * on image upload event change
   * @param event file upload event
   */
  onUpload(event) {
    const file = event.target.files[0];
    if (file) {
      this.file = file;
      var imageType = /image.*/;
      var reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileForm.controls.image.patchValue(e.target.result);

      }
      reader.readAsDataURL(file);
    }
  }
  onUploadDriverImage(event)
  {
    const file = event.target.files[0];
    if (file) {
      var imageType = /image.*/;
      //if (!file.type.match(imageType)) {
      //
      //}
      var reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileForm.controls.driver_image.patchValue(e.target.result);
        console.log('imageeeee', this.profileForm.controls.driver_image.value)
      }
      reader.readAsDataURL(file);
      let data = new FormData();
      data.append('ref_image',file ?file : this.profileForm.controls.driver_image.value);
      this.http.post(`${environment.api_url}/upload_reference_images`, data)
        .map(this.commonService.tookanResponse).subscribe(
          response => {
            this.profileForm.controls.driver_image.patchValue(response.data.ref_image);
            this.fleet_background=1;
            // console.log(this.imageUrl,'???')
          }, error => {
            this.commonService.handleError(error)
          });
    }

  }

  onUploadBannerImage(event)
  {
    const file = event.target.files[0];
    if (file) {
      var imageType = /image.*/;
      //if (!file.type.match(imageType)) {
      //
      //}
      var reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileForm.controls.banner_image.patchValue(e.target.result);
      }
      reader.readAsDataURL(file);
      let data = new FormData();
      data.append('ref_image',file ?file : this.profileForm.controls.image.value);
      this.http.post(`${environment.api_url}/upload_reference_images`, data)
        .map(this.commonService.tookanResponse).subscribe(
          response => {
            this.profileForm.controls.banner_image.patchValue(response.data.ref_image);
            // console.log(this.imageUrl,'???')
          }, error => {
            this.commonService.handleError(error)
          });
    }

  }

  onUploadLogo(event) {
    const logoFile = event.target.files[0];
    var image;
    if (logoFile) {
      this.logoFile = logoFile;
      var reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileForm.controls.logo.patchValue(e.target.result);
                image = new Image();
                image.src = e.target.result; 
                image.onload = function () {
                    var height = this.height;
                    var width = this.width;
                    if (height > 1200 || width > 1200) {
                      // Height and Width must not exceed 125px.
                      document.getElementById("showLogoMessage").style.display = "block";
                      return false;
                    }else{
                      document.getElementById("showLogoMessage").style.display = "none";
                      return true;
                    }
                };
                
      }
      reader.readAsDataURL(logoFile);
    }

  }

  /**
   * on profile form submit 
   */
  onProfileSubmit() {
    if (!this.profileForm.valid) {
      return this.commonService.validateAllFormFields(this.profileForm);
    }
    const formData = this.createProfileSubmitData();
    this.commonService.showLoader = true;
    this.settingsService.updateProfile(formData)
      .subscribe(response => {
        this.commonService.showLoader = false;
        
        this.commonService.loginViaAccessToken(this.commonService.loginData.access_token).subscribe(response => {
          this.commonService.loginData = response.data;
        }, error => {
          this.commonService.showLoader = false;
          this.commonService.handleError(error);
        })
        this.commonService.emitDataToParentWindow('', {
          fleet_name: this.profileForm.controls.call_agent_as.value.trim(),
          'task_name': this.commonService.loginData.call_tasks_as,
          'manager_name': this.commonService.loginData.call_dispatcher_as,
        }, 'profile_updated')
        this.customMessage.showMessage({ severity: 'success', summary: 'success', detail: response.message })
      }, error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error);
      })

  }

  /**
   * generate formData for submitting profile form
   * @returns FormData required for updating profile form
   */
  private createProfileSubmitData(): FormData {
    const image_flag = this.file ? 1 : 0;
    const logo_flag = this.logoFile ? 1 : 0;
    const file = this.file;
    const logo = this.logoFile ? this.logoFile : this.profileForm.controls.logo.value;
    const driver_image=this.profileForm.controls.driver_image.value;
    const banner_image=this.profileForm.controls.banner_image.value;

    const fleet_profile_background=this.profileForm.controls.banner_image.value;

    const start_job_radius=this.profileForm.controls.start_job_radius.value;
    let is_company_image_view, is_driver_image_view;
    const firstName = this.profileForm.controls.first_name.value.trim();
    const lastName = this.profileForm.controls.last_name.value.trim();
    const username = firstName + " " + lastName;
    const email = this.profileForm.controls.email.value.trim();
    const orgName = this.profileForm.controls.company_name.value.trim();
    const address = this.profileForm.controls.company_address.value.trim();
    const country = this.profileForm.controls.country.value;
    const call_agent_as = this.profileForm.controls.call_agent_as.value.trim();
    let phoneValue: string = this.profileForm.controls.phone.value.toString();
    const countryData: Country = this.phoneInputField.selectedCountry;
    if (!phoneValue.startsWith('+')) {
      phoneValue = `+${countryData.dialCode.toString()}${phoneValue}`;
    }
    if (this.profileForm.controls.display_image.value == 1) {
      is_company_image_view = 1;
      is_driver_image_view = 0;
    }
    else {
      is_company_image_view = 0;
      is_driver_image_view = 1;
    }

    var formData = new FormData();
    formData.append("access_token", this.commonService.loginData.access_token);
    formData.append("name", username);
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("phone", phoneValue);
    formData.append("org_name", orgName);
    formData.append("org_address", address);
    if (this.loc) {
      formData.append("latitude", this.loc.lat());
      formData.append("longitude", this.loc.lng());
    }
    formData.append("country", country ? country.name : '');
    formData.append("is_company_image_view", is_company_image_view);
    formData.append("is_driver_image_view", is_driver_image_view);
    formData.append("is_image", image_flag.toString());
    formData.append("company_image", file);
    formData.append("is_fleet_background_image_added", this.fleet_background.toString());
    formData.append("fleet_background_image", logo);
    formData.append("call_fleet_as", call_agent_as);
    formData.append("call_tasks_as", this.commonService.loginData.call_tasks_as);
    formData.append("call_dispatcher_as", this.commonService.loginData.call_dispatcher_as);
    formData.append("country_phone_code", countryData.countryCode);
    formData.append("email", email);
    formData.append("fleet_job_image",driver_image );
    formData.append("promotional_banner_image",banner_image );



    formData.append("start_job_radius",start_job_radius );




    return formData;

  }

  /**
   * initialize company name autocomplete
   */
  private initAutoComplete() {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: []
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result

          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          this.profileForm.controls.company_address.setValue(this.searchElementRef.nativeElement.value);
          if (place.geometry) {
            this.loc = place.geometry.location;
          }
          //verify result
          // if (place.geometry === undefined || place.geometry === null) {
          //   this.invalidLocation = true;
          // }

          let geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address: this.searchElementRef.nativeElement.value }, (results: google.maps.GeocoderResult[], status) => {
            if (status == google.maps.GeocoderStatus.OK) {
              let country, i, j;
              for (j = 0; j < results.length; j++) {
                for (i = 0; i < results[j].address_components.length; i++) {
                  if (results[j].address_components[i].types[0].indexOf("country") >= 0) {
                    country = results[j].address_components[i];
                    break;
                  }
                }
                if (country) break;
              }
              const _country = this.retrieveCountry(country.long_name);
              if(_country)
              this.profileForm.controls.country.setValue(_country[0]);
              this.profileForm.updateValueAndValidity();
              this.ref.detectChanges();
            }
          })

        });
      });
    });
  }

}
