import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, TemplateRef } from '@angular/core';
import { ConfirmationService } from '../../../jw-notifications/services/confirmation.service';
import { SettingsService } from '../../services/settings.service';
import { CommonService } from '../../../../services/common.service';
import { IManagerData, IAddManagerData } from '../../interfaces/interfaces';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IntPhonePrefixComponent } from '../../../jw-tel-input/components/int-phone-prefix.component';
import { Country } from '../../../jw-tel-input/interfaces/country.interface';
import { environment } from '../../../../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { GaService } from '../../../../services/ga.service';
import { Table } from 'primeng/table';
import { constants } from '../../../../../constants/constants';
import { FleetSchedulePermission } from '../../enums/enum';
@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss', '../developers/developers.component.scss','../agent-app/agent-app.component.scss']
})
export class ManagerComponent implements OnInit, OnDestroy, AfterViewInit {

  public FleetSchedulePermissionEnum = FleetSchedulePermission;
  @ViewChild('dt') ptable: Table;
  @ViewChild('buttonTemplate') buttonTemp: TemplateRef<any>;
  @ViewChild("intlTelInput") set phoneInputField(val: any) {
    if (val) {
      this._phoneInputField = val;
      this.addManagerForm.controls.phone.clearValidators();
      this.addManagerForm.controls.phone.setValidators([
        Validators.required, this.commonService.validPhoneNumber(this.phoneInputField)
      ]);
      this.addManagerForm.controls.phone.updateValueAndValidity();
      if (!this.is_editing_manager)
        this.phoneInputField.setCountryCode(this.commonService.loginData.country_phone_code.toLowerCase());
    }
  }
  get phoneInputField() {
    return this._phoneInputField;
  }
  private _phoneInputField: IntPhonePrefixComponent;

  private managerSub: Subscription;
  public addManagerForm: FormGroup;
  public showAddManagerPopup: boolean;
  public managerList: Array<IManagerData> = [];
  public totalRecords: number = 0;
  public rows: number = 25;
  public infotext: string;
  public is_editing_dispatcher_id: number;
  public is_editing_manager: boolean;
  public manager_popup_action_title: string;
  public team_list: Array<any> = [];
  public form_list: Array<any> = [];
  public companiesList:Array<any> = [];
  public columns = [
    { field: 'dispatcher_id', header: 'ID' },
    { field: 'first_name', header: 'Name' },
    { field: 'email', header: 'Email' },
    { field: 'phone', header: 'Phone' },
    { field: 'company', header: 'Company' },
    { field: 'teamNames', header: 'Teams' },
    { field: 'action', header: 'Actions' }
  ]
  public showAllowAccessToAutoAllocation: boolean;

  constructor(private confirmationService: ConfirmationService, private settingsService: SettingsService,
    public commonService: CommonService, private customMessage: CustomMessageService, private formBuilder: FormBuilder,
    private gaService: GaService) { }

  ngOnInit() {
    this.getAllowAccessPermission();
    this.getAllManagerList();
    this.getTeamList();
    this.getFormsList();
    this.getCompaniesList();
    window['manager'] = this;
  }

  ngAfterViewInit() {
    this.commonService.appendTemplateToHeader(this.buttonTemp);
  }

  //private methods
  /**
   *  get list of teams
   */
  private getTeamList() {
    this.commonService.getTeamListOnly().subscribe(response => {
      this.team_list = response.data;
    }, error => {
      this.team_list = [];
    })
  }

  /**
   *  get list of forms
   */
  private getFormsList() {
    this.settingsService.getFormList().subscribe(response => {
      this.form_list = response.data;
    }, error => {
      this.form_list = [];
    })
  }

  private getCompaniesList(){
    this.settingsService.getAllCompanies().subscribe(response => {
      this.companiesList = response.data;
    }, error => {
      this.companiesList = [];
    })
  }


  private getAllowAccessPermission(): any {
    this.settingsService.getUserLayoutFields(3, 1).subscribe(
      response => {

        //set showAllowAccessToAutoAllocation
        if (response.data["0"]["fields"] && response.data["0"]["fields"]["app_optional_fields"]) {
          const app_optional_fields_data = response.data["0"]["fields"]["app_optional_fields"];
          for (var i = 0; i < app_optional_fields_data.length; i++) {
            if (app_optional_fields_data[i]['label'] == "team_level_auto_assignment") {
              this.showAllowAccessToAutoAllocation = !!app_optional_fields_data[i]['value'];
              break;
            }
          }
        }
      }, error => {
        this.commonService.handleError(error);
      });
  }

  /**
  * initialize edit manager form
  * @param item manager to be edited
  */
  private initEditManagerForm(item: IManagerData) {
    this.initAddManagerForm();
    const team_length = this.team_list.length;
    const selected_team_count = item.teams.length;
    let dispatcher_teams = [];
    for (var i = 0; i < team_length; i++) {
      for (var j = 0; j < selected_team_count; j++) {
        if (this.team_list[i].team_id == item.teams[j].team_id) {
          dispatcher_teams.push(this.team_list[i]);
        }
      }
    }

    const forms_length = this.form_list.length;
    const selected_form_count = item.forms.length;
    let dispatcher_forms = [];
    for (var i = 0; i < forms_length; i++) {
      for (var j = 0; j < selected_form_count; j++) {
        if (this.form_list[i].form_id == item.forms[j].form_id) {
          dispatcher_forms.push(this.form_list[i]);
        }
      }
    }
    if(item.phone.substring(0,2)== '+1'){
      item.phone = item.phone.replace('+1','')
    }else{
     item.phone = item.phone.replace('+91','')
    } 
    this.addManagerForm.setValue({
      'fname': item.first_name,
      'lname': item.last_name || '',
      'phone': item.phone,
      'email': item.email,
      'password': '',
      'company':{user_id:item.company_id,company_name:item.company_name},
      'dispatcher_teams': dispatcher_teams,
      'dispatcher_forms': dispatcher_forms,
      'fleet_schedule_permission': item.fleet_schedule_permission,
      'allow_access_unassigned_task': !!item.view_task,
      'allow_add_agent': !!item.create_driver,
      'allow_create_task': !!item.create_task,
      'allow_edit_task': !!item.edit_task,
      'view_auto_allocation': !!item.view_auto_allocation,
      'edit_fleet_wallet': !!item.edit_fleet_wallet,
      'allow_all_access': item.allow_all_access,
      'allow_addView_notifications': item.add_custom_notifications,
      'allow_addView_links': item.add_video_links,
    });
    this.manager_popup_action_title = 'Edit Manager';

    this.addManagerForm.controls.password.clearValidators();
  }

  /**
    * confirm & delete selected Manager
    * @param dispatcher_id id of manager to be deleted
    */
  private deleteManager(dispatcher_id: string) {
    this.confirmationService.confirm({
      header: "Confirm Delete",
      message: "Are you sure you want to delete this " + this.commonService.loginData.call_dispatcher_as + '?',
      accept: () => {
        //showLoader
        this.settingsService.deleteManager(dispatcher_id)
          .subscribe(response => {
            //loaderhide
            this.getAllManagerList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.handleError(error);
          })
      }
    })
  }

  //public methods
  /**
   * start get list of developers
   */
  getAllManagerList() {
    this.gaService.emitEvent('v4_app_tookanapp_manager', 'manager_page_land_dashboard', 'manager_page_land_dashboard');
    if (this.managerSub)
      this.managerSub.unsubscribe();

    this.managerSub = this.settingsService.getAllManager().subscribe(
      response => {
        this.managerList = Array.isArray(response.data) ? response.data : [];
        this.managerList.forEach(manager => {
          let teams = [...manager.teams];
          manager.teamNames = teams.map(item => item.team_name).join(', ');
        })
        //this.developersList = [...this.developersList, ...this.developersList, ...this.developersList];
        this.totalRecords = this.managerList.length;
        this.onPageChange({ rows: +this.rows, first: 0 }, this.rows, this.managerList);
      }, error => {
        this.managerList = [];
        this.commonService.handleError(error);
      });

  }

  showAddPopup() {
    this.is_editing_manager = false;
    this.initAddManagerForm();
  }

  /**
   * Initialising add manager form
   */
  initAddManagerForm() {
    this.showAddManagerPopup = true;
    this.manager_popup_action_title = 'Add Manager';
    this.addManagerForm = this.formBuilder.group({
      'fname': ['', Validators.required],
      'lname': [''],
      'phone': ['',Validators.required],
      'email': ['', [Validators.required, Validators.pattern(constants.emailPattern)]],
      'password': ['', [Validators.required, Validators.minLength(6)]],
      'company': ['', Validators.required],
      // 'dispatcher_teams': ['', Validators.required],
      'dispatcher_teams': [''],
      'dispatcher_forms': [[]],
      'fleet_schedule_permission': [FleetSchedulePermission.VIEW_ONLY],
      // 'dashboard_permission': [''],
      'allow_access_unassigned_task': [''],
      'allow_add_agent': [''],
      'allow_create_task': [''],
      'allow_edit_task': [''],
      'allow_addView_links':[''],
      'allow_addView_notifications':[''],
      'view_auto_allocation': [''],
      'edit_fleet_wallet': [''],
      'allow_all_access': ['']
    });
  }

  //api call for add manager/dispatacher
  addManager() {
    this.gaService.emitEvent('v4_app_tookanapp_manager', 'add_manager_from_dashboard', 'add_manager_from_dashboard');
    if (!this.addManagerForm.valid) {
      return this.commonService.validateAllFormFields(this.addManagerForm);
    } else {
      let body: IAddManagerData = this.createAddManagerData();
      this.commonService.showLoader = true;
      if (!this.is_editing_manager) {
        this.settingsService.addManager(body).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.showAddManagerPopup = false;
            this.getAllManagerList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.showLoader = false;
            //this.showAddManagerPopup = false;
            this.commonService.handleError(error)
          });
      } else {
        body.dispatcher_id = this.is_editing_dispatcher_id
        this.settingsService.editManager(body).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.showAddManagerPopup = false;
            this.getAllManagerList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.showLoader = false;
            //this.showAddManagerPopup = false;
            this.commonService.handleError(error)
          });
      }

    }
  }
  /**
   * create request body for add/edit manager
   * @returns IAddManagerData data
   */
  private createAddManagerData(): IAddManagerData {
    const fname = this.addManagerForm.controls.fname.value.trim();
    const lname = this.addManagerForm.controls.lname.value || '';
    const name = fname + ' ' + (lname ? lname : '');
    const email = this.addManagerForm.controls.email.value.trim();
    const pwd = this.addManagerForm.controls.password.value.trim();
    const fleet_schedule_permission: FleetSchedulePermission = +this.addManagerForm.controls.fleet_schedule_permission.value;
    let phoneValue: string = this.addManagerForm.controls.phone.value.toString();
    if (!phoneValue.startsWith('+')) {
      let countryData: Country = this.phoneInputField.selectedCountry;
      phoneValue = `+${countryData.dialCode.toString()}${phoneValue}`;
    }
    let canView = 0;
    let canEdit = 0;
    if (fleet_schedule_permission == FleetSchedulePermission.CANT_ACCESS) {
      canView = 0;
      canEdit = 0;
    }
    else if (fleet_schedule_permission == FleetSchedulePermission.VIEW_ONLY) {
      canView = 1;
      canEdit = 0;
    }
    else if (fleet_schedule_permission == FleetSchedulePermission.CAN_VIEW_AND_EDIT) {
      canView = 1;
      canEdit = 1;
    }

    //permissions
    const task_access = this.addManagerForm.controls.allow_access_unassigned_task.value;
    const add_driver_access = this.addManagerForm.controls.allow_add_agent.value;
    const can_create_task = this.addManagerForm.controls.allow_create_task.value;
    const can_edit_task = this.addManagerForm.controls.allow_edit_task.value;
    const view_auto_allocation = this.addManagerForm.controls.view_auto_allocation.value;
    const edit_fleet_wallet = this.addManagerForm.controls.edit_fleet_wallet.value;
    const company = this.addManagerForm.controls.company.value;
    const can_add_video_links = this.addManagerForm.controls.allow_addView_links.value;
    const can_add_custom_notifications = this.addManagerForm.controls.allow_addView_notifications.value;

    // const dispatcher_teams = (this.addManagerForm.controls.dispatcher_teams.value.map(team => team.team_id)).toString();
    const dispatcher_teams = [];
    const dispatcher_forms = (this.addManagerForm.controls.dispatcher_forms.value.map(form => form.form_id)).toString();
    let body: IAddManagerData = {
      email: email,
      first_name: fname,
      name: name,
      password: pwd,
      last_name: lname,
      phone: phoneValue,
      dispatcher_teams: dispatcher_teams,
      dispatcher_forms: dispatcher_forms,
      task_access: task_access ? 1 : 0,
      add_driver_access: add_driver_access ? 1 : 0,
      can_create_task: can_create_task ? 1 : 0,
      can_edit_task: can_edit_task ? 1 : 0,
      can_view: canView ? 1 : 0,
      can_edit: canEdit ? 1 : 0,
      view_auto_allocation: view_auto_allocation ? 1 : 0,
      edit_fleet_wallet: edit_fleet_wallet ? 1 : 0,
      company_id: company.user_id,
      can_add_video_links : can_add_video_links?1:0,
      can_add_custom_notifications : can_add_custom_notifications?1:0
    };
    return body;
  }

  /**
   * on edit manager click 
   * @param item manager to be edited
   */
  editManagerItem(item: IManagerData) {
    this.is_editing_manager = true;
    this.is_editing_dispatcher_id = item.dispatcher_id;
    if (item.view_status && item.edit_status) {
      item.fleet_schedule_permission = FleetSchedulePermission.CAN_VIEW_AND_EDIT;
    } else if (item.view_status) {
      item.fleet_schedule_permission = FleetSchedulePermission.VIEW_ONLY;
    } else {
      item.fleet_schedule_permission = FleetSchedulePermission.CANT_ACCESS;
    }
    // if (item.view_task == 1 && item.create_driver == 1 && item.create_task == 1 && item.edit_task == 1
    //   && item.edit_fleet_wallet == 1
    //   && (this.showAllowAccessToAutoAllocation ? item.view_auto_allocation == 1 : true)) {
    //   item.allow_all_access = true
    // } else {
    //   item.allow_all_access = false
    // }
    console.log(item,'???')
    if (item.view_task == 1 && item.create_driver == 1 && item.create_task == 1 && item.edit_task == 1 && item.add_custom_notifications == 1 && item.add_video_links == 1) {
      item.allow_all_access = true
    } else {
      item.allow_all_access = false
    }
    this.initEditManagerForm(item);
  }

  /**
   * Function to enable action menu on click
   * @param event 
   */
  showActionMenu(event: Event) {
    const el: HTMLElement = event.target as HTMLElement;
    if (el.nextElementSibling.matches('.menu-list')) {
      el.nextElementSibling.setAttribute('display', 'block');
    }
  }

  /**
   * select unselect all-access of manager
   */
  checkUncheckAllAccess() {
    console.log(this.addManagerForm.controls.allow_all_access.value)
    if (!this.addManagerForm.controls.allow_all_access.value) {
      this.addManagerForm.controls.allow_add_agent.setValue(true);
      this.addManagerForm.controls.allow_create_task.setValue(true);
      this.addManagerForm.controls.allow_edit_task.setValue(true);
      this.addManagerForm.controls.allow_addView_links.setValue(true);
      this.addManagerForm.controls.allow_addView_notifications.setValue(true);
      this.addManagerForm.controls.allow_access_unassigned_task.setValue(true);

      if (this.showAllowAccessToAutoAllocation) {
        this.addManagerForm.controls.view_auto_allocation.setValue(true);
      }
      if (this.commonService.loginData.fleet_wallet) {
        this.addManagerForm.controls.edit_fleet_wallet.setValue(true);
      }

    } else {
      this.addManagerForm.controls.allow_add_agent.setValue(false);
      this.addManagerForm.controls.allow_create_task.setValue(false);
      this.addManagerForm.controls.allow_edit_task.setValue(false);
      this.addManagerForm.controls.allow_access_unassigned_task.setValue(false);
      this.addManagerForm.controls.view_auto_allocation.setValue(false);
      this.addManagerForm.controls.edit_fleet_wallet.setValue(false);
      this.addManagerForm.controls.allow_addView_links.setValue(false);
      this.addManagerForm.controls.allow_addView_notifications.setValue(false);

    }
  }

  onCancelClick() {
    this.showAddManagerPopup = false;
  }
  /**
     * confirmation for delete manager
     * @param item manager to be deleted
     */
  deleteManagerItem(item: IManagerData) {
    this.gaService.emitEvent('v4_app_tookanapp_manager', 'delete_manager_from_manager', 'delete_manager_from_manager');
    const id = item.dispatcher_id.toString();
    this.deleteManager(id);
  }

  onPermissionsChange() {
    // if (this.addManagerForm.controls.allow_create_task.value && this.addManagerForm.controls.allow_edit_task.value &&
    //   this.addManagerForm.controls.allow_add_agent.value &&
    //   this.addManagerForm.controls.view_auto_allocation.value &&
    //   this.addManagerForm.controls.allow_access_unassigned_task.value &&
    //   this.addManagerForm.controls.edit_fleet_wallet.value) {
    //   this.addManagerForm.controls.allow_all_access.patchValue(true, {})
    // }
    if (this.addManagerForm.controls.allow_create_task.value && this.addManagerForm.controls.allow_edit_task.value &&
      this.addManagerForm.controls.allow_add_agent.value && this.addManagerForm.controls.allow_addView_links.value
       && this.addManagerForm.controls.allow_addView_notifications.value) {
      this.addManagerForm.controls.allow_all_access.patchValue(true, {})
    }
    else {
      if (this.addManagerForm.controls.allow_all_access.value)
        this.addManagerForm.controls.allow_all_access.patchValue(false, {});
    }
  }

  onFilterChange(event) {
    this.onPageChange({ rows: +this.rows, first: 0 }, this.rows, event.filteredValue);
  }

  onPageChange(event, allowedRows: number, array: Array<any>) {
    console.log(event, allowedRows, this.ptable.filteredValue || array,'????ss')
    this.infotext = this.commonService.onPageChange(event, allowedRows, this.ptable.filteredValue || array);
  }

  ngOnDestroy() {
    this.commonService.removeTemplateFromHeader();
  }
}

