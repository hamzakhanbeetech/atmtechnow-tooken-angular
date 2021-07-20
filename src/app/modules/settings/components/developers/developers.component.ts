import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, TemplateRef } from '@angular/core';
import { ConfirmationService } from '../../../jw-notifications/services/confirmation.service';
import { SettingsService } from '../../services/settings.service';
import { CommonService } from '../../../../services/common.service';
import { IDeveloperData } from '../../interfaces/interfaces';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { GaService } from '../../../../services/ga.service';
import { Table } from 'primeng/table';
import { constants } from '../../../../../constants/constants';
import { CustomValidators } from '../../../../../utils/custom.validators';
@Component({
  selector: 'app-developers',
  templateUrl: './developers.component.html',
  styleUrls: ['./developers.component.scss']
})
export class DevelopersComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('dt') ptable: Table;
  @ViewChild('buttonTemplate') buttonTemp: TemplateRef<any>;
  private developerSub: Subscription;
  public addDevForm: FormGroup;
  public showAddDevPopup: boolean;
  public developersList: Array<IDeveloperData> = [];
  public totalRecords: number = 0;
  public rows: number = 25;
  public infotext: string;
  public columns = [
    { field: 'first_name', header: 'Name' },
    { field: 'email', header: 'Email' },
    { field: 'action', header: 'Actions' }
  ]
  constructor(private confirmationService: ConfirmationService, private settingsService: SettingsService,
    private commonService: CommonService, private customMessage: CustomMessageService, private formBuilder: FormBuilder,
    private gaService: GaService) { }

  ngOnInit() {
    window['dev'] = this;
    this.getAllDeveloperList();
  }

  ngAfterViewInit() {
    this.commonService.appendTemplateToHeader(this.buttonTemp);
  }

  /**
   * Initialising add developer form
   */
  initAddDevForm() {
    this.addDevForm = this.formBuilder.group({
      'fname': ['', Validators.required],
      'lname': [''],
      'email': ['', [Validators.required, Validators.pattern(constants.emailPattern), CustomValidators.validateEmail('Please enter valid email text please')]],
      'password': ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * to get list of developers
   */
  getAllDeveloperList() {
    this.gaService.emitEvent('v4_app_tookanapp_developer', 'developer_page_land_dashboard', 'developer_page_land_dashboard');
    if (this.developerSub)
      this.developerSub.unsubscribe();

    this.developerSub = this.settingsService.getAllDevelopers().subscribe(
      response => {
        this.developersList = response.data;
        this.totalRecords = this.developersList.length;
        this.onPageChange({ rows: +this.rows, first: 0 }, this.rows, this.developersList)
      }, error => {
        this.developersList = [];
        this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
      });

  }

  /**
   * For deleting a developer popup
   * @param item element of developer data
   */
  deleteDeveloperItem(item: IDeveloperData) {
    this.gaService.emitEvent('v4_app_tookanapp_developer', 'delete_developer_from_dashboard', 'delete_developer_from_dashboard');
    this.confirmationService.showPopup = true;
    const id = item.developer_id.toString();
    this.deleteDeveloper(id);
  }

  /**
   * to delete selected developer
   * @param developerId selected dev ID of type string
   */
  deleteDeveloper(developerId: string) {
    this.confirmationService.confirm({
      header: "Confirm Delete",
      message: "Are you sure you want to delete this developer?",
      accept: () => {
        this.commonService.showLoader = true;
        this.settingsService.deleteDeveloper(developerId)
          .subscribe(response => {
            this.commonService.showLoader = false;
            this.getAllDeveloperList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.showLoader = false;
            this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
          })
      }
    })
  }
  /**
   * show popup
  */
  showAddPopup() {
    this.showAddDevPopup = true;
    this.initAddDevForm();
  }

  /**
   * api call for add/inivte developer
   */
  inviteDeveloper() {
    //show loader
    this.gaService.emitEvent('v4_app_tookanapp_developer', 'add_developer_from_dashboard', 'add_developer_from_dashboard');
    if (!this.addDevForm.valid) {
      return this.commonService.validateAllFormFields(this.addDevForm);
    } else {
      const fname = this.addDevForm.controls.fname.value.trim();
      const lname = this.addDevForm.controls.lname.value.trim() || '';
      const username = fname + lname;
      const email = this.addDevForm.controls.email.value.trim();
      const pwd = this.addDevForm.controls.password.value.trim();
      this.commonService.showLoader = true;
      this.settingsService.inviteDeveloper(email, fname, lname, username, pwd).subscribe(
        response => {
          this.commonService.showLoader = false;
          this.showAddDevPopup = false;
          this.getAllDeveloperList();
          this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
        }, error => {
          this.commonService.showLoader = false;
          this.showAddDevPopup = false;
          this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
        });
    }

  }
  /**
   * close popup
   */
  onCancelClick() {
    this.showAddDevPopup = false;
  }

  /**
   * on p-table filter change event
   * @param event p-table filter change event 
   * 
   * ```
   * { rows: 10, first: 0 }
   * ```
   */
  onFilterChange(event) {
    this.onPageChange({ rows: +this.rows, first: 0 }, this.rows, event.filteredValue);
  }

  /**
   * on p-table page change event
   * @param event p-table page change event 
   * @param allowedRows number of alowed rows
   * @param array list binded with p-table
   */
  onPageChange(event, allowedRows: number, array: Array<any>) {
    this.infotext = this.commonService.onPageChange(event, allowedRows, this.ptable.filteredValue || array);
  }

  /**
   * To enable action menu on click
   * @param event 
   */
  showActionMenu(event: Event) {
    const el: HTMLElement = event.target as HTMLElement;
    if (el.nextElementSibling.matches('.menu-list')) {
      el.nextElementSibling.setAttribute('display', 'block');
    }
  }
  ngOnDestroy() {
    this.commonService.removeTemplateFromHeader();
  }
}
