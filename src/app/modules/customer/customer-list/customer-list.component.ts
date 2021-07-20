import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CustomerService } from '../customer.service';
import { CommonService } from '../../../services/common.service';
import { ConfirmationService } from '../../jw-notifications/services/confirmation.service';

import { CustomMessageService } from '../../../services/custom-message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { constants } from '../../../../constants/constants';
import { IntPhonePrefixComponent } from '../../jw-tel-input/components/int-phone-prefix.component';
import { Country } from '../../jw-tel-input/interfaces/country.interface';
import { LazyLoadEvent } from 'primeng/primeng';



@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {

  constructor(private customer_service: CustomerService,private confirmationService: ConfirmationService, public commonService: CommonService, private customMessage: CustomMessageService, private formBuilder: FormBuilder,
  ) { }


  cols;
  merchantEditMode = false;
  records_text;
  openPopup = false;
  total_records=0;
  merchat_customer_id;
  public addMerchantForm: FormGroup;
  companiesList = [];
  req_body={
    sSearch:'',
    limit:10,
    skip:0,
    sort_key:'',
    sort_order:-1
  };


  merchant_data;
  @ViewChild('dt') ptable: Table;
  @ViewChild("intlTelInput") phoneInputField: IntPhonePrefixComponent;

  @ViewChild("intlTelInput2") phoneInputField2: IntPhonePrefixComponent;


  ngOnInit() {

  this.cols = [
      {field:'merchat_customer_id',header:'ID'},
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'email' },
      { field: 'phone', header: 'Phone Number' },
      { field: 'customer_company_name', header: 'Company Name' },
      { field: 'company_phone', header: 'Company Phone' },
      { field: 'company_address', header: 'Address' },
      { field: 'company', header: 'Company' },
      {field:'actions',header:'Actions'}
  ];
    this.getMerchantList();
    this.getCompaniesList();
  }


  add_merchant_popup() {
    this.openPopup = true;
    this.merchantEditMode = false;
    this.init_merchant_form();
 }


  showActionMenu(event: Event) {
    const el: HTMLElement = event.target as HTMLElement;
    if (el.nextElementSibling.matches('.menu-list')) {
      el.nextElementSibling.setAttribute('display', 'block');
    }
  }

  onPopupCancelClick() {
    this.openPopup = false;

  }

  init_merchant_form() {
    this.addMerchantForm = this.formBuilder.group({
      'first_name': ['', [Validators.required,Validators.minLength(2),Validators.pattern('[A-Za-z]*$')]],
      'last_name': ['',[Validators.required,Validators.minLength(2),Validators.pattern('[A-Za-z]*$')]],
      'company_name': ['', [Validators.required]],
      'company_phone_number': ['', [Validators.required]],
      'phone_number': ['', [Validators.required]],
      'company_address': ['', [Validators.required]],
      'email': ['', [Validators.required, Validators.pattern(constants.emailPattern)]],
      'company': ['', [Validators.required]],
      'country_code': [''],
      'company_country_code': [''],
      'company_latitude':[''],
      'company_longitude':[''],
      'password':['',[Validators.required]]
});
  }


  private getCompaniesList() {
    this.customer_service.getAllCompanies().subscribe(response => {
      this.companiesList = response.data;
    }, error => {
      this.companiesList = [];
    })
  }

  getMerchantList()
  {
     this.commonService.showLoader = true;
      this.customer_service.getAllMerchants(this.req_body).subscribe(response => {
      this.commonService.showLoader = false;
      this.merchant_data=response.data.rows;
      this.total_records=response.data.count;
      this.records_text=`Showing ${this.req_body.skip + 1} - ${this.req_body.skip + this.merchant_data.length} of ${this.total_records} records`;

}, error => {
      this.merchant_data=[]
      this.commonService.showLoader = false;

    })
  }
  
  changeLimit(){
    this.getMerchantList();
  }
  save_merchant() {

    if (!this.addMerchantForm.valid) {
      return this.commonService.validateAllFormFields(this.addMerchantForm);
    }
    this.get_country_code();
    console.log('======>', this.addMerchantForm.value);
    this.commonService.showLoader = true;
    this.customer_service.addCustomer(this.addMerchantForm.value,this.merchantEditMode,this.merchat_customer_id).subscribe(
      response => {
        this.commonService.showLoader = false;
        this.openPopup = false;

this.getMerchantList();
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });



      },
      error => {

        this.commonService.showLoader = false;
        this.commonService.handleError(error);
      });

  }
  public onLatLngEvent(latlng: google.maps.LatLng) {
    this.addMerchantForm.controls.company_latitude.setValue(latlng.lat());
    this.addMerchantForm.controls.company_longitude.setValue(latlng.lng());




  }





  get_country_code() {

    let phoneValue: string = this.addMerchantForm.controls.phone_number.value.toString();
    if (!phoneValue.startsWith('+')) {
      let countryData: Country = this.phoneInputField.selectedCountry;
      this.addMerchantForm.controls.country_code.setValue(`+${countryData.dialCode.toString()}`);
    }


    let CompanyphoneValue: string = this.addMerchantForm.controls.company_phone_number.value.toString();
    if (!CompanyphoneValue.startsWith('+')) {
      let countryData: Country = this.phoneInputField2.selectedCountry;
      this.addMerchantForm.controls.company_country_code.setValue(`+${countryData.dialCode.toString()}`);




    }
  }


  loadOrdersLazy(event: LazyLoadEvent) {

  this.req_body.sSearch=event.globalFilter ? event.globalFilter:'';
  this.req_body.sort_key=event.sortField ?event.sortField:'' ;
  this.req_body.sort_order=event.sortOrder;
  this.req_body.skip=event.first;
  this.getMerchantList();



  }


  editMerchant(rowData) {
    this.merchat_customer_id=rowData.merchat_customer_id;
    this.merchantEditMode = true;
    this.openPopup = true;
    this.init_merchant_form();
    this.addMerchantForm.get('password').clearValidators();
    this.addMerchantForm.get('password').updateValueAndValidity();
    this.addMerchantForm.setValue(
      {
        'first_name': rowData.first_name,
        'last_name':rowData.last_name,
        'company_name':rowData.customer_company_name,
        'company_phone_number': rowData.company_phone,
        'phone_number': rowData.phone,
        'company_address': rowData.company_address,
        'email': rowData.email,
        'company':{user_id:rowData.company_id,company_name:rowData.company_name},
        'country_code': '',
        'company_country_code': '',
        'password':'',
        'company_latitude':rowData.company_latitude,
        'company_longitude':rowData.company_longitude

      }
    );
 



    setTimeout(() => {
    
       this.phoneInputField.setCountryCode(rowData.country_code == 1 ? 'us' :'in' );
       this.phoneInputField2.setCountryCode(rowData.company_country_code== 1 ? 'us' : 'in');


    })

  }


  deleteMerchant(id)
  {
    this.confirmationService.confirm({
      header: "Confirm Delete",
      message: "Are you sure you want to delete this Merchant" + '?',
      accept: () => {
        this.commonService.showLoader=true;
        this.customer_service.deleteCustomer(id)
          .subscribe(response => {
            this.commonService.showLoader=false;
            this.getMerchantList();

            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.showLoader=false;

            this.commonService.handleError(error);
          })
      }
    })
  }






}

