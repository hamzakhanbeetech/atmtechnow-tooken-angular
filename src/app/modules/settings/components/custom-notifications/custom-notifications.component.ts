// import { Component, OnInit } from '@angular/core';



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
  selector: 'app-custom-notifications',
  templateUrl: './custom-notifications.component.html',
  styleUrls: ['./custom-notifications.component.scss', '../developers/developers.component.scss']
})

export class CustomNotificationsComponent implements OnInit {

  @ViewChild('dt') ptable: Table;
  @ViewChild('buttonTemplate') buttonTemp: TemplateRef<any>;
  @ViewChild('fileInput') fileInput: ElementRef;

  private notificationsSub: Subscription;
  public addCustomNotificationForm: FormGroup;
  public showAddNotificationPopup: boolean;
  public notificationsList: Array<any> = [];
  public totalRecords: number = 0;
  public rows: number = 25;
  public infotext: string;
  public is_editing_notification: boolean;
  public is_editing_notification_id: number;
  public service_popup_action_title: string;
  public form_list: Array<any> = [];
  public imageUrl :string;
  public oneRequired :boolean;
  public ImageVideoSelected:boolean;
  public showPassword:boolean =false;
  public columns = [
    { field: 'id', header: 'ID' },
    { field: 'title', header: 'Title' },
    { field: 'description', header: 'Description' },
    { field: 'added_on', header: 'Added On' },
    { field: 'action', header: 'Actions' }
  ];
  file;
  constructor(private confirmationService: ConfirmationService, private settingsService: SettingsService,
    public commonService: CommonService, private customMessage: CustomMessageService, private formBuilder: FormBuilder,
    private gaService: GaService) { }

  ngOnInit() {
    this.getAllNotificationList();
    window['addon-service'] = this;
  }
  ngAfterViewInit() {
    this.commonService.appendTemplateToHeader(this.buttonTemp);
  }


  /**
* Initialising add service form
*/
  initAddNotificationForm(val) {
    this.showAddNotificationPopup = true;
    this.service_popup_action_title = 'Add Custom Notification';
    this.ImageVideoSelected = true;
    this.addCustomNotificationForm = this.formBuilder.group({
      'title': ['', Validators.required],
      'description': ['', Validators.required],
      'merchant': [false],
      'technician': [false],
      'atmOperator': [false],
      'image': [''],
      'videoUrl':[''],
      'password':['']
    });
    this.updateImageVideo(0); 
  }
  /**
* initialize edit service form
* @param item service to be edited
*/
  private initEditServiceForm(item: any) {
    this.initAddNotificationForm(1);
    const merchantValue = item.notification_type.find(function(element) {
      if(element == 0){
        return 1;
      }
    });
    const atmOperatorValue = item.notification_type.find(function(element) {
      if(element == 1){
        return 1;
      }
    });
    const technicianValue = item.notification_type.find(function(element) {
      if(element ==2){
     return 1;
      }
    });
    this.updateImageVideo(item.is_video);
    this.ImageVideoSelected = item.is_video?false:true;
    if(this.showPassword){
      this.addCustomNotificationForm.controls['password'].setValidators([Validators.required]);
    }else{
      this.addCustomNotificationForm.controls.password.clearValidators();
    }
    this.addCustomNotificationForm.setValue({
      'title': item.title,
      'description': item.description,
      'merchant': merchantValue?true:false,
      'atmOperator': atmOperatorValue?true:false,
      'technician': technicianValue?true:false,
      'image': item.is_video?'':item.url,
      'videoUrl':item.is_video?item.url:'',
      'password':''
    });
    this.service_popup_action_title = 'Edit Custom Notification';
  }
  /**
    * confirm & delete selected service
    * @param services id of services to be deleted
    */
  private deleteNotification(notification_id: string) {
    console.log(notification_id,'???')
    this.confirmationService.confirm({
      header: "Confirm Delete",
      message: "Are you sure you want to delete this Custom Notification ?",
      accept: () => {
        //showLoader
        this.settingsService.deleteNotification(notification_id)
          .subscribe(response => {
            //loaderhide
            this.getAllNotificationList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.handleError(error);
          })
      }
    })
  }
  sendCustomers(item:any){
    this.commonService.showLoader = true;
    this.settingsService.sendNotificationtoCustomers(item.notification_id).subscribe(
      response => {
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
      }, error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error)
      });
  }
  //public methods
  /**
   * start get list of services
   */
  getAllNotificationList() {
    this.gaService.emitEvent('v4_app_tookanapp_manager', 'manager_page_land_dashboard', 'manager_page_land_dashboard');
    if (this.notificationsSub)
      this.notificationsSub.unsubscribe();

    this.notificationsSub = this.settingsService.getAllNotifications().subscribe(
      response => {
        this.notificationsList = Array.isArray(response.data.customNotifications) ? response.data.customNotifications :[];
        this.totalRecords = this.notificationsList.length;
        this.onPageChange({ rows: +this.rows, first: 0 }, this.rows, this.notificationsList);
      }, error => {
        this.notificationsList = [];
        this.commonService.handleError(error);
      });
  }

  showAddPopup() {
    this.is_editing_notification = false;
    this.oneRequired = false;
    this.initAddNotificationForm(0);
  }
  
  updateImageVideo(value){
    if(value){
      this.addCustomNotificationForm.controls.image.clearValidators();
      this.addCustomNotificationForm.controls['videoUrl'].setValidators([Validators.required]);
      this.ImageVideoSelected = false ;
    }else{
      this.addCustomNotificationForm.controls.videoUrl.clearValidators();
      this.addCustomNotificationForm.controls['image'].setValidators([Validators.required]);
      this.ImageVideoSelected = true;
      
    }
    this.addCustomNotificationForm.controls.image.updateValueAndValidity();
      this.addCustomNotificationForm.controls['videoUrl'].updateValueAndValidity();
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
      //if (!file.type.match(imageType)) {
      //
      //}
      var reader = new FileReader();
      reader.onload = (e: any) => {
        this.addCustomNotificationForm.controls.image.patchValue(e.target.result);
      }
      reader.readAsDataURL(file);
      let data = new FormData();
      data.append('ref_image', this.file ? this.file : this.addCustomNotificationForm.controls.image.value);
      this.settingsService.getImageUrl(data).subscribe(
        response => {
          this.imageUrl = response.data.ref_image;
          // console.log(this.imageUrl,'???')
        }, error => {
          this.commonService.handleError(error)
        });
    }
    // f.click();
  }



  //api call for add service
  addNotification() {
   if(!this.addCustomNotificationForm.controls.merchant.value && !this.addCustomNotificationForm.controls.technician.value && !this.addCustomNotificationForm.controls.atmOperator.value){
    this.oneRequired = true;
    return false;
   }else{
    this.oneRequired = false;
   }

    this.gaService.emitEvent('v4_app_tookanapp_manager', 'add_manager_from_dashboard', 'add_manager_from_dashboard');
    if (!this.addCustomNotificationForm.valid) {
      return this.commonService.validateAllFormFields(this.addCustomNotificationForm);
    } else {
      let body: any = this.createAddNotificationData();
      this.commonService.showLoader = true;
      if (!this.is_editing_notification) {
        this.settingsService.addNotification(body).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.showAddNotificationPopup = false;
            this.getAllNotificationList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error)
          });
      } else {
        body.notification_id = this.is_editing_notification_id;
        this.settingsService.editNotification(body).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.showAddNotificationPopup = false;
            this.getAllNotificationList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error)
          });
      }
    }
  }

  /**
 * create request body for add/edit service
 * @returns IAddserviceData data
 */
  private createAddNotificationData(): any {
    const title = this.addCustomNotificationForm.controls.title.value.trim();
    const description = this.addCustomNotificationForm.controls.description.value;
    const merchant = this.addCustomNotificationForm.controls.merchant.value;
    const technician = this.addCustomNotificationForm.controls.technician.value;
    const atmOperator = this.addCustomNotificationForm.controls.atmOperator.value;
    let newArray = [];
    if(merchant){
      newArray.push(0)
    }
    if(atmOperator){
      newArray.push(1)
    }
    if(technician){
      newArray.push(2)
    }
    //permissions  
    let body: any = {
      title: title,
      description: description,
      url:this.ImageVideoSelected?(this.imageUrl?this.imageUrl:this.addCustomNotificationForm.controls.image.value):
      this.addCustomNotificationForm.controls.videoUrl.value,
      notification_type:newArray,
      is_video :this.ImageVideoSelected?0:1
    };
    if(this.showPassword){
      const password = this.addCustomNotificationForm.controls.password.value;
      body.password = password;
    }
    return body;
  }
  /**
   * on edit manager click 
   * @param item manager to be edited
   */
  editNotification(item: any) {
    this.is_editing_notification = true;
    this.is_editing_notification_id = item.notification_id;
    this.oneRequired = false;
    if(this.commonService.loginData.dispatcher_user_id==null &&(this.commonService.loginData.user_id != item.company_id)){
      this.showPassword = true;
    }else{
      this.showPassword = false;
    }
    this.initEditServiceForm(item);
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
    this.showAddNotificationPopup = false;
  }
  /**
   * confirmation for delete service
   * @param item service to be deleted
   */
  deleteNotificationItem(item: any) {
    console.log(item,'???')
    this.gaService.emitEvent('v4_app_tookanapp_service', 'delete_service_from_service', 'delete_service_from_service');
    const id = item.notification_id;
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
