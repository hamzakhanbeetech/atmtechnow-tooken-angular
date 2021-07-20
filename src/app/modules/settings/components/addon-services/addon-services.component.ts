import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, TemplateRef } from '@angular/core';
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
  selector: 'app-addon-services',
  templateUrl: './addon-services.component.html',
  styleUrls: ['./addon-services.component.scss', '../cancellation-policy/cancellation-policy.component.scss','../developers/developers.component.scss']
  
})
export class AddonServicesComponent implements OnInit {

  @ViewChild('dt') ptable: Table;
  @ViewChild('buttonTemplate') buttonTemp: TemplateRef<any>;

  private servicesSub: Subscription;
  public addServicesForm: FormGroup;
  public showAddServicePopup: boolean;
  public servicesList: Array<any> = [];
  public totalRecords: number = 0;
  public rows: number = 25;
  public infotext: string;
  public is_editing_service: boolean;
  public is_editing_service_id: number;
  public service_popup_action_title: string;
  public form_list: Array<any> = [];
  public columns = [
    { field: 'id', header: 'ID' },
    { field: 'name', header: 'Services Name' },
    { field: 'price', header: 'Price' },
    { field: 'action', header: 'Actions' }
  ]

  constructor(private confirmationService: ConfirmationService, private settingsService: SettingsService,
    public commonService: CommonService, private customMessage: CustomMessageService, private formBuilder: FormBuilder,
    private gaService: GaService) { }

  ngOnInit() {
    this.getAllServiceList();
    window['addon-service'] = this;
  }
  ngAfterViewInit() {
    this.commonService.appendTemplateToHeader(this.buttonTemp);
  }


  /**
* Initialising add service form
*/
  initAddServiceForm() {
    this.showAddServicePopup = true;
    this.service_popup_action_title = 'Add service';
    this.addServicesForm = this.formBuilder.group({
      'servicename': ['', Validators.required],
      'serviceprice': ['', [Validators.required,Validators.pattern(constants.numbersWithDecimalUptoTwo)]],
    });
  }
  /**
* initialize edit service form
* @param item service to be edited
*/
  private initEditServiceForm(item: any) {
    console.log(item);
    this.initAddServiceForm();
    this.addServicesForm.setValue({
      'servicename': item.name,
      'serviceprice': item.price,
    });
    this.service_popup_action_title = 'Edit Add-on Service';
  }
  /**
    * confirm & delete selected service
    * @param services id of services to be deleted
    */
  private deleteService(service_id: string) {
    this.confirmationService.confirm({
      header: "Confirm Delete",
      message: "Are you sure you want to delete this Service ?",
      accept: () => {
        //showLoader
        this.settingsService.deleteService(service_id)
          .subscribe(response => {
            //loaderhide
            this.getAllServiceList();
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
  getAllServiceList() {
    this.gaService.emitEvent('v4_app_tookanapp_manager', 'manager_page_land_dashboard', 'manager_page_land_dashboard');
    if (this.servicesSub)
      this.servicesSub.unsubscribe();

    this.servicesSub = this.settingsService.getAllServices().subscribe(
      response => {
        this.servicesList = Array.isArray(response.data.addOnServices) ? response.data.addOnServices : [];
        this.totalRecords = this.servicesList.length;
        this.onPageChange({ rows: +this.rows, first: 0 }, this.rows, this.servicesList);
      }, error => {
        this.servicesList = [];
        this.commonService.handleError(error);
      });
  }

  showAddPopup() {
    this.is_editing_service = false;
    this.initAddServiceForm();
  }







  //api call for add service
  addService() {
    this.gaService.emitEvent('v4_app_tookanapp_manager', 'add_manager_from_dashboard', 'add_manager_from_dashboard');
    if (!this.addServicesForm.valid) {
      return this.commonService.validateAllFormFields(this.addServicesForm);
    } else {
      let body: any = this.createAddServiceData();
      this.commonService.showLoader = true;
      if (!this.is_editing_service) {
        this.settingsService.addService(body).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.showAddServicePopup = false;
            this.getAllServiceList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error)
          });
      } else {
        body.id = this.is_editing_service_id;
        this.settingsService.editService(body).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.showAddServicePopup = false;
            this.getAllServiceList();
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
  private createAddServiceData(): any {
    const servciename = this.addServicesForm.controls.servicename.value.trim();
    const serviceprice = this.addServicesForm.controls.serviceprice.value;
    //permissions
    let body: any = {
      name: servciename,
      price: serviceprice,
    };
    return body;
  }
  /**
   * on edit manager click 
   * @param item manager to be edited
   */
  editServiceItem(item: any) {
    this.is_editing_service = true;
    this.is_editing_service_id = item.id;
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
    this.showAddServicePopup = false;
  }
  /**
   * confirmation for delete service
   * @param item service to be deleted
   */
  deleteServiceItem(item: any) {
    this.gaService.emitEvent('v4_app_tookanapp_service', 'delete_service_from_service', 'delete_service_from_service');
    const id = item.id.toString();
    this.deleteService(id);
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
