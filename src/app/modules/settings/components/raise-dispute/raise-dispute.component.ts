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
import { map } from 'rxjs/operator/map';
@Component({
  selector: 'app-raise-dispute',
  templateUrl: './raise-dispute.component.html',
  styleUrls: ['./raise-dispute.component.scss', '../developers/developers.component.scss']
})
export class RaiseDisputeComponent implements OnInit {
  @ViewChild('dt') ptable: Table;
  public popupModalType = ModalType;
  disputes = [];
  showPopup: boolean = false;
  records_text;
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
    { field: 'job_id', header: 'SId' },
    { field: 'creation_datetime', header: 'Raised Date' },
    { field: 'Raised By', header: 'Raised Date' },
    { field: 'Address', header: 'Address' },
    { field: 'Actions', header: 'Actions' }
  ];
  disputeStatus = [
    { label: 'Pending', id: 0 },
    { label: 'Open', id: 1 },
    { label: 'Closed', id: 2 }
  ];
  currentDescription: any;
  constructor(private confirmationService: ConfirmationService, private settingsService: SettingsService,
    public commonService: CommonService, private customMessage: CustomMessageService, private formBuilder: FormBuilder,
    private gaService: GaService) { }

  ngOnInit() {
    this.getAllDisputes();
  }
  getAllDisputes() {
    this.commonService.showLoader = true;
    this.settingsService.getAllDisputes(this.req_body).subscribe(response => {
      this.commonService.showLoader = false;
      this.disputes = response.data.result
        .map((row) => {
          row.status = this.disputeStatus[row.status];
          return row;
        });
      this.total_records = response.data.total_records;
      this.records_text = `Showing ${this.req_body.skip + 1} - ${this.req_body.skip + this.disputes.length} of ${this.total_records} records`;
    }, error => {
      this.disputes = [];
      this.commonService.showLoader = false;
    })
  }
  changeLimit() {
    this.getAllDisputes();
  }

  onCancelClick() {
    this.showPopup = false;
  }
  viewDescription(description) {
    this.currentDescription = description;
    this.showPopup = true;
  }
  statusChanged(event, rowData) {
    this.commonService.showLoader = true;
    this.settingsService.changeDisputeStatus(rowData, event.id).subscribe(response => {
      this.commonService.showLoader = false;
      this.customMessage.showMessage({
        detail: response.message,
        severity: "success",
      });
      this.getAllDisputes();
    }, error => {
      this.commonService.showLoader = false;
    })
  }
  loadOrdersLazy(event) {
    this.req_body.search = event.globalFilter ? event.globalFilter : '';
    this.req_body.skip = event.first;
    this.getAllDisputes();
  }
}
