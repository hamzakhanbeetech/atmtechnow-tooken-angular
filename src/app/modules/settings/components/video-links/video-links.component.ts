import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, TemplateRef } from '@angular/core';
import { ConfirmationService } from '../../../jw-notifications/services/confirmation.service';
import { SettingsService } from '../../services/settings.service';
import { CommonService } from '../../../../services/common.service';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalType } from '../../../../../constants/constants';
import { environment } from '../../../../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { GaService } from '../../../../services/ga.service';
import { constants } from '../../../../../constants/constants';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-video-links',
  templateUrl: './video-links.component.html',
  styleUrls: ['./video-links.component.scss','../developers/developers.component.scss']
})
export class VideoLinksComponent implements OnInit {

  @ViewChild('dt') ptable: Table;
  @ViewChild('buttonTemplate') buttonTemp: TemplateRef<any>;

  private videosSub: Subscription;
  public addVideosForm: FormGroup;
  public showAddVideoPopup: boolean;
  public showDeleteVideoPopup: boolean;
  public videosList: Array<any> = [];
  public totalRecords: number = 0;
  public rows: number = 25;
  public infotext: string;
  public is_editing_video: boolean;
  public is_editing_video_id: number;
  public delete_video_id:number;
  public video_popup_action_title: string;
  public form_list: Array<any> = [];
  public showPassword:boolean =false;
  public showDeletePassword:boolean =false;
  public password;
  public popupModalType = ModalType;
  public columns = [
    { field: 'id', header: 'ID' },
    { field: 'title', header: 'Title' },
    { field: 'description', header: 'Description' },
    { field: 'link', header: 'Link' },
    { field: 'added_on', header: 'Added On' },
    { field: 'action', header: 'Actions' }
  ]

    constructor(private confirmationService: ConfirmationService, private settingsService: SettingsService,
    public commonService: CommonService, private customMessage: CustomMessageService, private formBuilder: FormBuilder,
    private gaService: GaService) { }

  ngOnInit() {
    this.getAllVideosList();
    window['video-link'] = this;
  }
  ngAfterViewInit() {
    this.commonService.appendTemplateToHeader(this.buttonTemp);
  }

    /**
* Initialising add video form
*/
initAddVideoForm() {
  this.showAddVideoPopup = true;
  this.video_popup_action_title = 'Add video';
  this.addVideosForm = this.formBuilder.group({
    'title': ['', [Validators.required]],
    'description': ['', [Validators.required]],
    'link': ['', [Validators.required,Validators.pattern(constants.linkPattern)]],
    'password':['']
  });
}
 /**
* initialize edit video form
* @param item video to be edited
*/
private initEditVideoForm(item: any) {
  this.initAddVideoForm();
  if(this.showPassword){
    this.addVideosForm.controls['password'].setValidators([Validators.required]);
  }else{
    this.addVideosForm.controls.password.clearValidators();
  }
  this.addVideosForm.setValue({
    'title': item.title,
    'description': item.description,
    'link': item.video_link,
    'password':''
  });
  this.video_popup_action_title = 'Edit Video';
}
  /**
    * confirm & delete selected video
    * @param videos id of video to be deleted
    */
   public deleteVideo() {
      let body: any = {
        video_id: this.delete_video_id,
        is_deleted: 1,
        };
        if(this.showDeletePassword){
          body.password = this.password;
        }
        this.settingsService.deleteVideo(body)
          .subscribe(response => {
            //loaderhide
            this.getAllVideosList();
            this.showDeleteVideoPopup = false;
            this.password ='';
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.handleError(error);
          })
  }
  //public methods
  /**
   * start get list of videos
   */
  getAllVideosList() {
    this.gaService.emitEvent('v4_app_tookanapp_manager', 'manager_page_land_dashboard', 'manager_page_land_dashboard');
    if (this.videosSub)
      this.videosSub.unsubscribe();

    this.videosSub = this.settingsService.getAllVideos().subscribe(
      response => {
        this.videosList = Array.isArray(response.data.videoDetails) ? response.data.videoDetails : [];
        this.totalRecords = this.videosList.length;
        this.onPageChange({ rows: +this.rows, first: 0 }, this.rows, this.videosList);
      }, error => {
        this.videosList = [];
        this.commonService.handleError(error);
      });
  }

  showAddPopup() {
    this.is_editing_video = false;
    this.initAddVideoForm();
  }

  //api call for add video
  addVideo() {
    this.gaService.emitEvent('v4_app_tookanapp_manager', 'add_manager_from_dashboard', 'add_manager_from_dashboard');
    if (!this.addVideosForm.valid) {
      return this.commonService.validateAllFormFields(this.addVideosForm);
    } else {
      let body: any = this.createAddVideoData();
      this.commonService.showLoader = true;
      if (!this.is_editing_video) {
        this.settingsService.addVideo(body).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.showAddVideoPopup = false;
            this.getAllVideosList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error)
          });
      } else {
        body.video_id = this.is_editing_video_id;
        this.settingsService.editVideo(body).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.showAddVideoPopup = false;
            this.getAllVideosList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error)
          });
      }
    }
  }

  /**
 * create request body for add/edit video
 * @returns  data
 */
private createAddVideoData(): any {
  const title = this.addVideosForm.controls.title.value.trim();
  const description = this.addVideosForm.controls.description.value;
  const link = this.addVideosForm.controls.link.value;
 
  //permissions
  let body: any = {
    title: title,
    description: description,
    video_link:link,
    
  };
  if(this.showPassword){
    const password = this.addVideosForm.controls.password.value;
    body.password = password;
  }
  return body;
}
  /**
   * on edit manager click 
   * @param item manager to be edited
   */
  editVideoItem(item: any) {
    this.is_editing_video = true;
    this.is_editing_video_id = item.video_id;
    console.log(this.commonService.loginData.dispatcher_user_id,this.commonService.loginData.user_id)
    if(this.commonService.loginData.dispatcher_user_id==null &&(this.commonService.loginData.user_id != item.company_id)){
      this.showPassword = true;
    }else{
      this.showPassword = false;
    }
    this.initEditVideoForm(item);
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
      this.showAddVideoPopup = false;
      this.showDeleteVideoPopup = false;
    }
/**
   * confirmation for delete service
   * @param item service to be deleted
   */
  deleteVideoItem(item: any) {
    this.showDeleteVideoPopup = true;
    this.gaService.emitEvent('v4_app_tookanapp_service', 'delete_video_from_video', 'delete_video_from_video');
    this.delete_video_id = item.video_id;
    // const id = item.video_id.toString();
    if(this.commonService.loginData.dispatcher_user_id==null &&(this.commonService.loginData.user_id != item.company_id)){
      this.showDeletePassword = true;
    }else{
      this.showDeletePassword = false;
    }
    // this.deleteVideo(id);
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
