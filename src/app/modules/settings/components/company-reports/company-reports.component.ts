import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/components/table/table';
import { CommonService } from '../../../../services/common.service';
import { SettingsService } from '../../services/settings.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({ 
  selector: 'app-company-reports',
  templateUrl: './company-reports.component.html',
  styleUrls: ['./company-reports.component.scss', '../developers/developers.component.scss']
})
export class CompanyReportsComponent implements OnInit , AfterViewInit , OnDestroy {
  @ViewChild('dt') ptable: Table;
  @ViewChild('buttonTemplate') teamListDropdown: TemplateRef<any>;

  public companyEarningData;
  public totalRecords: number = 0;
  public rows: number = 25;
  public infotext: string;
  public columns = [
    { field: 'user_id', header: 'Company ID' },
    { field: 'company_name', header: 'Company Name' },
    { field: 'email', header: 'Email ID' },
    { field: 'manager_count', header: 'Managers' },
    { field: 'technicians', header: 'Technicians' },
    { field: 'status', header: 'Status' },
    { field: 'number_of_bookings', header: 'Number of Bookings' }
  ];
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
    this.onSelectedDate(this.daterange);
  }

  ngAfterViewInit() {
    this.commonService.appendTemplateToHeader(this.teamListDropdown, 'left');
  }

  onSelectedDate(value: any, datepicker?: any) {
    // this is the date the iser selected
    console.log(value.start,value.end);
    this.daterange.start = value.start;
    this.daterange.end = value.end;
    this.daterange.label = value.label;

    this.settingsService.getCompanyEarningData(value.start , value.end).subscribe(
      response => {
        this.companyEarningData =  response.data.companyDetails;
      },
      error => {
        console.log(error);
      })
}
exportEarning(data){
  this.settingsService.exportCompanyEarning(data).subscribe(
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
  element.setAttribute('download', 'companyDetails.csv');

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
    this.infotext = this.commonService.onPageChange(event, allowedRows, this.ptable.filteredValue || array);
  }


  ngOnDestroy() {
    this.commonService.removeTemplateFromHeader();
  }
}
