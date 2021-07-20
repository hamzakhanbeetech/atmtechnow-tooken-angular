import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/components/table/table';
import { CommonService } from '../../../../services/common.service';
import { SettingsService } from '../../services/settings.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalType } from '../../../../../constants/constants';


@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss', '../developers/developers.component.scss']
})
export class PaymentsComponent implements OnInit , AfterViewInit , OnDestroy {
  @ViewChild('dt') ptable: Table;
  @ViewChild('buttonTemplate') teamListDropdown: TemplateRef<any>;
  public popupModalType = ModalType;
  public technicianEarningData;
  ismerchant;
  serviceData=[];
  showPopup:boolean=false;
  public customerEarningData;
  public totalRecords: number = 0;
  public rows: number = 25;
  public infotext: string;
  public columns = [
    { field: 'fleet_id', header: 'Technician ID' },
    { field: 'username', header: 'Technician Name' },
    { field: 'company_name', header: 'Company Name' },
    { field: 'number_of_services', header: 'Number of Services Completed' },
    { field: 'service_price', header: 'Job Amount' },
    { field: 'total_amount', header: 'Additional Service Amount' },
    { field: 'total_earnings', header: 'Total Earning' },
    { field: 'admin_amount', header: 'Admin Amount' },

  ];
  public customer_columns = [
    { field: 'customer_id', header: 'Customer ID' },
    { field: 'email', header: 'Customer Email' },
    { field: 'number_of_bookings', header: 'Total Number of Requests Raised' },
    { field: 'add_on_price', header: 'Add-ons Charges' },
    { field: 'cancellation_amount', header: 'Cancellation Charges' },
    { field: 'tip_amount', header: 'Tips' },
    { field: 'total_amount', header: 'Service/Task Charges' },
  ];
  public style1 : boolean=true;
  public daterange: any = {};
  public options: any = {
    locale: { format: 'MM/DD/YYYY' },
    alwaysShowCalendars: true,
    ranges: {
      'Today': [new Date(), new Date()],
      'Yesterday': [new Date(new Date().setDate(new Date().getDate()-1)), new Date(new Date().setDate(new Date().getDate()-1))],
      'Last 7 Days': [new Date(new Date().setDate(new Date().getDate()-6)), new Date()],
      'Last 30 Days': [new Date(new Date().setDate(new Date().getDate()-29)), new Date()],
      'This Month': [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)],
      'Last Month': [new Date(new Date().getFullYear(), new Date().getMonth()-1, 1), new Date(new Date().getFullYear(), new Date().getMonth(), 0)]
    },
    startDate:new Date(),
    endDate : new Date()
  };
  public dropdownIcon = 'fa fa-fw fa-caret-down';
  public dropdownUpIcon = 'fa fa-fw fa-caret-up';
  public dropdownDownIcon = 'fa fa-fw fa-caret-down';
  private colorTheme = 'theme-blue';
  constructor(public commonService: CommonService, private settingsService: SettingsService , private formBuilder: FormBuilder) { }

  ngOnInit() {
    window['payment'] = this;
    this.daterange ={
        start:new Date(),
        end:new Date(),
        label:'Today'
    }
    this.ismerchant=this.commonService.loginData.is_merchant;
  }

  ngAfterViewInit() {
    this.commonService.appendTemplateToHeader(this.teamListDropdown, 'left');
    this.onSelectedDate(this.daterange);
  }
  showTechnicianBreakdown(rowData){
    this.showPopup=true;
    this.serviceData=rowData.service_data
  }
  showCustomerBreakdown(rowData){
    this.showPopup=true;
    this.serviceData=rowData.service_data
  }
  onPopupCancelClick(){
    this.showPopup=false;

  }
  openCustomerEarning(val){
    if(val){
      this.style1 =false;
      this.onSelectedDate(this.daterange);
    }else{
      this.style1 =true;
      this.onSelectedDate(this.daterange);
    }
  }

  onSelectedDate(value: any, datepicker?: any) {
    // this is the date the iser selected
    console.log(value.start,value.end);

    // any object can be passed to the selected event and it will be passed back here
    // datepicker.start = value.start;
    // datepicker.end = value.end;
    // or manupulat your own internal property
    this.daterange.start = value.start;
    this.daterange.end = value.end;
    this.daterange.label = value.label;
    if(this.style1){
      this.settingsService.getPaymentEarningData(value.start , value.end).subscribe(
        response => {
          this.technicianEarningData =  response.data.fleetEarningsData;
        },
        error => {
          console.log(error);
        })
    }else{
      this.settingsService.getCustomerEarningData(value.start , value.end).subscribe(
        response => {
          this.customerEarningData =  response.data.customerDetails;
        },
        error => {
          console.log(error);
        })
    }
    
}
exportEarning(data){
  this.settingsService.exportEarning(data,this.style1).subscribe(
    response => {
      this.exportPayments(response)
    },
    error => {
      console.log(error);
    })
} 
exportPayments(res) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(res));
  if(this.style1){
    element.setAttribute('download', 'technicianEarning.csv');
  }else{
    element.setAttribute('download', 'customerEarning.csv');
  }
 

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
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
    if(this.ptable)
    this.infotext = this.commonService.onPageChange(event, allowedRows, this.ptable.filteredValue || array);
  }


  ngOnDestroy() {
    this.commonService.removeTemplateFromHeader();
  }
}
