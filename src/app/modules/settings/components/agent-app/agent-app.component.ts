import { Component, OnInit,ViewChild,ElementRef, } from '@angular/core';
import { CommonService } from '../../../../services/common.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { IFields, IFleetSignupBody } from '../../interfaces/interfaces';
import { GaService } from '../../../../services/ga.service';
import { WorkflowType } from '../../enums/enum';
import { constants } from '../../../../../constants/constants';
import { CustomValidators } from '../../../../../utils/custom.validators';
import { variable } from '@angular/compiler/src/output/output_ast';

/**
 * Validator function to enable disable switch
 * @param siblingName name of the control
 * to be enabled/disabled
 */
export const statusUpdate = (siblingName: string): ValidatorFn => (control: AbstractControl) => {
  if (control.parent) {
    if (!control.value) {
      (control.parent.controls[siblingName] as FormControl).patchValue(false);
      control.parent.controls[siblingName].disable();
    }
    else {
      control.parent.controls[siblingName].enable();
    }
  }
  return null;
}

@Component({
  selector: 'app-agent-app',
  templateUrl: './agent-app.component.html',
  styleUrls: ['./agent-app.component.scss', '../preferences/preferences.component.scss']
})


export class AgentAppComponent implements OnInit {

  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('fileInput1') fileInput1: ElementRef;
  @ViewChild('fileInput2') fileInput2: ElementRef;
  @ViewChild('fileInput4') fileInput4: ElementRef;
  @ViewChild('fileInput5') fileInput5: ElementRef;


  private workflowEnum = WorkflowType;
  private receivedTeamLevelAutoAssign: boolean = false;
  public disableMultipleRequests: boolean;
  public form: FormGroup;
  public fleetSignUpForm: FormGroup;
  public reminderTimeForm: FormGroup;
  public privacyForm: FormGroup;
  public templateOptions;
  public autoAssignEnabled: boolean;
  file;
  is_pdf:boolean;
  is_pdf2:boolean;

  image_changed:boolean=false;
  image_changed2:boolean=false;

  weapon_license_sample='https://atmtechnow.s3.amazonaws.com/dev/task_images/ZytV1568785692259-plus.png';
  training_certificate_sample='https://atmtechnow.s3.amazonaws.com/dev/task_images/ZytV1568785692259-plus.png';

  weapon_license;
  training_certificate;
  public privacyLinkUrl :string;
  public ndaLinkUrl :string;
  public termsConditionLinkUrl :string;
  public privacyFileName:string= "Choose a file" ;
  public ndaFileName:string= "Choose a file" ;
  public termsConditionsFileName:string= "Choose a file" ;
  constructor(public commonService: CommonService, private formBuilder: FormBuilder,
    private settingsService: SettingsService, private customMessage: CustomMessageService, private gaService: GaService) { }

  ngOnInit() {
    window['x'] = this;

    this.initForm();
    this.form.controls.addOnActivateValue.setValue(!!this.commonService.loginData.on_demand);
    this.getUserLayoutFields();
    if (this.commonService.loginData.fleet_signup) {
      this.getAllTemplates();
      this.initFleetSignupForm();
      this.getFleetSignupAddons();
    }
    this.getReminderTime();
    this.setMultipleRequestsCheckBox();
  }
  setMultipleRequestsCheckBox(){
    this.disableMultipleRequests = !!this.commonService.loginData.block_agent_availability;

  }
  /**
   * On Click (disable multiple request)
   * passing event as param to
   * get the current status(checked/un-checked)
   * @param e
   */
  onDisableMultipleRequests(e: Event) {
    const status: boolean = (e.target as HTMLInputElement).checked;
    this.blockAgentAvailability(status);
  }

  /**
   * Initialization of form
   */
  initForm() {
    this.form = this.formBuilder.group({
      'acknowledgement': ['', Validators.required],
      'milestone': this.formBuilder.group({
        'arrived': [true],
        'cancel_btn': [false],
        'failed_btn': [false],
        'auto_arrival_distance_cb': [false],
        'auto_arrival_distance': ['', [Validators.pattern(constants.onlyNumbers)]]
      }),
      'addOnActivateValue': [''],
      'action_block': this.formBuilder.group({
        'notes': this.formBuilder.group({
          'value': [false, [statusUpdate('required')]],
          'required': [false]
        }),
        'images': this.formBuilder.group({
          'value': [false, [statusUpdate('required')]],
          'required': [false]
        }),
        'signature': this.formBuilder.group({
          'value': [false, [statusUpdate('required')]],
          'required': [false]
        }),
        'barcode': this.formBuilder.group({
          'value': [false, [statusUpdate('required')]],
          'required': [false]
        }),
        'image_caption': this.formBuilder.group({
          'value': [false, [statusUpdate('required')]],
          'required': [false]
        }),
        'videos': this.formBuilder.group({
          'value': [false, [statusUpdate('required')]],
          'required': [false]
        }),
        'slider': this.formBuilder.group({
          'value': ['']
        })
      }),
      'confirm': this.formBuilder.group({
        'value': ['']
      }),
      'fleet_notification': this.formBuilder.group({
        'value': ['']
      }),
      'masking': this.formBuilder.group({
        'value': ['']
      }),
      'disable_rating': this.formBuilder.group({
        'value': ['']
      }),
      'single_tracking': this.formBuilder.group({
        'value': ['']
      }),
      'team_level_auto_assignment': this.formBuilder.group({
        'value': ['']
      }),
      'on_delivery_disabled': this.formBuilder.group({
        'value': ['']
      }),
    });
  }


  /**
   * Function for getting initial
   * data/values regarding form fields by calling
   * api /get_user_layout_fields
   */
  getUserLayoutFields() {
    const actionType = 1
    this.settingsService.getUserLayoutFields(actionType).subscribe(
      response => {
        const resp: IFields[] = response.data["0"].fields.app_optional_fields;
        this.autoAssignEnabled = !!response.data["0"].auto_assign.is_enabled || false;

        //setting values in form
        (resp).forEach((el: IFields) => {
          switch (el.label) {
            case 'notes':
              (this.form.controls.action_block as FormGroup).controls.notes.setValue({
                'value': !!el.value,
                'required': !!el.value ? !!el.required : false
              });
              break;
            case 'images':
              (this.form.controls.action_block as FormGroup).controls.images.setValue({
                'value': !!el.value,
                'required': !!el.value ? !!el.required : false
              });
              break;
            case 'signature':
              (this.form.controls.action_block as FormGroup).controls.signature.setValue({
                'value': el.value,
                'required': !!el.value ? !!el.required : false
              });
              break;
            case 'barcode':
              (this.form.controls.action_block as FormGroup).controls.barcode.setValue({
                'value': !!el.value,
                'required': !!el.value ? !!el.required : false
              });
              break;
            case 'images_caption':
              (this.form.controls.action_block as FormGroup).controls.image_caption.setValue({
                'value': !!el.value,
                'required': !!el.value ? !!el.required : false
              });
              break;
            case 'videos':
              (this.form.controls.action_block as FormGroup).controls.videos.setValue({
                'value': !!el.value,
                'required': !!el.value ? !!el.required : false
              });
              break;
            case 'slider':
              (this.form.controls.action_block as FormGroup).controls.slider.setValue({
                'value': !!el.value,
              });
              break;
            case 'accept':
              this.form.controls.acknowledgement.setValue((el.value).toString());
              break;
            case 'arrived':
              (this.form.controls.milestone as FormGroup).controls.arrived.setValue(!!el.value);
              break;
            case 'cancel_btn':
              (this.form.controls.milestone as FormGroup).controls.cancel_btn.setValue(!!el.value);
              break;
            case 'failed_btn':
              (this.form.controls.milestone as FormGroup).controls.failed_btn.setValue(!!el.value);
              break;
            case 'confirm':
              this.form.controls.confirm.setValue({
                'value': !!el.value,
              });
              break;
            case 'fleet_notification':
              this.form.controls.fleet_notification.setValue({
                'value': !!el.value,
              });
              break;
            case 'masking':
              this.form.controls.masking.setValue({
                'value': !!el.value,
              });
              break;
            case 'disable_rating':
              this.form.controls.disable_rating.setValue({
                'value': !!el.value,
              });
              break;
            case 'single_tracking':
              this.form.controls.single_tracking.setValue({
                'value': !!el.value,
              });
              break;
            case 'team_level_auto_assignment':
              this.receivedTeamLevelAutoAssign = true;
              this.form.controls.team_level_auto_assignment.setValue({
                'value': !!el.value,
              });
              break;
            case 'is_delivery_disabled':
              this.form.controls.on_delivery_disabled.setValue({
                'value': !!el.value,
              });
              break;
            case 'auto_arrival_distance': {
              if (el.value && el.value !== -1) {
                (this.form.controls.milestone as FormGroup).controls.auto_arrival_distance.setValue(el.value);
                (this.form.controls.milestone as FormGroup).controls.auto_arrival_distance_cb.setValue(true);
              }
              break;
            }


          }

        });
      },
      error => {
        this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
      });
  }

  /**
   * Function to hit API
   * to activate or deactivate agent
   * @param activeStatus checked/un-checked disable multiple req
   */
  blockAgentAvailability(activeStatus: boolean) {
    this.commonService.showLoader = true;
    const id = 45;
    this.settingsService.changeUserAddon(id, activeStatus)
      .subscribe(response => {
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
        this.commonService.loginData.block_agent_availability = +activeStatus;
       
        // $cookieStore.put( 'block_agent_availability', activate);
      }, error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error.error);
      })
  }


  /**
   * Initialization of fleet signup form
   */
  initFleetSignupForm() {
    this.fleetSignUpForm = this.formBuilder.group({
      'auto_verify_signup': [''],
      'fleet_signup_info': ['', Validators.maxLength(140)],
      'is_tags_enabled': [''],
      'is_team_enabled': [''],
      'is_editable': [''],
      'selected_template': [''],
      'signup_template_layout_type': [''],
      'signup_template_name': ['']
    });
    this.reminderTimeForm = this.formBuilder.group({
      'reminder_time':['', [Validators.required, Validators.pattern(constants.onlyNumbers)]]
    })
    this.privacyForm = this.formBuilder.group({
      'fleet_privacy_pdf':['',Validators.required],
      'fleet_nda_pdf':['',Validators.required],
      'fleet_tnc_link':['',Validators.required]
    })

  }


  /**
   * Function to get all template options for
   * fleet signup templates (dropdown options)
   */
  getAllTemplates() {
    this.settingsService.getAllLayoutTemplateNames().subscribe(
      response => {
        if (response.data.length) {
          this.templateOptions = response.data;
        } else {
          this.templateOptions = [];
        }
        //to append select template in dropdown options
        const obj = {
          template: "Select Template", layout_type: -1
        };
        this.templateOptions.unshift(obj);
      },
      error => {
        console.log(error);
      });
  }


  /**
   * On updating the fleet signup form
   * and sending data a/c values
   * entered in form
   */
  onUpdateFleetSignup() {
    this.commonService.showLoader = true;
    const data: IFleetSignupBody = this.createFleetSignupBodyToSend();
    this.settingsService.activateFleetSignup(data).subscribe(
      response => {
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
      },
      error => {
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
      });
  }

  /**
   * create data to send on updateFleetSignup
   * @returns object of type IFleetSignupBody
   */
  private createFleetSignupBodyToSend(): IFleetSignupBody {
    return {
      action: 1,
      auto_verify_signup: +this.fleetSignUpForm.controls.auto_verify_signup.value || 0,
      fleet_signup_info: this.fleetSignUpForm.controls.fleet_signup_info.value || '',
      is_tags_enabled: +this.fleetSignUpForm.controls.is_tags_enabled.value || 0,
      is_team_enabled: +this.fleetSignUpForm.controls.is_team_enabled.value || 0,
      is_editable: +this.fleetSignUpForm.controls.is_editable.value || 0,
      signup_template_layout_type: this.fleetSignUpForm.controls.selected_template.value.layout_type,
      signup_template_name: this.fleetSignUpForm.controls.selected_template.value.template || '',
    };
  }

  /**
   * On change of each element(checkbox/radio/switch) of layout
   * we update the layout user fields
   */
  updateUserLayout() {

    //ga send according to workflow type
    if (this.commonService.loginData.layout_type == this.workflowEnum.PICKUP_DELIVERY) {
      this.gaService.emitEvent('v3_app_tookanapp_business_type', 'b_type_pick_up', 'b_type_pick_up');
    } else if (this.commonService.loginData.layout_type == this.workflowEnum.APPOINTMENT) {
      this.gaService.emitEvent('v3_app_tookanapp_business_type', 'b_type_appointment', 'b_type_appointment');
    } else if (this.commonService.loginData.layout_type == this.workflowEnum.FIELD_WORKFORCE) {
      this.gaService.emitEvent('v3_app_tookanapp_business_type', 'b_type_field_workforce', 'b_type_field_workforce');
    }
    //forming current scenario
    const actionType = 1;
    const data: Array<IFields> = this.createLayoutFieldsToSend();
    if (this.form.valid) {
      this.commonService.showLoader = true;
      this.settingsService.updateUserLayoutField(data, actionType).subscribe(
        response => {
          this.commonService.showLoader = false;
          this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
        },
        error => {
          this.commonService.showLoader = false;
          this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
        });
    }
  }

  /**
   * create fields to send on update action
   * @returns IFields[]
   */
  private createLayoutFieldsToSend(): IFields[] {
    let requestDataFields: IFields[] = [
      {
        label: 'accept',
        value: this.form.controls.acknowledgement.value
      },
      {
        label: 'notes',
        value: +((this.form.controls.action_block as FormGroup).controls.notes as FormGroup).controls.value.value,
        required: +((this.form.controls.action_block as FormGroup).controls.notes as FormGroup).controls.required.value
      },
      {
        label: 'images',
        value: +((this.form.controls.action_block as FormGroup).controls.images as FormGroup).controls.value.value,
        required: +((this.form.controls.action_block as FormGroup).controls.images as FormGroup).controls.required.value
      },
      {
        label: 'barcode',
        value: +((this.form.controls.action_block as FormGroup).controls.barcode as FormGroup).controls.value.value,
        required: +((this.form.controls.action_block as FormGroup).controls.barcode as FormGroup).controls.required.value
      },
      {
        label: 'signature',
        value: +((this.form.controls.action_block as FormGroup).controls.signature as FormGroup).controls.value.value,
        required: +((this.form.controls.action_block as FormGroup).controls.signature as FormGroup).controls.required.value
      },
      {
        label: 'images_caption',
        value: +((this.form.controls.action_block as FormGroup).controls.image_caption as FormGroup).controls.value.value,
        required: +((this.form.controls.action_block as FormGroup).controls.image_caption as FormGroup).controls.required.value
      },
      {
        label: 'videos',
        value: +((this.form.controls.action_block as FormGroup).controls.videos as FormGroup).controls.value.value,
        required: +((this.form.controls.action_block as FormGroup).controls.videos as FormGroup).controls.required.value
      },
      {
        label: 'slider',
        value: +((this.form.controls.action_block as FormGroup).controls.slider as FormGroup).controls.value.value,
      },
      { label: 'arrived', value: +(this.form.controls.milestone as FormGroup).controls.arrived.value },
      { label: 'cancel_btn', value: +(this.form.controls.milestone as FormGroup).controls.cancel_btn.value },
      { label: 'failed_btn', value: +(this.form.controls.milestone as FormGroup).controls.failed_btn.value },
      { label: 'confirm', value: +(this.form.controls.confirm.value.value) },
      { label: 'fleet_notification', value: +(this.form.controls.fleet_notification.value.value) },
      { label: 'masking', value: +(this.form.controls.masking.value.value) },
      { label: 'disable_rating', value: +(this.form.controls.disable_rating.value.value) },
      { label: 'single_tracking', value: +(this.form.controls.single_tracking.value.value) },
      {
        label: 'auto_arrival_distance',
        value: (+((this.form.controls.milestone as FormGroup).controls.auto_arrival_distance_cb.value) && +(this.form.controls.milestone as FormGroup).controls.arrived.value && +(this.form.controls.milestone as FormGroup).controls.auto_arrival_distance.value) ? +(this.form.controls.milestone as FormGroup).controls.auto_arrival_distance.value : -1
      }

    ];

    if (this.receivedTeamLevelAutoAssign) {
      const obj = {
        label: 'team_level_auto_assignment',
        value: +(this.form.controls.team_level_auto_assignment.value.value)
      };
      requestDataFields.push(obj);
    }

    if (this.commonService.loginData.layout_type == 0) {
      
      const obj = { label: 'is_delivery_disabled', value: +(this.form.controls.on_delivery_disabled.value.value) };
      requestDataFields.push(obj);
    }
    return requestDataFields;
  }

  /**
   * On template selection enabling
   * and disabling of tags_enabled switch
   * in fleet-signup
   */
  onTemplateSelection() {
    if (this.fleetSignUpForm.controls.selected_template.value.template == 'Select Template') {
      this.fleetSignUpForm.controls.is_editable.setValue(false);
      this.fleetSignUpForm.controls.is_editable.disable();
    } else {
      this.fleetSignUpForm.controls.is_editable.enable();
    }
  }

  /**
   * fetch fleet signup data and setting
   */
  getFleetSignupAddons() {
    this.settingsService.viewFleetSignupAddon().subscribe(
      response => {
        if (response.data) {
          this.setFleetSignupFormValues(this.fleetSignUpForm, response.data);
        }
      },
      error => {
        console.log(error);
      });
  }
  getReminderTime(){
      this.settingsService.getReminderTime().subscribe(
        response => {
          this.reminderTimeForm.setValue({
            'reminder_time': response.data.notification_minutes || 30,
          })
          this.privacyForm.setValue({
            'fleet_privacy_pdf': response.data.fleet_privacy_policy_link,
            'fleet_nda_pdf': response.data.fleet_nda_link,
            'fleet_tnc_link': response.data.fleet_tnc_link,
          })

          if(response.data.fleet_weapon_link)
          {
            this.weapon_license=response.data.fleet_weapon_link;
            if(this.weapon_license.includes('pdf'))
            {
              this.weapon_license_sample='https://atmtechnow.s3.amazonaws.com/dev/task_images/QYZy1568785850018-pdficon.png';
            
            }
            else
            {
              this.weapon_license_sample=response.data.fleet_weapon_link;
        
            }
            this.image_changed=true;
          }
          else{
            this.weapon_license_sample='https://atmtechnow.s3.amazonaws.com/dev/task_images/ZytV1568785692259-plus.png';
          }



          if(response.data.fleet_training_certificate)
          {
            this.training_certificate=response.data.fleet_training_certificate;
            if(this.training_certificate.includes('pdf'))
            {
              this.training_certificate_sample='https://atmtechnow.s3.amazonaws.com/dev/task_images/QYZy1568785850018-pdficon.png';
            
            }
            else
            {
              this.training_certificate_sample=response.data.fleet_training_certificate;
        
            }
            this.image_changed2=true;
          }
          else{
            this.training_certificate_sample='https://atmtechnow.s3.amazonaws.com/dev/task_images/ZytV1568785692259-plus.png';
          }





        

          this.training_certificate=response.data.fleet_training_certificate||'';
          if(this.training_certificate.includes('pdf'))
          {
            this.training_certificate_sample='https://atmtechnow.s3.amazonaws.com/dev/task_images/QYZy1568785850018-pdficon.png';
            this.image_changed2=true;

          }
          else{
            this.training_certificate_sample=response.data.fleet_training_certificate||'';
            this.image_changed2=true;

          }



          this.privacyLinkUrl = response.data.fleet_privacy_policy_link;
          this.privacyFileName = response.data.fleet_privacy_policy_link.split('-')[1];
          this.ndaLinkUrl = response.data.fleet_nda_link;
          this.ndaFileName = response.data.fleet_nda_link.split('-')[1];  
          this.termsConditionLinkUrl = response.data.fleet_tnc_link;
          this.termsConditionsFileName = response.data.fleet_tnc_link.split('-')[1]; 
        }, error => {
          this.commonService.showLoader = false;
          this.commonService.handleError(error);
        });
  }
  onUpdateReminderTime() {
    if (!this.reminderTimeForm.valid)
    return this.commonService.validateAllFormFields(this.reminderTimeForm);
    let reminderTimeData = {
      notification_minutes:''
    };
    reminderTimeData.notification_minutes = this.reminderTimeForm.controls.reminder_time.value;
    this.settingsService.setReminderTime(reminderTimeData).subscribe(
      response => {
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
      },
      error => {
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
      });
  }

  
  /**
   * For setting up values in signup fleet form
   * @param form fleet signup form
   */
  setFleetSignupFormValues(form: FormGroup, signupResponse) {
    let keys = Object.keys(form.controls);
    keys.forEach((field: any) => {
      const control = this.fleetSignUpForm.get(field);
      if (control instanceof FormControl && field != 'selected_template' && field != 'signup_template_layout_type') {
        form.controls[field].setValue(signupResponse[field] || '');
      } else if (control instanceof FormGroup) {
        this.setFleetSignupFormValues(control, signupResponse);
      }
    });

    form.controls['signup_template_layout_type'].setValue(signupResponse['signup_template_layout_type']);
    const obj = {
      template: form.controls.signup_template_name.value,
      layout_type: form.controls.signup_template_layout_type.value,
    };
    form.controls.selected_template.setValue(obj);
    if (form.controls.signup_template_name.value == 'Select Template') {
      form.controls.is_editable.setValue(false);
      form.controls.is_editable.disable();
    }
  }

  addOnActivate(e: Event) {
    const status: boolean = (e.target as HTMLInputElement).checked;
    this.updateAddOnActivate(status);
  }


  previeWeaponLicense()
  {
    console.log('jjj',this.weapon_license);
    window.open(this.weapon_license, "_blank");
  }
  previeTrainingCertificate()
  {
    window.open(this.training_certificate, "_blank"); 
  }

  updateAddOnActivate(activeStatus: boolean) {
    this.commonService.showLoader = true;
    this.settingsService.changeUserAddOnDemand(activeStatus)
      .subscribe(response => {
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
        this.commonService.loginData.on_demand = +activeStatus;
        // $cookieStore.put( 'block_agent_availability', activate);
      }, error => {
        this.commonService.showLoader = false;
        this.form.controls.addOnActivateValue.setValue(false);
        this.commonService.handleError(error);
      })
  }

  public onImageSelectionClick(fileInput) {
    fileInput.click();
  }

  public onImageSelectionClick4(fileInput4) {
    fileInput4.click();
  }
  public onImageSelectionClick5(fileInput5) {
    fileInput5.click();
  }

  public onImageSelectionClick2(fileInput2) {
    fileInput2.click();
  }

  public onImageSelectionClick3(fileInput1) {
    fileInput1.click();
  }

   /**
   * on image upload event change
   * @param event file upload event
   */
  onUpload(event,i) {
    if(i==1){
      this.ndaFileName = event.target.files[0].name;
      const file = event.target.files[0];
      if (file) {
        this.file = file;
        var reader = new FileReader();
        reader.onload = (e: any) => {
          this.privacyForm.controls.fleet_nda_pdf.patchValue(e.target.result);
        }
        reader.readAsDataURL(file);
        let data = new FormData();
        data.append('ref_image', this.file ? this.file : this.privacyForm.controls.fleet_nda_pdf.value);
        this.settingsService.getImageUrl(data).subscribe(
          response => {
            this.ndaLinkUrl = response.data.ref_image;
          }, error => {
            this.commonService.handleError(error)
          });
      }
    }
    else if(i==2){
      this.termsConditionsFileName = event.target.files[0].name;
      const file = event.target.files[0];
      if (file) {
        this.file = file;
        var reader = new FileReader();
        reader.onload = (e: any) => {
          this.privacyForm.controls.fleet_tnc_link.patchValue(e.target.result);
        }
        reader.readAsDataURL(file);
        let data = new FormData();
        data.append('ref_image', this.file ? this.file : this.privacyForm.controls.fleet_tnc_link.value);
        this.settingsService.getImageUrl(data).subscribe(
          response => {
            this.termsConditionLinkUrl = response.data.ref_image;
          }, error => {
            this.commonService.handleError(error)
          });
      }
    }
    else if(i==4){
      this.weapon_license = event.target.files[0].name;
      const file = event.target.files[0];
      if (file) {
        this.file = file;
        var reader = new FileReader();
        reader.onload = (e: any) => {
          this.weapon_license=e.target.result;
          console.log('image',this.file);
           if(this.file.type.includes("pdf"))
           {
             console.log('pdf hai');
             this.is_pdf=true;
             this.weapon_license_sample='https://atmtechnow.s3.amazonaws.com/dev/task_images/QYZy1568785850018-pdficon.png';
             this.image_changed=true;
           }
           else{
             this.is_pdf=false;
           }
          


        }
        reader.readAsDataURL(file);
        let data = new FormData();
        data.append('ref_image', this.file ? this.file : this.weapon_license);
        this.settingsService.getImageUrl(data).subscribe(
          response => {
            this.weapon_license = response.data.ref_image;
            console.log('actual image weee')
            if(!this.is_pdf)
            {
              this.weapon_license_sample = response.data.ref_image;
              this.image_changed=true;


            }
          }, error => {
            this.commonService.handleError(error)
          });
      }
    }


    else if(i==5){
      this.training_certificate = event.target.files[0].name;
      const file = event.target.files[0];
      if (file) {
        this.file = file;
        var reader = new FileReader();
        reader.onload = (e: any) => {
          this.training_certificate=e.target.result;
           if(this.file.type.includes("pdf"))
           {
             this.is_pdf2=true;
             this.training_certificate_sample='https://atmtechnow.s3.amazonaws.com/dev/task_images/QYZy1568785850018-pdficon.png';
             this.image_changed2=true;
           }
           else{
            this.is_pdf2=false;
          }
          


        }
        reader.readAsDataURL(file);
        let data = new FormData();
        data.append('ref_image', this.file ? this.file : this.weapon_license);
        this.settingsService.getImageUrl(data).subscribe(
          response => {
            this.training_certificate = response.data.ref_image;
            if(!this.is_pdf2)
            {
              this.training_certificate_sample = response.data.ref_image;
              this.image_changed2=true;

            }
          }, error => {
            this.commonService.handleError(error)
          });
      }
    }


    else{
      this.privacyFileName = event.target.files[0].name;
      const file = event.target.files[0];
      if (file) {
        this.file = file;
        var reader = new FileReader();
        reader.onload = (e: any) => {
          this.privacyForm.controls.fleet_privacy_pdf.patchValue(e.target.result);
        }
        reader.readAsDataURL(file);
        let data = new FormData();
        data.append('ref_image', this.file ? this.file : this.privacyForm.controls.fleet_privacy_pdf.value);
        this.settingsService.getImageUrl(data).subscribe(
          response => {
            this.privacyLinkUrl = response.data.ref_image;
          }, error => {
            this.commonService.handleError(error)
          });
      }
    }
 
  }

  onUpdatePdfs(){
    if (!this.privacyForm.valid)
    return this.commonService.validateAllFormFields(this.privacyForm);
if(!this.weapon_license)
{
  this.customMessage.showMessage({ severity: "error", summary: "error", detail:'Weapon Licence is required' });
return false;
}
if(!this.training_certificate)
{
  this.customMessage.showMessage({ severity: "error", summary: "error", detail:'Training Certficate is required' });
return false;
}

    this.settingsService.setPrivacyLinks(this.privacyLinkUrl,this.ndaLinkUrl,this.termsConditionLinkUrl,this.weapon_license,this.training_certificate).subscribe(
      response => {
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
      },
      error => {
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
      });
  }










}
