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
  selector: 'app-tasks-enterprise',
  templateUrl: './tasks-enterprise.component.html',
  styleUrls: ['./tasks-enterprise.component.scss', '../developers/developers.component.scss']
})
export class TasksEnterpriseComponent implements OnInit {

  @ViewChild('dt') ptable: Table;
  public popupModalType = ModalType;
  enterpriseList = [];
  showPopup: boolean = false;
  records_text;
  form: FormGroup;
  req_body = {
    search: '',
    limit: 20,
    skip: 0,
  };
  id;
  total_records;
  popupHeader: string;
  isEditMode = false;
  public columns = [
    { field: 'company_id', header: 'Company ID' },
    { field: 'company_name', header: 'Company Name' },
    { field: 'free_task_count', header: 'Free Tasks' },
    { field: 'total_tasks_count', header: 'Current Month Tasks' },
    { field: 'Actions', header: 'Actions' }

  ];

  constructor(private confirmationService: ConfirmationService, private settingsService: SettingsService,
    public commonService: CommonService, private customMessage: CustomMessageService, private formBuilder: FormBuilder,
    private gaService: GaService) { }

  ngOnInit() {
    this.getEnterpriseList();
  }
  getEnterpriseList() {
    this.commonService.showLoader = true;
    this.settingsService.getEnterpriseListing(this.req_body).subscribe(response => {
      this.commonService.showLoader = false;
      this.enterpriseList = response.data.rows;
      this.total_records = response.data.count;
      this.records_text = `Showing ${this.req_body.skip + 1} - ${this.req_body.skip + this.enterpriseList.length} of ${this.total_records} records`;

    }, error => {
      this.enterpriseList = [];
      this.commonService.showLoader = false;
    })
  }
  initializeForm() {
    this.form = this.formBuilder.group({
      'free_task_count': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
    });
  }
  changeLimit() {
    this.getEnterpriseList();
  }
  updateEnterpriseStatus(data) {
    this.initializeForm();
    this.form.setValue({
      'free_task_count': data.free_tasks_count
    })
    this.isEditMode = true;
    this.popupHeader = 'Update tasks count ';
    this.showPopup = true;
    this.id = data.company_id;
  }
  onCancelClick() {
    this.showPopup = false;
  }

  updateEnterprise() {
    if (!this.form.valid) {
      return this.commonService.validateAllFormFields(this.form);
    }
    this.commonService.showLoader = true;
    const payload={company_id: this.id, free_tasks_count: this.form.get('free_task_count').value}
    this.settingsService.updateEnterpriseTasks(payload).subscribe(
      res => {
        this.commonService.showLoader = false;
        this.customMessage.showMessage({ severity: "success", summary: "success", detail: res.message });
        this.getEnterpriseList();
        this.showPopup = false;
      },
      err => {
        this.commonService.showLoader = false;
        this.commonService.handleError(err);


      }
    )
  }
  loadOrdersLazy(event) {
    this.req_body.search = event.globalFilter ? event.globalFilter : '';
    this.req_body.skip = event.first;
    this.getEnterpriseList();
  }

}
