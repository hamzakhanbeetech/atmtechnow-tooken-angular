import { Component, OnInit, ViewChild,ElementRef, OnDestroy, AfterViewInit, TemplateRef } from '@angular/core';
import { ConfirmationService } from '../../../jw-notifications/services/confirmation.service';
import { SettingsService } from '../../services/settings.service';
import { CommonService } from '../../../../services/common.service';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { GaService } from '../../../../services/ga.service';
import { constants } from '../../../../../constants/constants';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-software-upload',
  templateUrl: './software-upload.component.html',
  styleUrls: ['./software-upload.component.scss', '../developers/developers.component.scss','../preferences/preferences.component.scss','../custom-notifications/custom-notifications.component.scss']
})

export class SoftwareUploadComponent implements OnInit {

  @ViewChild('dt') ptable: Table;
  @ViewChild('buttonTemplate') buttonTemp: TemplateRef<any>;
  @ViewChild('fileInput') fileInput: ElementRef;

  private softwaresSub: Subscription;
  public addSoftwareForm: FormGroup;
  public showAddSoftwarePopup: boolean;
  public softwaresList: Array<any> = [];
  public totalRecords: number = 0;
  public rows: number = 25;
  public infotext: string;
  public is_editing_software: boolean;
  public is_editing_software_id: any;
  public software_popup_action_title: string;
  public form_list: Array<any> = [];
  public imageUrl :string;
  public fileName:string;
  public softwareUpdated : boolean = false;
  public columns = [
    { field: 'software_id', header: 'ID' },
    { field: 'title', header: 'Title' },
    { field: 'description', header: 'Description' },
    { field: 'url', header: 'Software' },
    { field: 'is_active', header: 'Status' },
    { field: 'creation_datetime', header: 'Added On' },
    { field: 'action', header: 'Actions' }
  ];
  file;
  constructor(private confirmationService: ConfirmationService, private settingsService: SettingsService,
    public commonService: CommonService, private customMessage: CustomMessageService, private formBuilder: FormBuilder,
    private gaService: GaService) { }

  ngOnInit() {
    this.getAllSoftwareList();
    window['software-upload'] = this;
  }
  ngAfterViewInit() {
    this.commonService.appendTemplateToHeader(this.buttonTemp);
  }


  /**
* Initialising add service form
*/
  initAddSoftwareForm() {
    this.showAddSoftwarePopup = true;
    this.fileName = '';
    this.software_popup_action_title = 'Add Software';
    this.addSoftwareForm = this.formBuilder.group({
      'title': ['', Validators.required],
      'description': ['', Validators.required],
      'software': ['',Validators.required],
      'view':['']
    });
  }
  /**
* initialize edit service form
* @param item service to be edited
*/
  private initEditSoftwareForm(item: any) {
    this.initAddSoftwareForm();
    this.addSoftwareForm.setValue({
      'title': item.title,
      'description': item.description,
      'software':item.url,
      'view':item.view.toString()
    });
    this.software_popup_action_title = 'Edit Software';
    this.fileName = item.url.split('-')[1];
  }
  /**
    * confirm & delete selected service
    * @param services id of services to be deleted
    */
  private deleteNotification(software_id: string) {
    console.log(software_id,'???')
    this.confirmationService.confirm({
      header: "Confirm Delete",
      message: "Are you sure you want to delete this Software ?",
      accept: () => {
        //showLoader
        this.settingsService.deleteSoftware(software_id)
          .subscribe(response => {
            //loaderhide
            this.getAllSoftwareList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.handleError(error);
          })
      }
    })
  }
  //public methods
  /**
   * start get list of services
   */
  getAllSoftwareList() {
    this.gaService.emitEvent('v4_app_tookanapp_manager', 'manager_page_land_dashboard', 'manager_page_land_dashboard');
    if (this.softwaresSub)
      this.softwaresSub.unsubscribe();

    this.softwaresSub = this.settingsService.getAllSoftwares().subscribe(
      response => {
        this.softwaresList = Array.isArray(response.data.zipFiles) ? response.data.zipFiles :[];
        this.totalRecords = this.softwaresList.length;
        this.onPageChange({ rows: +this.rows, first: 0 }, this.rows, this.softwaresList);
      }, error => {
        this.softwaresList = [];
        this.commonService.handleError(error);
      });
  }

  showAddPopup() {
    this.is_editing_software = false;
    this.initAddSoftwareForm();
  }
  


  /**
   * on image upload event change
   * @param event file upload event
   */
  onUpload(event) {
    this.fileName = event.target.files[0].name;
    const file = event.target.files[0];
    if(this.is_editing_software){
      this.softwareUpdated = true;
    }
    else{
      this.softwareUpdated = false;
    }
    if (file) {
      this.file = file;
      var reader = new FileReader();
      reader.onload = (e: any) => {
        this.addSoftwareForm.controls.software.patchValue(e.target.result);
      }
      reader.readAsDataURL(file);
    }
  }



  //api call for add software
  addSoftware() {
    this.gaService.emitEvent('v4_app_tookanapp_manager', 'add_manager_from_dashboard', 'add_manager_from_dashboard');
    if (!this.addSoftwareForm.valid) {
      return this.commonService.validateAllFormFields(this.addSoftwareForm);
    } else {
      const formData = this.createAddSoftwareData();
      this.commonService.showLoader = true;
      if (!this.is_editing_software) {
        this.settingsService.addSoftware(formData).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.showAddSoftwarePopup = false;
            this.getAllSoftwareList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error)
          });
      } else {
        formData.append('software_id', this.is_editing_software_id)
        this.settingsService.editSoftware(formData).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.showAddSoftwarePopup = false;
            this.getAllSoftwareList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error)
          });
      }
    }
  }

  /**
   * generate formData for add software
   * @returns FormData required for updating software
   */
  private createAddSoftwareData(): FormData {
    const title = this.addSoftwareForm.controls.title.value.trim();
    const description = this.addSoftwareForm.controls.description.value;
    const view = this.addSoftwareForm.controls.view.value;
    const ref_doc  = this.file;
    
    //permissions  
    var formData = new FormData();
    formData.append("access_token", this.commonService.loginData.access_token);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("view", view);
    if(!this.is_editing_software){
      formData.append("ref_doc", ref_doc);
    }else{
      if(this.softwareUpdated){
        formData.append('is_software_updated', this.softwareUpdated?'1':'0')
        formData.append('ref_doc', ref_doc);
      }else{
        formData.append('is_software_updated', this.softwareUpdated?'1':'0')
        formData.append('url', this.addSoftwareForm.controls.software.value);
      }
    }
   
    return formData;
  }
  /**
   * on edit manager click 
   * @param item manager to be edited
   */
  editSoftware(item: any) {
    this.is_editing_software = true;
    this.is_editing_software_id = item.software_id;
    this.initEditSoftwareForm(item);
  }





  blockSoftware(item: any) {
    console.log(item.is_active,'???')
    this.confirmationService.showPopup = true;
    let blockStatus =  (item.is_active) ? 0 : 1;
    this.blockSoftwareConfirm(item.software_id , blockStatus);
  }

  blockSoftwareConfirm(software_id: number, blockStatus: number){
    var confirmText = blockStatus ? 'Activate' : 'Deactivate';
    this.confirmationService.confirm({
      header: "Confirm Block",
      message: "Are you sure you want to "+confirmText+" this Software?",
      accept: () => {
        this.commonService.showLoader = true;
        this.settingsService.inactiveSoftware(software_id , blockStatus).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.getAllSoftwareList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
            
          },
          error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error);
          });
      }
    })
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
  onCancelClick() {
    this.showAddSoftwarePopup = false;
  }
  /**
   * confirmation for delete service
   * @param item service to be deleted
   */
  deleteNotificationItem(item: any) {
    console.log(item,'???')
    this.gaService.emitEvent('v4_app_tookanapp_service', 'delete_service_from_service', 'delete_service_from_service');
    const id = item.software_id;
    this.deleteNotification(id);
  }
  onFilterChange(event) {
    this.onPageChange({ rows: +this.rows, first: 0 }, this.rows, event.filteredValue);
  }

  onPageChange(event, allowedRows: number, array: Array<any>) {
    this.infotext = this.commonService.onPageChange(event, allowedRows, this.ptable.filteredValue || array);
  }

  ngOnDestroy() {
    this.commonService.removeTemplateFromHeader();
  }


}
