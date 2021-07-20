import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { CommonService } from '../../../../services/common.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { IBroadcastOption } from '../../interfaces/interfaces';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { IAgentFields, IVendorSignup, IFields } from '../../interfaces/interfaces';
import { GaService } from '../../../../services/ga.service';
import { WorkflowType, DropDownType } from '../../enums/enum';
@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss', '../agent-app/agent-app.component.scss']
})

export class PreferencesComponent implements OnInit {

  @ViewChild('fileInput') fileInput: ElementRef;

  private customerRatingFields: Array<IFields> = [];
  private userViewMIssion :number ;
  public customerSignupActive: boolean;
  public customerSignupForm: FormGroup;
  public workflowForm: FormGroup;
  public customerRating: boolean;
  public disableCustomerTeam: boolean;
  public openTrackingLink: boolean;
  public enableAutoAllocationTeamLevel: boolean;
  public agentFields: Array<IAgentFields> = [];
  public autoAllocationData: IBroadcastOption = <IBroadcastOption>{};
  public agentFieldDictionary = {};
  file;
  public errorCodeFile:string= "" ;
  public errorCodes;

  public defaultViewFields;
  public prevStr1 = '';
  public prevStr2 = '';
  public prevStr3 = '';
  public sendStr1 = '';
  public sendStr2 = '';
  public sendStr3 = '';
  public prevField1 = [];
  public prevField2 = [];
  public prevField3 = [];
  public distanceUnit;
  public deafaultView;
  public dashboardLang;
  public trackingLang;
  public templateOptions;
  public distanceOptions = [
    { label: 'Kilometer', value: 'KM' },
    { label: 'Miles', value: 'MILE' }
  ];
  
  public languageOptions = [
    { code: "ar", label: "Arabic" },
    { code: "zh", label: "Chinese" },
    { code: "cs", label: "Czech" },
    { code: "da", label: "Danish" },
    { code: "nl", label: "Dutch" },
    { code: "en", label: "English" },
    { code: "fil", label: "Filipino" },
    { code: "fr", label: "French" },
    { code: "pl", label: "Polish" },
    { code: "ka", label: "Georgian" },
    { code: "de", label: "German" },
    { code: "el", label: "Greek" },
    { code: "hi", label: "Hindi" },
    { code: "hu", label: "Hungarian" },
    { code: "id", label: "Indonesian" },
    { code: "it", label: "Italian" },
    { code: "ja", label: "Japanese" },
    { code: "ms", label: "Malaysian" },
    { code: "pt", label: "Portuguese" },
    { code: "ru", label: "Russian" },
    { code: "es", label: "Spanish" },
    { code: "sw", label: "Swahili" },
    { code: "th", label: "Thai" },
    { code: "tr", label: "Turkish" },
    { code: "vi", label: "Vietnamese" },
  ]
  public dateFormatOptions = [
    { value: "DD MMM YYYY", 'label': "DD MMM YYYY (15 DEC 2018)" },
    { value: "MM/DD/YYYY", 'label': "MM/DD/YYYY (12/15/2018)" },
    { value: "YYYY/MM/DD", 'label': "YYYY/MM/DD (2018/12/15)" }
  ]
  public timeFormatOptions = [
    { value: "hh:mm a", "label": "12 Hours" },
    { value: "HH:mm", "label": "24 Hours" }
  ]
  public timeFormat = { value: "hh:mm a", "label": "12 Hours" }
  public dateFormat = { value: "DD MMM YYYY", 'label': "DD MMM YYYY (15 DEC 2018)" }
  public viewOptions = [
    { label: 'Map View', value: 0 },
    { label: 'List View', value: 1 }
  ]
  public userViewOptions = [
    { label: 'Task View', value: 0 },
    { label: 'Mission View', value: 1 },
    { label: 'Both', value: 2 }
  ]
  public userView;
  public viewDropdown;
  public dropDownEnum = DropDownType;
  constructor(public commonService: CommonService, private formBuilder: FormBuilder, private settingsService: SettingsService,
    private customMessage: CustomMessageService, private gaService: GaService) { }


  ngOnInit() {
    window['pref'] = this;
    this.customerSignupActive = !!this.commonService.loginData.vendor_signup;
    this.userView = ((this.commonService.loginData.user_view == 0) ? { label: 'Task View', value: 0 } : (this.commonService.loginData.user_view == 1) ?  { label: 'Mission View', value: 1 } : { label: 'Both', value: 2 }  );
    this.initWorkflowForm();
    this.setWorkflowValues()

    if (!!!this.commonService.loginData.is_dispatcher) {
      this.getAllAgentFields();
      this.getUserLayoutFields();
      this.initCustomerSignupForm();
      this.getAllTemplateOptions();
      if (this.commonService.loginData.vendor_signup) {
        this.getCustomerSignupData();
      }
    }
    this.timeFormat = {
      value: this.commonService.loginData.time_format || "hh:mm a",
      "label": this.commonService.loginData.time_format == "hh:mm a" ? "12 Hours" : "24 Hours"
    }
    this.dateFormat = {
      value: this.commonService.loginData.date_format || "DD MMM YYYY",
      label: this.getLabelForDateFormat()
    }
  }
  /**
   * get label for date format
   */
  getLabelForDateFormat() {
    switch (this.commonService.loginData.date_format) {
      case ('DD MMM YYYY'): {
        return "DD MMM YYYY (15 DEC 2018)";
      }
      case ('MM/DD/YYYY'): {
        return "MM/DD/YYYY (12/15/2018)";
      }
      case ('YYYY/MM/DD'): {
        return "YYYY/MM/DD (2018/12/15)";
      }
    }
  }


  /**
   * Initialization of customer signup form
   */
  initCustomerSignupForm() {
    this.customerSignupForm = this.formBuilder.group({
      'auto_verify_signup': [''],
      'vendor_signup_info': ['', Validators.maxLength(140)],
      'selected_template': [''],
      'signup_template_layout_type': [''],
      'signup_template_name': [''],
      'is_editable': [{ value: '', disabled: true }]
    });
  }


  /**
   * On submit of customer signup form
   * updating values of customer signup form
   */
  onUpdateVendorSignup() {
    this.commonService.showLoader = true;
    const data: IVendorSignup = {
      auto_verify_signup: +this.customerSignupForm.controls.auto_verify_signup.value,
      vendor_signup_info: this.customerSignupForm.controls.vendor_signup_info.value.trim(),
      signup_template_name: this.customerSignupForm.controls.selected_template.value.template,
      signup_template_layout_type: this.customerSignupForm.controls.selected_template.value.layout_type,
      is_editable: +this.customerSignupForm.controls.is_editable.value
    };
    this.settingsService.activateVendorSignup(data).subscribe(
      response => {
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
      },
      error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error);
      }
    )
  }


  /**
   * To get all template options 
   * available for customer signup
   */
  getAllTemplateOptions() {
    this.settingsService.getAllLayoutTemplateNames().subscribe(
      response => {
        if (response.data.length > 0) {
          this.templateOptions = response.data;
        }
        else {
          this.templateOptions = [];
        }
        //to append select template in dropdown options
        const obj = {
          template: "Select Template", layout_type: -1
        };
        this.templateOptions.unshift(obj);

      },
      error => {
        this.commonService.handleError(error);
      });
  }



  /**
   * To enable/disable is_editable option 
   * on selection of particular template 
   * in customer signup setup
   */
  onTemplateSelection() {
    if (this.customerSignupForm.controls.selected_template.value.layout_type == -1) {
      this.customerSignupForm.controls.is_editable.setValue(false);
      this.customerSignupForm.controls.is_editable.disable();
    } else {
      this.customerSignupForm.controls.is_editable.enable();
    }
  }

  /**
   * To enable/ disable controlled
   * access 
   * @param e event on changing input
   */
  onDisableCustomerTeam(e: Event) {
    const status: boolean = (e.target as HTMLInputElement).checked;
    this.disableCustomer(status);
  }



  /**
   * Function call to disable/enable
   * customer teams accrdong to activeStatus
   * @param activeStatus checked/unchecked checkbox
   */
  disableCustomer(activeStatus: boolean) {
    this.commonService.showLoader = true;
    this.settingsService.enableDisableCustomerTeam(activeStatus)
      .subscribe(response => {
        this.commonService.showLoader = false;
        this.commonService.loginData.customer_teams_setting = +activeStatus;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
        // $cookieStore.put( 'enable_disable_customer_teams', activate);
      }, error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error.error);
      })
  }



  /**
   * Initialization of workflowform
   */
  initWorkflowForm() {
    this.workflowForm = this.formBuilder.group({
      'workflowType': [''],
      'driverPanel': this.formBuilder.group({
        'agentStr1': [''],
        'agentStr2': [''],
        'agentStr3': ['']
      })
    });
  }


  /**
   * To get all 
   * information regarding
   * customer signup
   */
  getCustomerSignupData() {
    this.settingsService.viewVendorSignupAddon().subscribe(
      response => {
        if (response.data) {
          this.customerSignupActive = true;
          this.setCustomerSignupData(response.data);
        } else {
          this.customerSignupActive = false;
        }


      },
      error => {
        this.customerSignupActive = false;
        this.commonService.handleError(error);
      });
  }

  /**
   * Setting customer signup form
   * from fetched response
   * @param vendorSignupResponse response from
   * backend
   */
  setCustomerSignupData(vendorSignupResponse: IVendorSignup) {
    let keys = Object.keys(this.customerSignupForm.controls);
    keys.forEach((field: any) => {
      const control = this.customerSignupForm.get(field);
      if (control instanceof FormControl && field != 'selected_template') {
        this.customerSignupForm.controls[field].setValue(vendorSignupResponse[field] || '');
      }


    });
    this.customerSignupForm.controls.is_editable.setValue(!!vendorSignupResponse['is_editable']);
    const obj = {
      template: this.customerSignupForm.controls.signup_template_name.value.trim(),
      // layout_type: this.commonService.loginData.layout_type
      layout_type: +this.customerSignupForm.controls.signup_template_layout_type.value
    };
    this.customerSignupForm.controls.selected_template.setValue(obj);
    this.onTemplateSelection();
  }

  /**
   * To update default view ,
   * language, distance unit and
   * updating in common service
   * @param label 
   */
  updateActionForType(label: string) {

    let val = "";
    switch (label) {
      case 'distance_in': {
        val = this.distanceUnit.value;
        this.commonService.loginData.distance_in = val;
        break;
      }
      case 'date_format': {
        val = this.dateFormat.value;
        this.commonService.loginData.date_format = val;
        this.commonService.modifyDateTimeFormat();
        break;
      }
      case 'time_format': {
        val = this.timeFormat.value;
        this.commonService.loginData.time_format = val;
        this.commonService.modifyDateTimeFormat();
        break;
      }
      case 'tracking_language': {
        val = this.trackingLang ? this.trackingLang.code : 'en';
        this.commonService.loginData.tracking_language = val;
        break;
      }
      case 'language': {
        val = this.dashboardLang ? this.dashboardLang.code : 'en';
        this.commonService.loginData.language = val;
        break;
      }

      case 'default_view': {
        val = this.deafaultView ? this.deafaultView.value : 0;
        this.commonService.loginData.default_view = +val;
        this.commonService.emitDataToParentWindow('', { val }, 'default_dashboard_view_updated')
        this.gaService.emitEvent('v3_app_tookanapp_add_ons', 'enable_add_on', +val == 1 ? 'enable_list_view' : 'enable_map_view');
        break;
      }
      case 'user_view': {
        val = this.userView.value;
        this.commonService.loginData.user_view = +val;
        this.gaService.emitEvent('default_account_settings_updated', val, this.commonService.loginData.email );

        break;
      }

    }
    this.commonService.showLoader = true;
    this.settingsService.updateAction(label, val).subscribe(
      response => {
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
        switch (label) {
          case 'language': {
            if (this.dashboardLang) {
              this.commonService.emitDataToParentWindow('', { val }, 'dashboard_lang_updated');
            }
            break;
          }
          case 'time_format': {
            var format = {
              "time_format": val,
              "date_format": this.dateFormat.value
            }
            this.commonService.emitDataToParentWindow('', { format }, 'date_time_format_updated');

            break;
          }

          case 'user_view': {
          this.commonService.emitDataToParentWindow('', { val }, 'default_user_view_updated');
            break;
          }
        }


      }, error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error);
      })

  }


  /**
   * Function to get all custom panel
   * dropdown options
   */
  getAllAgentFields() {
    this.settingsService.getAvailableTaskViewFields().subscribe(
      response => {
        if (response.data) {
          if (response.data.default_view_fields) {
            this.defaultViewFields = response.data.default_view_fields;

          }
          this.getAllCustomPanelFields(false);
          this.agentFields = response.data.view_fields;
          this.setAgentFieldsDictionary(response.data.view_fields);
          //default_view_fields
        }
      },
      error => {
        this.commonService.handleError(error);
      });
  }



  /**
   * To show dropdown of respective label
   * @param label option of enum
   */
  showDropDown(label) {
    this.viewDropdown = label;
  }

  /**
   * To hide dropdown by setting 
   * variable value NONE
   */
  hideDropdown() {
    this.viewDropdown = this.dropDownEnum.NONE
  }

  /**
   * In order to set the p-dropdown values 
   * for distance , tracking_language ,
   * default view , layout type 
   * and customer_team_setiings 
   */
  setWorkflowValues() {
    if (this.commonService.loginData.distance_in) {
      this.distanceOptions.forEach(el => {
        if (el.value == this.commonService.loginData.distance_in)
          this.distanceUnit = el;
      })
    }
    if (this.commonService.loginData.default_view) {
      this.viewOptions.forEach(el => {
        if (el.value == +this.commonService.loginData.default_view)
          this.deafaultView = el;
      })
    }

    if (this.commonService.loginData.language) {
      let _lang = this.languageOptions.find(el => {
        return (el.code == this.commonService.loginData.language);
      });
      this.dashboardLang = _lang || { code: "en", label: "English" };
    } else {
      this.dashboardLang = { code: "en", label: "English" };
    }

    if (this.commonService.loginData.tracking_language) {
      let _lang = this.languageOptions.find(el => {
        return (el.code == this.commonService.loginData.tracking_language);
      });
      this.trackingLang = _lang || { code: "en", label: "English" };
    } else {
      this.trackingLang = { code: "en", label: "English" };
    }
    this.workflowForm.controls.workflowType.setValue((this.commonService.loginData.layout_type).toString());
    this.disableCustomerTeam = !!this.commonService.loginData.customer_teams_setting;

  }

  /**
   * To fetch all fields in order to get
   * status of customer rating
   */
  getUserLayoutFields(): Promise<any> {
    const actionType = 1;
    return new Promise((resolve, reject) => {
      this.settingsService.getUserLayoutFields(actionType).subscribe(
        response => {
          if (response.data.length) {
            this.autoAllocationData = response.data["0"].auto_assign
            this.customerRatingFields = response.data["0"].fields.app_optional_fields;
            let isTeam_level_auto_assignmentPresent: boolean = false;

            this.customerRatingFields.forEach(el => {
              switch (el.label) {
                case 'disable_rating': {
                  this.customerRating = !!el.value;
                  break;
                }
                case 'single_tracking': {
                  this.openTrackingLink = !!el.value;
                  break;
                }
                case 'team_level_auto_assignment': {
                  isTeam_level_auto_assignmentPresent = true;
                  this.enableAutoAllocationTeamLevel = !!el.value;
                  break;
                }
              }
            });
            if (!isTeam_level_auto_assignmentPresent) {
              this.customerRatingFields.push({ label: 'team_level_auto_assignment', value: 0 });
            }
          }
          resolve(response);
        },
        error => {
          this.commonService.handleError(error);
          reject();
        }
      )
    })

  }


  /**
   * for updating the customer rating or update auto allocation setting at team level
   * @param label 
   * and sending the whole agent-app fields as it is
   */
  updateCustomerRating(event, label: string) {
    this.commonService.showLoader = true;
    console.log(this.customerRatingFields)
    let isLabelFound = 0;
    let autoAllocationlabelValue = 1;
    this.customerRatingFields.forEach(el => {
      switch (el.label) {
        case label: {
          isLabelFound = 1
          if (label == 'disable_rating') {
            el.value = +this.customerRating;
          }
          if (label == 'single_tracking') {
            el.value = +this.openTrackingLink;
          }
          if (label == 'team_level_auto_assignment') {
            el.value = +this.enableAutoAllocationTeamLevel;
            autoAllocationlabelValue = el.value;
          }
        }
      }
    });
    if (isLabelFound == 0) {
      this.customerRatingFields.push({
        'label': label,
        value: 1
      })
    }
    const actionType = 1;
    this.settingsService.updateUserLayoutField(this.customerRatingFields, actionType).subscribe(
      response => {
        if (label == 'team_level_auto_assignment' && !autoAllocationlabelValue) {
          this.resetDefaultAutoAllocationSettings();
        }
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
      },
      error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error);
        //reset
        this.customerRatingFields.forEach(el => {
          switch (el.label) {
            case label: {
              if (label == 'disable_rating') {
                el.value = +!this.customerRating;
              }
              if (label == 'single_tracking') {
                el.value = +!this.openTrackingLink;
              }
              if (label == 'team_level_auto_assignment') {
                el.value = +!this.enableAutoAllocationTeamLevel;
                autoAllocationlabelValue = el.value;
              }
            }
          }
        });
        event.target.checked = !event.target.checked;
      });
  }
  /**
   * reset auto allocation setttings for delete team level settings
   */
  resetDefaultAutoAllocationSettings = function () {
    delete this.autoAllocationData.teams;
    const actionType = 3;
    this.settingsService.updateWorkflowOption(this.autoAllocationData, actionType).subscribe(
      response => {

      },
      error => {
      });
  }

  /**
   * performed when user changes the worklow/layout
   * type, a/c to that layout-type the fields are updated 
   */
  onWorkflowChange() {
    this.commonService.showLoader = true;
    let workFlowTypeENum = WorkflowType;
    switch (+this.workflowForm.controls.workflowType.value) {
      case workFlowTypeENum.PICKUP_DELIVERY: {
        this.gaService.emitEvent('v3_app_tookanapp_business_type', 'b_type_pick_up', 'b_type_pick_up');
        break;
      }
      case workFlowTypeENum.APPOINTMENT: {
        this.gaService.emitEvent('v3_app_tookanapp_business_type', 'b_type_appointment', 'b_type_appointment');
        break;
      }
      case workFlowTypeENum.FIELD_WORKFORCE: {
        this.gaService.emitEvent('v3_app_tookanapp_business_type', 'b_type_field_workforce', 'b_type_field_workforce');
        break;
      }

    }
    this.commonService.loginData.layout_type = +this.workflowForm.controls.workflowType.value;

    this.getUserLayoutFields().then(() => {
      const val = this.commonService.loginData.layout_type;
      //emit event to parent the workflow has been updated
      this.commonService.emitDataToParentWindow('', { val }, 'workflow_updated');

      if (this.commonService.loginData.layout_type !== workFlowTypeENum.PICKUP_DELIVERY) {
        this.customerRatingFields.forEach((el) => {
          if (el.label == 'single_tracking') {
            el.value = 0;
          }
        });
      }
      this.settingsService.updateUserLayoutField(this.customerRatingFields, 1).subscribe(
        response => {
          //this.resetAgent(); //to reset the chips array

          this.getAllCustomPanelFields(false); //api to get chips data
          this.getAllTemplateOptions(); // to get customer signup template options

          if (!!this.commonService.loginData.vendor_signup)
            this.getCustomerSignupData(); //to get respective customer signup data

          this.commonService.showLoader = false;
          this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
        },
        error => {
          this.commonService.showLoader = false;
          this.commonService.handleError(error);
        });
    })

  }















  setAgentFieldsDictionary(agentFieldArr: IAgentFields[]) {
    agentFieldArr.forEach((el) => {
      this.agentFieldDictionary[el.keyname] = el.dummy;
    })
  }


  fillValues(val: any, field: IAgentFields) {
    let keyName = field.keyname.replace(/_/g, ' ');
    switch (val) {
      case 'line1': {
        var line1 = document.getElementById('input1');
        var newCon = document.createElement('span');
        newCon.innerHTML = "<span class='tag' contentEditable='false'>" + keyName + "</span>&nbsp;";
        line1.appendChild(newCon);
        this.bindToModel(val, '1');
        // this.setDummyValues(keyName, '1');
        break;
      }
      case 'line2': {
        var line2 = document.getElementById('input2');
        var newCon = document.createElement('span');
        newCon.innerHTML = "<span class='tag' contentEditable='false'>" + keyName + "</span>&nbsp;";
        line2.appendChild(newCon);
        this.bindToModel(val, '2');
        // this.setDummyValues(keyName, '2');
        break;
      }
      case 'line3': {
        var line3 = document.getElementById('input3');
        var newCon = document.createElement('span');
        newCon.innerHTML = "<span class='tag' contentEditable='false'>" + keyName + "</span>&nbsp;";
        line3.appendChild(newCon);
        this.bindToModel(val, '3');
        // this.setDummyValues(keyName, '3');
        // this.prevStr3.push(keyName);
        break;
      }
    }
  }


  setCustomPanelFields() {
    this.commonService.showLoader = true;
    this.transformBeforeSending('input1', '1');
    this.transformBeforeSending('input2', '2');
    this.transformBeforeSending('input3', '3');
    const fields = [
      this.sendStr1,
      this.sendStr2,
      this.sendStr3
    ]
    this.settingsService.setTaskViewFields(fields).subscribe(
      response => {
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
      },
      error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error);
      });
  }

  getAllCustomPanelFields(flag?: boolean) {
    const label = 'agent';
    this.settingsService.getTaskViewFields(label).subscribe(
      response => {
        if (response.data && response.data.view_fields && !flag) {
          this.setPreview(response.data.view_fields);
          this.setTaskFieldsHit(response.data.view_fields);
        } else {
          this.setPreview(this.defaultViewFields);
          this.setTaskFieldsHit(this.defaultViewFields);
          this.setCustomPanelFields();
        }

        if (flag) {
          // this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });          
        }
      },

      error => {
        if (this.defaultViewFields) {
          this.setPreview(this.defaultViewFields);
          this.setTaskFieldsHit(this.defaultViewFields);
        }

        // this.setCustomPanelFields();
        if (flag) {
          // this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });          
        }
        // this.commonService.handleError(error);
      });
  }


  setPreview(fields) {
    this.removeCurlyBraces(fields);

  }

  setTaskFieldsHit(fields) {
    var inputStr1 = this.replaceSpaces(fields[0]);
    var inputStr2 = this.replaceSpaces(fields[1]);
    var inputStr3 = this.replaceSpaces(fields[2]);
    inputStr1 = inputStr1.replace(/{{/g, "<span class='tag' contentEditable='false'>").replace(/}}/g, "</span>&nbsp;").replace(/_/g, ' ');
    inputStr2 = inputStr2.replace(/{{/g, "<span class='tag' contentEditable='false'>").replace(/}}/g, "</span>&nbsp;").replace(/_/g, ' ');
    inputStr3 = inputStr3.replace(/{{/g, "<span class='tag' contentEditable='false'>").replace(/}}/g, "</span>&nbsp;").replace(/_/g, ' ');

    var line1 = document.getElementById('input1');
    line1.innerHTML = inputStr1;
    var line2 = document.getElementById('input2');
    line2.innerHTML = inputStr2;
    var line3 = document.getElementById('input3');
    line3.innerHTML = inputStr3;

  }

  /**
 * To reset the form (workflowform)-> 
 * agent pane customization
 */
  resetAgent() {
    (this.workflowForm.controls.driverPanel as FormGroup).setValue({
      agentStr1: [''],
      agentStr2: [''],
      agentStr3: ['']
    });
    this.getAllCustomPanelFields(true);
  }


  replaceSpaces(str) {
    str = str.replace(/&amp;/g, '&');
    return str.replace(/&nbsp;/g, ' ');
  }

  removeCurlyBraces(fields) {
    let fieldStr1 = fields[0].replace(/{{/g, '').replace(/}}/g, '').replace(/_/g, ' ');
    this.setDummyValues(fieldStr1, '1');
    let fieldStr2 = fields[1].replace(/{{/g, '').replace(/}}/g, '').replace(/_/g, ' ');
    this.setDummyValues(fieldStr2, '2');
    //this.prevStr2 = fieldStr2.split(' ');
    let fieldStr3 = fields[2].replace(/{{/g, '').replace(/}}/g, '').replace(/_/g, ' ');
    this.setDummyValues(fieldStr3, '3');
    //this.prevStr3 = fieldStr3.split(' ');
  }

  bindToModel(val: string, index: string) {
    let stringText = document.getElementById('input' + index).textContent;
    this.setDummyValues(stringText, index);
  }

  setDummyValues(selectedString, index: string) {
    for (var key in this.agentFieldDictionary) {
      let _key = key.replace(/_/g, ' ');
      try {
        selectedString = selectedString.replace(new RegExp(_key, 'g'), this.agentFieldDictionary[key])
      } catch (e) {

      }

      switch (index) {
        case '1': {
          this.prevStr1 = selectedString;
          break;
        }
        case '2': {
          this.prevStr2 = selectedString;
          break;
        }
        case '3': {
          this.prevStr3 = selectedString;
          break;
        }
      }

    }

  }

  transformBeforeSending(id: string, index: string) {
    var elText = document.getElementById(id).textContent;
    for (var key in this.agentFieldDictionary) {
      let _key = key.replace(/_/g, ' ');
      try {
        elText = elText.replace(new RegExp(_key, 'g'), '{{' + key + '}}')
      } catch (e) {

      }

      switch (index) {
        case '1': {
          this.sendStr1 = elText.trim();
          break;
        }
        case '2': {
          this.sendStr2 = elText.trim();
          break;
        }
        case '3': {
          this.sendStr3 = elText.trim();
          break;
        }
      }

    }


  }
  public onSelectingFile(fileInput) {
    fileInput.click();
  }
  onUpload(event) {
      this.errorCodeFile = event.target.files[0].name;
      this.file = event.target.files[0];
      if (this.file) {
        var reader = new FileReader();
        reader.onload = (e: any) => {
          this.errorCodes= e.target.result;
        }
        reader.readAsDataURL(this.file);
      }
      this.updateErrorCodes(this.file);
  }
  updateErrorCodes(file){
    let data = new FormData();
    data.append("access_token", this.commonService.loginData.access_token);
    data.append('error_codes_csv', file ? file :this.errorCodes);
    this.settingsService.importErrorCodes(data).subscribe(
      response => {
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
      }, error => {
        this.commonService.handleError(error)
      });
  }
  exportErrorCodes(){
    this.settingsService.exportErrorCodes().subscribe(
      response => {
      this.exportErrorCodeFile(response);
      }, error => {
        this.commonService.handleError(error)
      });
  }
  exportErrorCodeFile(res) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(res));
    element.setAttribute('download', 'errorCodes.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }


}








