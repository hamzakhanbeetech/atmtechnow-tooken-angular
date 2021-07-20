import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonService } from '../../../../services/common.service';
import { MerchantService } from '../../services/merchant.service';
import { Table } from 'primeng/table';
import { Route, ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from '../../../jw-notifications/services/confirmation.service';
import { IMerchantData } from '../../interfaces/interface';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-merchant-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class MerchantListComponent implements OnInit {
  @ViewChild('buttonTemplate') buttonTemp: TemplateRef<any>;
  @ViewChild('dt') ptable: Table;
  public merchantsData :Array<IMerchantData> = [];
  public totalRecords;
  public rows =10;
  public infotext;
  public columns;

  constructor(public commonService: CommonService, 
    private merchantService: MerchantService, private router: Router , private confirmationService: ConfirmationService,
  private customMessage: CustomMessageService) { }


  ngOnInit() {
    this.getAllMerchantsData();
    this.setColumns();
  }

  ngAfterViewInit() {
    this.commonService.appendTemplateToHeader(this.buttonTemp);
  }

  setColumns() {
    this.columns = [
      { field: 'id', header: 'ID' },
      { field: 'company_name', header: 'COMPANY NAME' },
      { field: 'username', header: 'FULLNAME ' },
      { field: 'phone', header: 'PHONE' },
      { field: 'email', header: 'EMAIL' },
      { field: 'company_address', header: 'ADDRESS' },
      { field: 'is_blocked', header: 'STATUS' },
      { field: 'action' , header: 'ACTION'}
    ];
  }
  openDashboard(item : IMerchantData)
  {
    this.commonService.getToken(item.id).subscribe(res=>{
      const tookanLink=environment.tookan_link;
      window.open(tookanLink + res.data[0].access_token, "_blank");
    });
    // const tookanLink=environment.tookan_link;
    //   // const tookanLink = 'http://dev-dashboard.techataclick.com'
    //   //    + "/#/page/admin?access_token=";
       
    //   window.open(tookanLink + this.commonService.loginData.access_token, "_blank");

  }

  addMerchantPopup() {
    this.commonService.emitDataToParentWindow('app.merchant.add');
    this.router.navigate(['merchant/add']);
   
  }

  loadUsersLazy(e) {
    this.getAllMerchantsData();
  }

  getAllMerchantsData() {
    this.merchantService.viewMerchantData('asc','').subscribe(
      (response) => {
        this.totalRecords = response.data.iTotalRecords;
        this.merchantsData = response.data.aaData;
        this.onPageChange({ rows: +this.rows, first: 0 }, this.rows, this.merchantsData)
      },
      error => {
        console.log(error);
      }
    )
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

  previewMerchant(item: IMerchantData) {
    this.commonService.emitDataToParentWindow('app.merchant.preview' , {item});
    this.router.navigate(['merchant/preview', item.id]);
  }


  deleteMerchantItem(item : IMerchantData) {
    this.confirmationService.showPopup = true;
    const id = item.id;
    this.deleteMerchant(id);
  }


  deleteMerchant(merchantID: number) {
    this.confirmationService.confirm({
      header: "Confirm Delete",
      message: "Are you sure you want to delete this Affiliate Program?",
      accept: () => {
        this.commonService.showLoader = true;
        this.merchantService.deleteMerchant(merchantID)
          .subscribe(response => {
            this.commonService.showLoader = false;
            this.commonService.emitDataToParentWindow('', { merchantID }, 'deleted_merchant_successfully');
            this.getAllMerchantsData();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.showLoader = false;
            this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
          })
      }
    });
  }

  editMerchant(item: IMerchantData) {
    this.commonService.emitDataToParentWindow('app.merchant.edit' , {item});
    this.router.navigate(['merchant/edit', item.id]);

  
  }

  blockMerchantItem(item: IMerchantData) {
    this.confirmationService.showPopup = true;
    let blockStatus =  (item.is_active) ? 0 : 1;
    this.blockMerchantConfirm(item.id , blockStatus);
 
  }

  blockMerchantConfirm(merchant_id: number, blockStatus: number){
    var confirmText = blockStatus ? 'unblock' : 'block';
    this.confirmationService.confirm({
      header: "Confirm Block",
      message: "Are you sure you want to "+confirmText+" this Affiliate Program?",
      accept: () => {
        this.commonService.showLoader = true;
        this.merchantService.blockMerchant(merchant_id , blockStatus).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.commonService.emitDataToParentWindow('', { merchant_id }, 'blocked_merchant_successfully');
            this.getAllMerchantsData();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
            
          },
          error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error);
          });
      }
    })
  }

  
  ngOnDestroy() {
    this.commonService.removeTemplateFromHeader();
  }

}
