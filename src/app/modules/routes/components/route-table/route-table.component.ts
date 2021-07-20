import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, AfterViewInit } from '@angular/core';
import { Table } from 'primeng/table';
import { IRouteData, IAgentList, IAssignFleet, ITaskDetail } from '../../interfaces/interface';
import { CommonService } from '../../../../services/common.service';
import { RoutesService } from '../../services/routes.service';
import { ModalType } from '../../../../../constants/constants';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ConfirmationService } from '../../../jw-notifications/services/confirmation.service';
import { GaService } from '../../../../services/ga.service';

@Component({
  selector: 'app-route-table',
  templateUrl: './route-table.component.html',
  styleUrls: ['./route-table.component.scss']
})
export class RouteTableComponent implements OnInit , OnDestroy , AfterViewInit {
  @ViewChild('dt') ptable: Table;
  @ViewChild('buttonTemplate') teamListDropdown: TemplateRef<any>;
  public totalRecords;
  public rows = 10;
  public infotext;
  public columns;
  public routesData: Array<IRouteData> = [];
  public agentsList: Array<IAgentList> = [];
  public showPolylinePopup: boolean;
  public selectedRoute: number;
  public selectedPolyline;
  public showAgentPopup: boolean;
  public popupModalType = ModalType;
  public selectedDate;
  job_data_forpopup;

  public  bsConfig: Partial<BsDatepickerConfig>;
  public showTaskIdPopup: boolean;
  public taskList: Array<string>;
  public tasksData : Array<ITaskDetail> = [];
  public taskPopupHeader: string;
  private colorTheme = 'theme-blue';
  private prevSelectedDate;
  private selectedUserId: string;
  private routeMapData :Array<IAssignFleet> = [];
  constructor(public commonService: CommonService, private routesService: RoutesService, private customMessage: CustomMessageService, private confirmationService: ConfirmationService, private gaService: GaService) { }

  ngOnInit() {
    window['dd'] = this;
    this.taskPopupHeader = 'Task Details';
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme },{showWeekNumbers:false}, { dateInputFormat: this.commonService.loginData.date_format });
    this.selectedDate = new Date();
    this.prevSelectedDate = new Date();
    this.getAllRoutesData();
    this.setColumns();
    this.gaService.emitEvent('v3_app_tookanapp_routes_page', 'route_page_opened', this.commonService.loginData.email);
  }

  ngAfterViewInit() {
    this.commonService.appendTemplateToHeader(this.teamListDropdown, 'left');
  }

  getAllRoutesData() {
    this.commonService.showLoader = true; //replace(/\//g, "-")
    this.routesService.getRoutesForDate(this.selectedDate.toLocaleDateString('en-GB').replace(/\//g, "-")).subscribe(
      response => {
        this.routesData = response.data;
        this.totalRecords = this.routesData.length;
        this.commonService.showLoader = false;
      },
      error => {
        console.log(error);
        this.commonService.showLoader = false;
      }
    )
  }

  setColumns() {
    this.columns = [
      { field: 'route_id', header: 'ROUTE ID' },
      { field: 'team_name', header: 'TEAM NAME ' },
      {field: 'fleet_name', header: 'AGENT NAME '},
      {field: 'status', header: 'STATUS'},
      {field: 'actions', header: 'ACTIONS'}
    ];
  }

  openAssignAgentPopup(routeID: number , userId: string) {
    this.selectedRoute = routeID;
    this.selectedUserId = userId;
    this.showAgentPopup = true;
  }

  showRoutePreview(polylineData: Array<string>,taskArray: Array<string> , userId: string) {
    this.selectedPolyline = polylineData;
    this.routesService.fetchTaskDetails(taskArray , userId).subscribe(
      response => {
        this.tasksData = response.data;
        
        this.showPolylinePopup = true;
       
      
      },
      error => {
        console.log(error);
      }
    )
   
  }
  
  assignRouteToFleet(routeMapData: Array<IAssignFleet> ) {
    this.routeMapData = routeMapData;
  }

  assignAgent() {
    this.commonService.showLoader = true;
    this.routesService.assignFleetToRoute(this.selectedDate.toLocaleDateString('en-GB').replace(/\//g, "-"),this.routeMapData, this.selectedUserId).subscribe(
      response => {
      this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
      this.showAgentPopup = false;
      this.commonService.showLoader = false;
      this.getAllRoutesData();
      },
      error => {
        this.commonService.handleError(error);
        this.commonService.showLoader = false;
      }
    )
  }

  unassignAgent(routeId: number , fleetId: number , userId: string) {
      this.commonService.showLoader = true;
      let unassignData = [{
        route_id: routeId,
        fleet_id: fleetId
      }]
      this.routesService.unassignFleetFromRoute(this.selectedDate.toLocaleDateString('en-GB').replace(/\//g, "-") , unassignData , userId).subscribe(
        response => {
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });  
        this.getAllRoutesData(); 
        },
        error => {
          this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message});

        })
  }

  onDateChange() {
    this.selectedDate = new Date(this.selectedDate);
    if(this.prevSelectedDate.toDateString() != this.selectedDate.toDateString()) {
      this.getAllRoutesData();
    }
   
    this.prevSelectedDate = this.selectedDate;
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

  onCancelClick() {
    this.showPolylinePopup = false;
    this.showAgentPopup = false;
    this.showTaskIdPopup = false;
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


  deleteRoute(routeID:number, fleetId: string , userId: string) {
    this.confirmationService.showPopup = true;
    console.log(fleetId);
    this.deleteRouteConfirm(routeID, fleetId , userId);
  }

  deleteRouteConfirm(routeID:number, fleetId: string , userId: string ) {
    this.confirmationService.confirm({
      header: "Confirm Delete",
      message: "Are you sure you want to delete this Route?",
      accept: () => {
        this.commonService.showLoader = true;

        this.routesService.deleteRoute(routeID , this.selectedDate.toLocaleDateString('en-GB').replace(/\//g, "-"), fleetId ,userId )
          .subscribe(response => {
            this.commonService.showLoader = false;
            this.getAllRoutesData();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.showLoader = false;
            this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
          })
      }
    })
  }


  showTaskList(taskList) {
    console.log('=============?',taskList)


    this.showTaskIdPopup = true;
    this.taskList = taskList;

  }



  ngOnDestroy() {
    this.commonService.removeTemplateFromHeader();
  }

}



