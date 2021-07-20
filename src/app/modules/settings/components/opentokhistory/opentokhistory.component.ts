import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/components/table/table';
import { CommonService } from '../../../../services/common.service';
import { SettingsService } from '../../services/settings.service';
import { IAgentData } from '../../interfaces/interfaces';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ActivatedRoute, Router } from '@angular/router';

@Component({ 
  selector: 'app-opentokhistory',
  templateUrl: './opentokhistory.component.html',
  styleUrls: ['./opentokhistory.component.scss', '../developers/developers.component.scss']
})
export class OpentokhistoryComponent implements OnInit , AfterViewInit , OnDestroy {
  @ViewChild('dt') ptable: Table;
  @ViewChild('buttonTemplate') teamListDropdown: TemplateRef<any>;

  public agentCallHistoryData;
  public selectedAgent;
  public selectedDate;
  public totalRecords: number = 0;
  public rows: number = 25;
  public infotext: string;
  public columns = [
    { field: 'job_id', header: 'Order ID' },
    { field: 'customer_name', header: 'Customer Name' },
    { field: 'date', header: 'Date' },
    { field: 'time', header: 'Time' },
    { field: 'call_duration', header: 'Duration' },
    { field: 'initiated_by', header: 'Outgoing/Incoming' },
  ];
  public agentOptions : Array<IAgentData> = [];
  public selectedAgentOption;
  public dropdownIcon = 'fa fa-fw fa-caret-down';
  public dropdownUpIcon = 'fa fa-fw fa-caret-up';
  public dropdownDownIcon = 'fa fa-fw fa-caret-down';
  public bsConfig: Partial<BsDatepickerConfig>;

  private offsetRows: number = 0;;
  private colorTheme = 'theme-blue';
  constructor(public commonService: CommonService, private settingsService: SettingsService , private formBuilder: FormBuilder, private router: Router) { }

  ngOnInit() {
    window['agent'] = this;
    this.selectedDate = [new Date() , new Date()] ;
    this.bsConfig =  Object.assign({}, { containerClass: this.colorTheme } , { rangeInputFormat: this.commonService.loginData.date_format } );
    this.getAllAgents();
    
  }

  ngAfterViewInit() {
    this.commonService.appendTemplateToHeader(this.teamListDropdown, 'left');
  }


  getAllAgents() {
    this.settingsService.getAllAgents().subscribe(
      response => {
        if (response.data)
          this.agentOptions = response.data;
          this.selectedAgent = this.agentOptions[0];
          this.onSelectedAgentCallHistory(true);
      },
      error => {
        console.log(error);
      }
    )
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
    this.offsetRows = (allowedRows < 25) ? allowedRows : allowedRows - 25;
    console.log(event, allowedRows,'???')
    this.infotext = this.commonService.onPageChange(event, allowedRows, this.ptable.filteredValue || array);
  }

  /**
   * On selection of agent
   * for which we want to fetch 
   * call history
   */
  onSelectedAgentCallHistory(firstCallFlag: boolean) {
    console.log('called ');
    const fleetID = firstCallFlag ? this.agentOptions[0].fleet_id : (this.selectedAgent.fleet_id || this.agentOptions[0].fleet_id);
    let startDate =firstCallFlag ? new Date().toISOString().split('T')[0] : (this.selectedDate[0].toISOString().split('T')[0] ||  new Date().toISOString().split('T')[0]) ;
    let endDate = firstCallFlag ? new Date().toISOString().split('T')[0] : (this.selectedDate[1].toISOString().split('T')[0] || new Date().toISOString().split('T')[0]);
    startDate =startDate+' 00:00:00';
    endDate =endDate+' 23:59:59';
    this.settingsService.getAgentCallHistoryData(fleetID , startDate , endDate , this.offsetRows).subscribe(
      response => {
        console.log(response);
        this.agentCallHistoryData = response.data;
      },
      error => {
        console.log(error);
      })

    
  }

  fetchUrl(id) {
    this.router.navigate(['/settings/callhistory/',id]);
  }

  ngOnDestroy() {
    this.commonService.removeTemplateFromHeader();
  }
}
