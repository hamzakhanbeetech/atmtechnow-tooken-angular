import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, TemplateRef, ElementRef } from '@angular/core';
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
  selector: 'app-taxes',
  templateUrl: './taxes.component.html',
  styleUrls: ['./taxes.component.scss', '../developers/developers.component.scss']
})
export class TaxesComponent implements OnInit {
  @ViewChild('dt') ptable: Table;
  public popupModalType = ModalType;
  @ViewChild('fileInput') fileInput: ElementRef;
  file;
  taxesList = [];
  showPopup: boolean = false;
  records_text;
  taxForm: FormGroup;
  req_body={
    search:'',
    limit:20,
    skip:0,
   };
   id;
   total_records;
  popupHeader: string;
  isEditMode = false;
  public columns = [
    { field: 'state_name', header: 'State' },
    { field: 'abbr', header: 'Abbreviation' },
    { field: 'tax', header: 'Tax' },
    {field:'Actions',header:'Actions'}

  ];

  constructor(private confirmationService: ConfirmationService, private settingsService: SettingsService,
    public commonService: CommonService, private customMessage: CustomMessageService, private formBuilder: FormBuilder,
    private gaService: GaService) { }

  ngOnInit() {
    this.getStateWiseTaxes();
  }
  getStateWiseTaxes() {
    this.commonService.showLoader = true;

    this.settingsService.getAllTaxes(this.req_body).subscribe(response => {
      this.commonService.showLoader = false;
      this.taxesList=response.data.tax;
       this.total_records=response.data.count;
       this.records_text=`Showing ${this.req_body.skip + 1} - ${this.req_body.skip + this.taxesList.length} of ${this.total_records} records`;

      }, error => {
      this.taxesList=[];
      this.commonService.showLoader = false;
})
  }
  initializeForm() {
    this.taxForm = this.formBuilder.group({
      'state_name': ['',[Validators.required,Validators.pattern(/^[^\s].+[^\s]$/)]],
      'abbr': ['',[Validators.required,Validators.pattern(/^[^\s].*[^\s]$/)]],
      'tax': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal)]],
    });
  }
  changeLimit(){
    this.getStateWiseTaxes();
  }
  deleteTax(id){
    this.confirmationService.confirm({
      header: "Confirm Delete",
      message: "Are you sure you want to delete this tax ?",
      accept: () => {
        this.settingsService.delete(id).subscribe(
          res=>{
            this.commonService.showLoader = false;
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: res.message });
            this.getStateWiseTaxes();
            
     },
          err=>{
            this.commonService.showLoader = false;
            this.commonService.handleError(err);
    
    
          }
        )
}
    });
   

  }
  initAddTax() {
    this.showPopup = true;
    this.popupHeader = "Add Tax";
    this.isEditMode = false;
    this.initializeForm();

  }
  editTax(data) {
    this.initializeForm();
    this.taxForm.setValue({
      'state_name': data.state_name,
      'abbr': data.abbreviation,
      'tax': data.tax
    })
    this.isEditMode = true;
    this.popupHeader = 'Edit Tax';
    this.showPopup = true;
    this.id=data.id;
}
  onCancelClick() {
    this.showPopup = false;
  }
  onUploadTaxCSV(event) {
    this.file = event.target.files[0];
    if (this.file) {
      var reader = new FileReader();
      reader.onload = (e: any) => {
      }
      reader.readAsDataURL(this.file);
    }
    this.importCSV(this.file);
}
importCSV(file){
  let data = new FormData();
  data.append("access_token", this.commonService.loginData.access_token);
  data.append('us_taxes_csv', file ? file :this.file);
  this.settingsService.importTaxes(data).subscribe(
    response => {
      this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
      this.getStateWiseTaxes();
    }, error => {
      this.commonService.handleError(error)
    });
}
public onSelectingFile(fileInput) {
  fileInput.click();
}
getSample(){
  this.settingsService.exportTaxes().subscribe(
    response => {
    this.exportTaxFile(response);
    }, error => {
      this.commonService.handleError(error)
    });
}
exportTaxFile(res) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(res));
  element.setAttribute('download', 'taxes.csv');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

  

  addTax(){
    if (!this.taxForm.valid) {
      return this.commonService.validateAllFormFields(this.taxForm);
    }
    this.commonService.showLoader = true;
    this.settingsService.addTax(this.taxForm.value,this.isEditMode,this.id).subscribe(
      res=>{
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: res.message });
        this.getStateWiseTaxes();
        this.showPopup=false;
 },
      err=>{
        this.commonService.showLoader = false;
        this.commonService.handleError(err);


      }
    )
  }
  loadOrdersLazy(event){

  this.req_body.search=event.globalFilter ? event.globalFilter:'';
  this.req_body.skip=event.first;
  this.getStateWiseTaxes();
  }

}
