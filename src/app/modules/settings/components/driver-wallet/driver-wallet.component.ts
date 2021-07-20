
import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/components/table/table';
import { LazyLoadEvent } from 'primeng/components/common/lazyloadevent';
import { CommonService } from '../../../../services/common.service';
import { SettingsService } from '../../services/settings.service';
import { IAgentData } from '../../interfaces/interfaces';
import { BsDatepickerConfig, BsDaterangepickerDirective } from 'ngx-bootstrap/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GaService } from '../../../../services/ga.service';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { TransactionType, WalletType } from '../../enums/wallet.enum';
import { IWalletBalance } from '../../interfaces/wallet.interface';
@Component({
  selector: 'app-driver-wallet',
  templateUrl: './driver-wallet.component.html',
  styleUrls: ['./driver-wallet.component.scss', '../developers/developers.component.scss']
})
export class DriverWalletComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('dt') ptable: Table;
  @ViewChild('filterTemplate') teamListDropdown: TemplateRef<any>;
  @ViewChild('buttonTemplate') buttonTemp: TemplateRef<any>;


  //Enums
  transactionTypeEnum = TransactionType;
  walletTypeEnum = WalletType;

  showAddTransactionPopup: boolean;
  walletBalance: IWalletBalance[] = [];

  //p-table
  totalRecords: number = 0;
  rows: number = 25;
  infotext: string;
  agentWalletData;
  private offsetRows: number = 0;;
  columns = [];

  //wallet dropdown filter
  walletFilters: Array<{ label: string, value: number }> = [];
  selectedWalletFilter: { label: string, value: number };

  //agent dropdwon
  agentOptions: Array<IAgentData> = [];
  selectedAgentOption;

  //dropdown
  dropdownIcon = 'fa fa-fw fa-caret-down';
  dropdownUpIcon = 'fa fa-fw fa-caret-up';
  dropdownDownIcon = 'fa fa-fw fa-caret-down';
  selectedAgent;
  selectedDate;

  //ngx-bootstrap
  bsConfig: Partial<BsDatepickerConfig>;
  addTransactionForm: FormGroup;
  private colorTheme = 'theme-blue';

  constructor(public commonService: CommonService, private settingsService: SettingsService,
    private customMessage: CustomMessageService, private gaService: GaService,
    private formBuilder: FormBuilder, private router: Router) { }

  ngOnInit() {
    window['agent'] = this;
    this.setColumns();
    this.setWalletFilters();
    this.selectedDate = [new Date(), new Date()];
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme }, { rangeInputFormat: this.commonService.loginData.date_format });
    this.selectedAgent = {
      username: 'All '+this.commonService.loginData.call_fleet_as,
      fleet_id: -1
    };
    this.getAllAgents();
  }

  ngAfterViewInit() {
    this.commonService.appendTemplateToHeader(this.teamListDropdown, 'left');
    this.commonService.appendTemplateToHeader(this.buttonTemp, 'right');
  }


  getAllAgents() {
    this.settingsService.getAllAgents().subscribe(
      response => {
        if (response.data)
          this.agentOptions = response.data;
          this.agentOptions.unshift({
            username: 'All '+this.commonService.loginData.call_fleet_as,
            fleet_id: -1
          });
        this.selectedAgent = this.agentOptions[0];
        this.onSelectedAgentWalletData();
      },
      error => {
        console.log(error);
      }
    )
  }


  /**
   * 
   * @param event  
   *  //event.first = First row offset
        //event.rows = Number of rows per page
        //event.sortField = Field name to sort with
        //event.sortOrder = Sort order as number, 1 for asc and -1 for dec
        //filters: FilterMetadata object having field as key and filter value, filter matchMode as value
   */
  onLazyLoad(event: LazyLoadEvent) {
    this.offsetRows = event.first;
    this.onSelectedAgentWalletData();
    // this.onPageChange(event,this.rows,this.agentWalletData)
  }

  setInfoText(totalRecords) {
    let count = +this.ptable.rows + (+this.ptable.first) > totalRecords ? totalRecords : +this.ptable.rows + (+this.ptable.first);
    let first = this.ptable.first > totalRecords ? totalRecords : this.ptable.first;
    this.infotext = `Showing ${first + 1} - ${count} of ${totalRecords} entries`
  }

  /**
   * On selection of agent
   * for which we want to fetch 
   * call history
   * @param isExport
   */
  onSelectedAgentWalletData(isExport?: boolean) {
    if (!this.selectedAgent) return;

    const fleetID = this.selectedAgent.fleet_id || this.agentOptions[0].fleet_id
    let startDate = this.selectedDate[0].toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
    let endDate = this.selectedDate[1].toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
    const walletType = this.selectedWalletFilter.value || undefined;

    this.settingsService.getAgentWalletData(fleetID, startDate, endDate, this.offsetRows, +this.rows, walletType, isExport).subscribe(
      response => {
        if (isExport) {
          this.exportTransactions(response)
        } else {
          this.agentWalletData = response.data.transaction_history;
          this.walletBalance = response.data.wallet_balance;
          this.totalRecords = response.data.total_count;
          setTimeout(() => { this.setInfoText(this.totalRecords); })
        }

        // this.onPageChange({ rows: +this.rows, first: 0 }, this.rows, this.agentWalletData);
      },
      error => {
        console.log(error);
      })


  }
  /**
   * show popup
  */
  showAddPopup() {
    this.showAddTransactionPopup = true;
    this.initAddTransactionForm();
  }
  /**
  * Initialising add Transaction form
  */
  initAddTransactionForm() {
    this.addTransactionForm = this.formBuilder.group({
      'order_id': [''],
      'amount': ['',[ Validators.required,Validators.min(0)]],
      'transaction_type': ['', Validators.required],
      'wallet_type': ['', Validators.required],
      'description': [''],
      'remarks': ['']
    });
  }
  /**
  * api call for add transaction
  */
  addTransaction() {
    //show loader
    this.gaService.emitEvent('v4_app_tookanapp_transaction', 'add_transaction_from_dashboard', 'add_transaction_from_dashboard');
    if (!this.addTransactionForm.valid) {
      return this.commonService.validateAllFormFields(this.addTransactionForm);
    } else {
      const order_id = this.addTransactionForm.controls.order_id.value;
      const amount = this.addTransactionForm.controls.amount.value || '';
      const transaction_type = this.addTransactionForm.controls.transaction_type.value || '';
      const description = this.addTransactionForm.controls.description.value || '';
      const remarks = this.addTransactionForm.controls.remarks.value || '';
      const fleet_id = this.selectedAgent.fleet_id || this.agentOptions[0].fleet_id;
      const wallet_type =  this.addTransactionForm.controls.wallet_type.value || '';
      this.commonService.showLoader = true;
      this.settingsService.addTransaction(fleet_id, amount, order_id, transaction_type, description, remarks,wallet_type).subscribe(
        response => {
          this.commonService.showLoader = false;
          this.showAddTransactionPopup = false;
          this.onSelectedAgentWalletData();
          this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
        }, error => {
          this.commonService.showLoader = false;
          this.showAddTransactionPopup = false;
          this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
        });
    }

  }
  /**
   * close popup
   */
  onCancelClick() {
    this.showAddTransactionPopup = false;
  }

  exportTransactions(res) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(res));
    element.setAttribute('download', 'transactions.csv');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  /**
   * set columns for p-table
   */
  private setColumns() {
    this.columns = [
      { field: 'reference_id', header: 'Order ID' },
      { field: 'creation_datetime', header: 'creation Datetime' },
      { field: 'username', header: 'Userame' },
      { field: 'amount', header: 'Amount' },
      { field: 'transaction_type', header: 'Transaction Type' },
      { field: 'description', header: 'Description' },
      { field: 'remarks', header: 'Remarks' },
    ]
  }

  private setWalletFilters(): any {
    this.walletFilters = [
      { label: "Wallet Type- All", value: 0 },
      { label: "Wallet", value: WalletType.WALLET },
      { label: "Credits", value: WalletType.CREDITS },
    ];
    this.selectedWalletFilter = this.walletFilters[0];
  }

  ngOnDestroy() {
    this.commonService.removeTemplateFromHeader();
  }
}
