import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonService } from '../../../../services/common.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { MerchantService } from '../../services/merchant.service';
import { ICustomField, IUploadDocField, IGeofenceData, IMerchantReqBody, IEditMerchantData } from '../../interfaces/interface';
import { IntPhonePrefixComponent } from '../../../jw-tel-input/components/int-phone-prefix.component';
import { Country } from '../../../jw-tel-input/interfaces/country.interface';
import { CustomValidators } from '../../../../../utils/custom.validators';
import { constants } from '../../../../../constants/constants';
import { Subject } from '../../../../../../node_modules/rxjs/Subject';
import { CustomFieldOptionsType } from '../../enum/enum';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

/**
 * Validator function to enable disable switch
 * @param siblingName name of the control
 * to be enabled/disabled
 */
export const statusUpdate = (siblingName: string): ValidatorFn => (control: AbstractControl) => {
  if (control.parent) {
    if (!control.value.visibleType) {
      control.parent.controls[siblingName].disable();
    }
    else {
      control.parent.controls[siblingName].enable();
    }
  }
  return null;
}

// export const atLeastOne = (validator: ValidatorFn) => (
//   array: FormArray,
// ): ValidationErrors | null => {
//   var anyValue;
//   let hasAtLeastOne = array && array.controls.length;
//   if(hasAtLeastOne) {
//     array.controls.forEach((fgroup) => {
//       anyValue = Object.keys(fgroup['controls']).some(k => !validator(fgroup['controls']));
//     })
//   }


//   return anyValue ? null : {
//       atLeastOne: true,
//   };
// };

@Component({
  selector: 'app-merchant-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss', '../list/list.component.scss']
})
export class MerchantAddComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('fileInput2') fileInput2: ElementRef;
  @ViewChild("intlTelInput") phoneInputField: IntPhonePrefixComponent;

  private customFieldsArray = [];
  private countryCode;
  file;


  //geofence
  geoFenceData: Array<IGeofenceData> = [];
  triggerGeoFenceEvents: Subject<string> = new Subject<string>();

  private merchant_id: number;
  public showPassword: boolean;
  public merchantEditMode: boolean;
  public currentDate;
  public addMerchantForm: FormGroup;
  quickBooksForm:FormGroup;
  public additionalFieldForm: FormGroup;
  public uploadDocForm: FormGroup;
  public showPermissions: boolean = false;
  public dataEnumType = CustomFieldOptionsType;
  public enableCustomFieldSwitch: boolean;


  public showGeofencePopup: boolean;
  public customFieldsOption = [
    { label: 'Date', visibleType: true },
    { label: 'Date-Future', visibleType: true },
    { label: 'Date-Past', visibleType: true },
    { label: 'Date-Time', visibleType: true },
    { label: 'Datetime-Future', visibleType: true },
    { label: 'Datetime-Past', visibleType: true },
    { label: 'Email', visibleType: true },
    { label: 'Number', visibleType: true },
    { label: 'Telephone', visibleType: true },
    { label: 'Text', visibleType: true },
    { label: 'Checkbox', visibleType: true },
    { label: 'Image', visibleType: true },
    { label: 'Single-Select', visibleType: true },
    { label: 'Multi-Select', visibleType: true }
  ];

  constructor(public commonService: CommonService, private http: HttpClient,
    private formBuilder: FormBuilder, private router: Router, private customMessage: CustomMessageService,
    private merchantService: MerchantService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    window['x'] = this;
    this.currentDate = new Date();
    this.initAddMerchantForm();
    this.initiAdditionalFieldForm();
    this.initUploadDocForm();
    this.activatedRoute.params.subscribe(
      (params: Params) => {
        if (params.id) {
          this.merchant_id = params.id;
          this.merchantEditMode = true;

          this.getMerchantsData(params.id);
        }
        else{
          this.merchantEditMode = false;

        }
      });
    this.requestCountryCode();
  }

  /**
   * emit action to be performed to Review component
   */
  emitEventToReview() {
    this.triggerGeoFenceEvents.next('Save');
  }

  /**
   * Initialize the static form
   * for add merchant
   */
  private initAddMerchantForm() {
    this.addMerchantForm = this.formBuilder.group({
      'fullname': ['', [Validators.required]],
      'phone': ['', Validators.required],
      'email': ['', [Validators.required, CustomValidators.validateEmail('Please enter a valid email')]],
      'companyAddress': ['', [Validators.required]],
      'password': ['', [Validators.required, Validators.minLength(6)]],
      'companyName': ['', [Validators.required]],
      'registrationNumber': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'companyWebsite': ['', [Validators.required, Validators.pattern(constants.linkPattern)]],
      'companyStructure': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'image': ['', Validators.required],
      'realm_id': [''],
      'consumer_key': [''],
      'consumer_secret': [''],



      'companyPrice': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimalUptoTwo)]],
      'permission': this.formBuilder.group({
        'createTask': [''],
        'createAgent': [''],
        'addManager': [''],
        'addCatalogue': [''],
        'addonServices': [''],
        'techskill': [''],
        'editTask': [''],
        'addVideo': [''],
        'addNotification': [''],
        'addSoftware': [''],
        'technician_schedule':[''],
        'autoAllocation':[''],
        'cancellation_policy':[''],
        'quickBooks':[''],
        'geofence':[''],
        'payments':[''],
        'teams':[''],
        'profile':[''],
        'templates':[''],
         'route':[''],
        'spareParts':[''],
        'selectAll': ['']
      }),
      // 'createGeofence': [''],
      // 'viewCustomer': [''],
      // 'commission': this.formBuilder.group({
      //   'commissionText': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal)]]
      // })

    });
    console.log('=============>',this.merchantEditMode)

  }



  /**
   * Form array for uploading documents
   */
  private initUploadDocForm() {
    this.uploadDocForm = this.formBuilder.group({
      'uploadDoc': this.formBuilder.array([this.addMoreDoc()])
    })
  }
  onUpload(event) {
    const file = event.target.files[0];
    if (file) {
      this.file = file;
      var imageType = /image.*/;
      //if (!file.type.match(imageType)) {
      //
      //}
      var reader = new FileReader();
      reader.onload = (e: any) => {
        this.addMerchantForm.controls.image.patchValue(e.target.result);
      }
      reader.readAsDataURL(file);
      let data = new FormData();
      data.append('ref_image', this.file ? this.file : this.addMerchantForm.controls.image.value);
      this.http.post(`${environment.api_url}/upload_reference_images`, data)
        .map(this.commonService.tookanResponse).subscribe(
          response => {
            this.addMerchantForm.controls.image.patchValue(response.data.ref_image);
            // console.log(this.imageUrl,'???')
          }, error => {
            this.commonService.handleError(error)
          });
    }
    // f.click();
  }

  /**
   * Form Array for additional fields
   */
  private initiAdditionalFieldForm() {
    this.additionalFieldForm = this.formBuilder.group({
      'items': this.formBuilder.array([this.addMoreItem()])
    });

    ((this.additionalFieldForm.get('items') as FormArray).controls[0] as FormGroup).controls.data_type.patchValue(this.customFieldsOption[0]);

  }

  /**
   * For adding more item in additional field
   */
  private addMoreItem(field: ICustomField = <ICustomField>{}) {
    return this.formBuilder.group({
      'label': [field.label || '', [Validators.required]],
      'display_name': [field.display_name || '', [Validators.required]],
      'data_type': [field.data_type ? { label: field.data_type, visibleType: true } : { label: 'Date', visibleType: true }, [Validators.required]], //, [statusUpdate('value')]
      'value': [field.value ? this.fetchDateValue(field.data_type, field.value) : ''],
      'mandatory': [field.required || '']
    });
  }

  private fetchDateValue(dateType, value) {
    if (dateType == this.dataEnumType.DATE || dateType == this.dataEnumType.DATE_FUTURE || dateType == this.dataEnumType.DATE_PAST || dateType == this.dataEnumType.DATE_TIME || dateType == this.dataEnumType.DATETIME_FUTURE || dateType == this.dataEnumType.DATETIME_PAST) {
      return new Date(value);
    } else {
      return value;
    }
  }


  /**
   * For adding more docs
   * in upload docs
   */
  private addMoreDoc(field: IUploadDocField = <IUploadDocField>{}) {
    return this.formBuilder.group({
      'label': [field.label || '', [Validators.required]],
      'value': [field.value || '', [Validators.required]],
      'expiry_date': [field.expiry_date ? new Date(field.expiry_date) : '', [Validators.required]]
    })
  }

  /**
   * on Cancel of add merchant
   */
  public onCancelClick() {
    this.commonService.emitDataToParentWindow('app.merchant');
    this.router.navigate(['merchant/list']);
  }

  /**
   * To display geofence popup 
   * only when mandatory fields are 
   * filled
   */

  public onServiceRegionClick() {
    if (!this.addMerchantForm.valid) {
      this.commonService.validateAllFormFields(this.addMerchantForm);
      this.customMessage.showMessage({ severity: "error", summary: "error", detail: 'Please fill the required fields for creating service area.' });

    } else {
      this.showGeofencePopup = true;
    }

  }



  /**
   * On cancel click of
   * geofence popup
   */
  public onPopupCancelClick() {
    this.showGeofencePopup = false;
  }



  /**
   * Add new custom field
   */
  public addMoreFields() {
    (this.additionalFieldForm.get('items') as FormArray).push(this.addMoreItem());
    //((this.additionalFieldForm.get('items') as FormArray).controls[0] as FormGroup).controls.data_type.patchValue(this.customFieldsOption[0]);
  }

  /**
   * Delete a custom field
   * @param index index of formArray
   */
  public deleteAdditionalDoc(index) {
    if (index != 0 || (this.additionalFieldForm.get('items') as FormArray).length > 1) {
      (this.additionalFieldForm.get('items') as FormArray).removeAt(index);
    }

  }

  /**
   * Add new row for 
   * upload doc
   */
  public uploadMoreDocuments() {
    (this.uploadDocForm.get('uploadDoc') as FormArray).push(this.addMoreDoc());
  }

  /**
   * delete a document row
   * @param index index of formArray
   */
  public deleteUploadDoc(index) {
    if (index != 0 || (this.uploadDocForm.get('uploadDoc') as FormArray).length > 1) {
      (this.uploadDocForm.get('uploadDoc') as FormArray).removeAt(index);
    }
  }

  /**
   * For uploading a file
   * @param fileInput 
   */
  public onImageSelectionClick(fileInput) {
    fileInput.click();
  }

  public onImageSelectionClick2(fileInput2) {
    fileInput2.click();
  }


  public onFileInput(event, index) {
    if (event.target.files[0]) {
      const formData: FormData = new FormData();
      formData.append('merchant_docs', (event.target.files[0]));
      console.log(event.target.files[0].name);
      var fileName = event.target.files[0].name;
      this.merchantService.uploadMerchantDoc(formData).subscribe(
        response => {
          console.log(response);
          ((this.uploadDocForm.get('uploadDoc') as FormArray).controls[index] as FormGroup).controls.value.setValue(response.data);
        },
        error => {
          console.log(error);
        });

    }
    event.target.value = '';
  }

  public onFileInput2(event, index) {
    if (event.target.files[0]) {
      const formData: FormData = new FormData();
      console.log(event.target.files['0'].name);
      const fg = ((this.additionalFieldForm.get('items') as FormArray).controls[index] as FormGroup);
      const ctrl = fg.get('value');
      ctrl.patchValue(event.target.files['0'].name);
    }
    event.target.value = '';
  }

  /**
   * On submit click of merchant
   */
  public addMerchantSubmit() {

    if (!this.addMerchantForm.valid) {
      return this.commonService.validateAllFormFields(this.addMerchantForm);

    } else {

      // if (this.geoFenceData.length == 0) {
      //   this.customMessage.showMessage({ severity: "error", summary: "error", detail: 'Geofence service area is required.' });
      //   return;
      // }



      // if (!this.additionalFieldForm.valid && this.enableCustomFieldSwitch) {
      //   return this.commonService.validateAllFormFields(this.additionalFieldForm);
      // }
      // if (!this.uploadDocForm.valid && this.enableCustomFieldSwitch) {
      //   return this.commonService.validateAllFormFields(this.uploadDocForm);
      // }


      this.commonService.showLoader = true;

      //creation of request body
      // if (this.enableCustomFieldSwitch) {
      //   this.generateCustomFields();
      // }

      let data = this.generateMerchantRequestBody();
      console.log(data, '?????')

      if (!this.merchantEditMode) {
        this.merchantService.addMerchant(data).subscribe(
          (response) => {
            this.commonService.showLoader = false;
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
            this.commonService.emitDataToParentWindow('', { data }, 'added_merchant_successfully');
            this.router.navigate(['merchant/list']);
            console.log('response' + response);
          },
          error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error);
          });

      } else {
        this.merchantService.editMerchant(data).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
            this.commonService.emitDataToParentWindow('', { data }, 'edit_merchant_successfully');
            this.router.navigate(['merchant/list']);
            console.log(response);
          },
          error => {
            this.commonService.showLoader = false;
            this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
            console.log(error);
          });
      }
    }
  }

  /**
   * on gecoding latlng event
   * @param latlng google.maps.LatLng object
   */
  public onLatLngEvent(latlng: google.maps.LatLng) {
    console.log(latlng.lat(), latlng.lng())
  }
  /**
   * Function to generate merchant req body
   * before edit/ add merchant api hit
   */
  private generateMerchantRequestBody() {
    let countryData: Country = this.phoneInputField.selectedCountry;
    this.commonService.get_image_format(this.addMerchantForm.controls.image.value).subscribe(res => {
      this.addMerchantForm.controls.image.patchValue(res);
    });
    const data = {
      name: this.addMerchantForm.controls.fullname.value.trim(),
      first_name: this.addMerchantForm.controls.fullname.value.trim().split(' ')[0],
      last_name: this.addMerchantForm.controls.fullname.value.trim().split(' ')[1] || '',
      // password: this.addMerchantForm.controls.password.value,
      company_address: this.addMerchantForm.controls.companyAddress.value || '',
      company_name: this.addMerchantForm.controls.companyName.value || '',
      company_registration_number: this.addMerchantForm.controls.registrationNumber.value || '',
      company_website: this.addMerchantForm.controls.companyWebsite.value || '',
      company_structure: this.addMerchantForm.controls.companyStructure.value || '',
      company_price: this.addMerchantForm.controls.companyPrice.value,
      email: this.addMerchantForm.controls.email.value,
      merchant_image: this.addMerchantForm.controls.image.value,
      realm_id: this.addMerchantForm.controls.realm_id.value || '',
      consumer_key: this.addMerchantForm.controls.consumer_key.value || '',
      consumer_secret: this.addMerchantForm.controls.consumer_secret.value || '',



      timezone: new Date().getTimezoneOffset(),
      phone_directory: {
        phone: (this.addMerchantForm.controls.phone.value.startsWith('+')) ? `${this.addMerchantForm.controls.phone.value.toString()}` : `+${countryData.dialCode.toString()}${this.addMerchantForm.controls.phone.value.toString()}`,
        country_code: countryData.countryCode
      },
      merchant_permission: {
        view_task: 0,
        add_task: +(this.addMerchantForm.controls.permission as FormGroup).controls.createTask.value,
        edit_task: +(this.addMerchantForm.controls.permission as FormGroup).controls.editTask.value,
        add_team: 0,
        view_team: 0,
        // add_region: +(this.addMerchantForm.controls.permission as FormGroup).controls.createGeofence.value,
        add_region: 0,
        view_region: 0,
        add_agent: +(this.addMerchantForm.controls.permission as FormGroup).controls.createAgent.value,
        view_agent: 0,
        add_manager: +(this.addMerchantForm.controls.permission as FormGroup).controls.addManager.value,
        add_catalogue: +(this.addMerchantForm.controls.permission as FormGroup).controls.addCatalogue.value,
        add_software: +(this.addMerchantForm.controls.permission as FormGroup).controls.addSoftware.value,
        technician_schedule: +(this.addMerchantForm.controls.permission as FormGroup).controls.technician_schedule.value,
        profile: +(this.addMerchantForm.controls.permission as FormGroup).controls.profile.value,
        templates: +(this.addMerchantForm.controls.permission as FormGroup).controls.templates.value,


        geofence: +(this.addMerchantForm.controls.permission as FormGroup).controls.geofence.value,
        teams: +(this.addMerchantForm.controls.permission as FormGroup).controls.teams.value,
        spareParts: +(this.addMerchantForm.controls.permission as FormGroup).controls.spareParts.value,
        quickBooks: +(this.addMerchantForm.controls.permission as FormGroup).controls.quickBooks.value,
        autoAllocation: +(this.addMerchantForm.controls.permission as FormGroup).controls.autoAllocation.value,
        cancellation_policy:+(this.addMerchantForm.controls.permission as FormGroup).controls.cancellation_policy.value,
        route:+(this.addMerchantForm.controls.permission as FormGroup).controls.route.value,

        payments: +(this.addMerchantForm.controls.permission as FormGroup).controls.payments.value,



        technician_skill: +(this.addMerchantForm.controls.permission as FormGroup).controls.addCatalogue.value,
        is_merchant_addOn_active: +(this.addMerchantForm.controls.permission as FormGroup).controls.addCatalogue.value,

        add_video_links: +(this.addMerchantForm.controls.permission as FormGroup).controls.addVideo.value,
        add_custom_notifications: +(this.addMerchantForm.controls.permission as FormGroup).controls.addNotification.value,
        view_manager: 0,
        view_fleet_avalibility: 0,
        edit_fleet_avalibility: 0
      },
      // commission_percentage: parseFloat((this.addMerchantForm.controls.commission as FormGroup).controls.commissionText.value),
      commission_percentage: 0,
    };

    if ((this.addMerchantForm.controls.password.value)) {
      data['password'] = this.addMerchantForm.controls.password.value;
    }
   
    if (this.merchantEditMode) {
      data['merchant_id'] = +this.merchant_id;
    }

    if (this.enableCustomFieldSwitch) {
      data['custom_fields'] = this.customFieldsArray;
    }

    if (this.geoFenceData && this.geoFenceData[0]) {
      data['geofence'] = this.geoFenceData[0];
    }

    return data;
  }

  /**
   * For generating custom_fields
   * array of objects
   */
  private generateCustomFields() {
    this.customFieldsArray = [];
    (this.additionalFieldForm.get('items') as FormArray).controls.forEach((fg: FormGroup, index) => {
      let newControl: ICustomField = <ICustomField>{};
      newControl.label = fg.controls.label.value || '';
      newControl.data_type = fg.controls.data_type.value.label;
      newControl.display_name = fg.controls.display_name.value || '';
      newControl.value = fg.controls.value.value;
      newControl.required = (fg.controls.mandatory.value == "") ? false : true;
      newControl.order = index,
        newControl.search_enable = true;
      //Check for multi-select single-select
      if (newControl.data_type == 'Single-Select' || newControl.data_type == 'Multi-Select') {
        newControl.allowed_values = [fg.controls.value.value];
      } else {
        newControl.allowed_values = [];
      }
      newControl.on_signup = true;
      newControl.language = '';

      this.customFieldsArray.push(newControl);
    });

    this.genrateUploadCustomField();
  }

  /**
  * For generating custom_fields
  * array of objects
  */
  private genrateUploadCustomField() {
    (this.uploadDocForm.get('uploadDoc') as FormArray).controls.forEach((fg: FormGroup, index) => {
      let newControl: IUploadDocField = <IUploadDocField>{};
      newControl.label = fg.controls.label.value || '';
      newControl.data_type = 'document';
      newControl.display_name = fg.controls.label.value || '';
      newControl.value = fg.controls.value.value;
      newControl.required = true,
        newControl.order = index,
        newControl.search_enable = true;
      newControl.expiry_date = fg.controls.expiry_date.value || '';
      this.customFieldsArray.push(newControl);
    });
  }

  private requestCountryCode() {
    this.merchantService.requestCountryCode()
      .subscribe(response => {
        if (response && response.status == 200 && response.data) {
          if (!this.merchantEditMode) {
            this.phoneInputField.setCountryCode(response.data.country_code.toLowerCase());
          }
        }
      },
        error => {

        });
  }


  /**
   * Pasdword eye icon 
   * functionality
   */
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
   * on Select all of permissions
   * @param event check/uncheck event
   */
  public onAllPermissions(event) {
    let keys = Object.keys((this.addMerchantForm.controls.permission as FormGroup).controls);
    keys.forEach((field: any) => {
      const control = (this.addMerchantForm.controls.permission as FormGroup).get(field);
      if (control instanceof FormControl) {
        if (event.target.checked) {
          control.setValue(true);
        } else {
          control.setValue(false);
        }
      }
    })

  }

  onPermissionsChange() {
    const permissionForm = this.addMerchantForm.controls['permission'];
    if (permissionForm['controls'].createTask.value && permissionForm['controls'].createAgent.value &&
      permissionForm['controls'].addManager.value  && permissionForm['controls'].addCatalogue.value && 
       permissionForm['controls'].editTask.value && permissionForm['controls'].addVideo.value && 
       permissionForm['controls'].addNotification.value && permissionForm['controls'].addSoftware.value && permissionForm['controls'].geofence.value
       && permissionForm['controls'].teams.value && permissionForm['controls'].spareParts.value && permissionForm['controls'].quickBooks.value
       && permissionForm['controls'].autoAllocation.value && permissionForm['controls'].technician_schedule.value && permissionForm['controls'].payments.value
       && permissionForm['controls'].profile.value   && permissionForm['controls'].templates.value && permissionForm['controls'].cancellation_policy.value && 
       permissionForm['controls'].route.value) {
      permissionForm['controls'].selectAll.setValue(true);
    }
    else {
      permissionForm['controls'].selectAll.setValue(false);
    }
  }

  /**
   * to get all the data 
   * related to merchant selected to be
   * edited
   * @param merchantID string
   */
  private getMerchantsData(merchantID: string) {
    this.commonService.showLoader = true;
    this.merchantService.getMerchantsData(+merchantID).subscribe(
      response => {
        this.commonService.showLoader = false;
        this.setEditMerchantValues(response.data);
      },
      error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error);
      });
  }

  /**
   * Set values of all fields from response data
   * @param data response from get_merchant_data
   */
  private setEditMerchantValues(data) {
    if (data.phone_directory.phone.substring(0, 2) == '+1') {
      data.phone_directory.phone = data.phone_directory.phone.replace('+1', '')
    } else {
      data.phone_directory.phone = data.phone_directory.phone.replace('+91', '')
    }
    this.addMerchantForm.controls.password.clearValidators();
    this.addMerchantForm.controls.password.updateValueAndValidity();
    
    this.addMerchantForm.setValue({
      'fullname': data.first_name + ' ' + data.last_name,
      'phone': (data.phone_directory.phone != null) ? data.phone_directory.phone.replace(data.phone_directory.country_code.toLowerCase(), '') : '',
      'email': data.email,
      'companyAddress': data.company_address,
      'password': '',
      'companyName': data.company_name,
      'registrationNumber': data.company_registration_number,
      'companyWebsite': data.company_website,
      'companyStructure': data.company_structure,
      'companyPrice': data.company_price,
      'image': data.merchant_image,
      'realm_id':data.realm_id || '',
      'consumer_key':data.consumer_key || '',
      'consumer_secret':data.consumer_secret || '',

      'permission': {
        'createTask': data.merchant_permission ? !!data.merchant_permission.add_task : 0,
        'createAgent': data.merchant_permission ? !!data.merchant_permission.add_agent : 0,
        // 'createGeofence': data.merchant_permission ? !!data.merchant_permission.add_region : 0,
        'addManager': data.merchant_permission ? !!data.merchant_permission.add_manager : 0,
        'addCatalogue': data.merchant_permission ? data.merchant_permission.add_catalogue : 0,
        'addSoftware': data.merchant_permission ? data.merchant_permission.add_software : 0,
        'profile': data.merchant_permission ? data.merchant_permission.profile : 0,
        'templates': data.merchant_permission ? data.merchant_permission.templates : 0,

        'payments': data.merchant_permission ? data.merchant_permission.payments : 0,

        'geofence': data.merchant_permission ? data.merchant_permission.geofence : 0,
        'teams': data.merchant_permission ? data.merchant_permission.teams : 0,
        'spareParts': data.merchant_permission ? data.merchant_permission.spareParts : 0,
         'technician_schedule': data.merchant_permission ? data.merchant_permission.technician_schedule : 0,
        'quickBooks': data.merchant_permission ? data.merchant_permission.quickBooks : 0,
        'autoAllocation': data.merchant_permission ? data.merchant_permission.autoAllocation : 0,
        'cancellation_policy': data.merchant_permission ? data.merchant_permission.cancellation_policy : 0,
        'route': data.merchant_permission ? data.merchant_permission.route : 0,
        'techskill': data.merchant_permission ? data.merchant_permission.add_catalogue : 0,
        'addonServices': data.merchant_permission ? data.merchant_permission.add_catalogue : 0,
        'editTask': data.merchant_permission ? !!data.merchant_permission.edit_task : 0,
        'addVideo': data.merchant_permission ? !!data.merchant_permission.add_video_links : 0,
        'addNotification': data.merchant_permission ? !!data.merchant_permission.add_custom_notifications : 0,
        // 'viewCustomer': true,
        'selectAll': data.merchant_permission ? (!!data.merchant_permission.add_task && !!data.merchant_permission.add_agent && !!data.merchant_permission.add_manager && !!data.merchant_permission.edit_task && !!data.merchant_permission.add_custom_notifications && !!data.merchant_permission.add_video_links) : false
      },
      // 'commission': {
      //   'commissionText': data.commission_percentage
      // }
    });
   
    this.phoneInputField.setCountryCode(data.phone_directory.country_code.toLowerCase());
    this.addMerchantForm.controls['password'].setValidators([]);
    //Additional fields form
    if (data.custom_fields.length > 0) {
      (this.uploadDocForm.get('uploadDoc') as FormArray).removeAt(0);
      (this.additionalFieldForm.get('items') as FormArray).removeAt(0);
      this.enableCustomFieldSwitch = true;
      data.custom_fields.forEach((field: any) => {
        if (field.data_type == 'document') {
          (this.uploadDocForm.get('uploadDoc') as FormArray).push(this.addMoreDoc(field));
        } else {
          (this.additionalFieldForm.get('items') as FormArray).push(this.addMoreItem(field));
        }

      });
    } else {
      this.enableCustomFieldSwitch = false;
    }

    if (data.geofence && data.geofence[0] && (data.geofence[0].region_data.length > 0)) {
      let regionData: any = data.geofence[0].region_data[0];
      data.geofence[0].region_data = regionData.map(item => `${item.x} ${item.y}`).join(',');
    }
    //CHANGE
    if (data.geofence && data.geofence[0]) {
      this.geoFenceData[0] = {
        region_name: data.geofence[0].region_name,
        region_description: data.geofence[0].region_description,
        region_id: data.geofence[0].region_id,
        region_data: data.geofence[0].region_data
      }
    }
  }

  public onDataTypeChange(index) {
    const fg = ((this.additionalFieldForm.get('items') as FormArray).controls[index] as FormGroup);
    fg.setControl('value', new FormControl())
  }

  public enableCustomField(event) {
    if (event.target.checked) {
      this.enableCustomFieldSwitch = true;
    } else {
      this.enableCustomFieldSwitch = false;
    }
  }
}