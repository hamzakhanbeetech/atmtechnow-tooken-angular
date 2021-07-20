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
  selector: 'app-spare-part',
  templateUrl: './spare-part.component.html',
  styleUrls: ['./spare-part.component.scss', '../developers/developers.component.scss']
})
export class SparePartComponent implements OnInit {

  @ViewChild('dt') ptable: Table;
  @ViewChild('fileInput') fileInput: ElementRef;
  file;
  sparePartData;
  public infotext: string;
  rows = 10;
  popup_title;
  addPartModal: boolean = false;
  add_or_edit;
  is_add;
  spare_part_id;
  public addSparePart: FormGroup;

  public columns = [
    { field: 'spare_part_unique_id', header: 'Technician ID' },
    { field: 'spare_part_name', header: 'Technician Name' },
    { field: 'spare_part_description', header: 'Company Name' },


  ];



  constructor(private confirmationService: ConfirmationService, private settingsService: SettingsService,
    public commonService: CommonService, private customMessage: CustomMessageService, private formBuilder: FormBuilder,
    private gaService: GaService) { }


  ngOnInit() {
    this.getSparePartData();
    this.initializeForm();


  }

  initAddPart() {
    this.initializeForm();
    this.popup_title = 'Add Spare Part';
    this.addPartModal = true;
    this.add_or_edit = 'Add';
    this.is_add = true;
  }

  initEditSparePart(data) {
    console.log('data', data);
    this.spare_part_id = data.spare_part_id
    this.addSparePart.setValue({
      'spare_part_unique_id': data.spare_part_unique_id,
      'spare_part_name': data.spare_part_name,
      'spare_part_description': data.spare_part_description,
      'spare_part_price': data.spare_part_price


    });
    this.popup_title = 'Edit Spare Part';
    this.add_or_edit = 'Update';
    this.addPartModal = true;
    this.is_add = false;
  }

  public onSelectingFile(fileInput) {
    fileInput.click();
  }


  deleteSparePart(data) {
    this.confirmationService.confirm({
      header: "Confirm Delete",
      message: "Are you sure you want to delete this Spare Part ?",
      accept: () => {
        this.commonService.showLoader = true;
        this.settingsService.deletePart(data).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.getSparePartData();
          },
          error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error);
          });
      }
    });
  }


  onUploadSparePartCSV(event) {
    this.file = event.target.files[0];
    if (this.file) {
      var reader = new FileReader();
      reader.onload = (e: any) => {
      }
      reader.readAsDataURL(this.file);
    }
    this.updateCSV(this.file);
  }

  updateCSV(file) {
    let data = new FormData();
    data.append("access_token", this.commonService.loginData.access_token);
    data.append('spare_part_csv', file ? file : this.file);
    this.settingsService.importSpareParts(data).subscribe(
      response => {
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
        this.getSparePartData();
      }, error => {
        this.commonService.handleError(error)
      });
  }

  onPageChange(event, allowedRows: number, array: Array<any>) {
    this.infotext = this.commonService.onPageChange(event, allowedRows, this.ptable.filteredValue || array);
  }
  onFilterChange(event) {
    this.onPageChange({ rows: +this.rows, first: 0 }, this.rows, event.filteredValue);
  }

  getSparePartData() {
    this.commonService.showLoader = true;
    this.settingsService.getSparePartDetails().subscribe(
      response => {
        this.commonService.showLoader = false;
        this.sparePartData = response.data.sparePartDetails;
        this.onPageChange({ rows: +this.rows, first: 0 }, this.rows, this.sparePartData);

      },
      error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error);
      });
  }

  addNewPart() {
    if (!this.addSparePart.valid) {
      return this.commonService.validateAllFormFields(this.addSparePart);
    }
    this.commonService.showLoader = true;

    this.settingsService.addNewPart(this.addSparePart.value).subscribe(
      response => {
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });

        this.addPartModal = false;
        this.getSparePartData();
      },
      error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error);
      });
  }




  editPart() {
    if (!this.addSparePart.valid) {
      return this.commonService.validateAllFormFields(this.addSparePart);
    }
    this.commonService.showLoader = true;

    this.settingsService.editPart(this.addSparePart.value, this.spare_part_id).subscribe(
      response => {
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
        this.addPartModal = false;
        this.getSparePartData();
      },
      error => {
        this.commonService.showLoader = false;
        this.commonService.handleError(error);
      });
  }



  onCancelClick() {
    this.addPartModal = false;
  }

  initializeForm() {
    this.addSparePart = this.formBuilder.group({
      'spare_part_unique_id': ['', Validators.required],
      'spare_part_name': ['', Validators.required],
      'spare_part_description': ['', Validators.required],
      'spare_part_price': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal)]],

 });
  }


  exportSpareParts() {
    this.settingsService.exportSpareParts().subscribe(
      response => {
        this.exportSparePartsFile(response);
      }, error => {
        this.commonService.handleError(error)
      });
  }
  exportSparePartsFile(res) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(res));
    element.setAttribute('download', 'spareParts.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }



}
