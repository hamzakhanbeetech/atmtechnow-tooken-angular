import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonService } from '../../../../services/common.service';
import { SettingsService } from '../../services/settings.service';
import { ActivatedRoute, Params } from '@angular/router';
import { IVideoData } from '../../interfaces/interfaces';
@Component({
  selector: 'app-callurl',
  templateUrl: './callurl.component.html',
  styleUrls: ['./callurl.component.scss' , '../developers/developers.component.scss']
})
export class CallurlComponent implements OnInit {
  @ViewChild('dt') ptable: Table;
  public totalRecords: number = 0;
  public rows: number = 25;
  public infotext: string;
  public columns = [
    { field: 'call_log_id', header: 'Call Log ID' },
    { field: 'video_url', header: 'Video Url' }
  ];

  public agentRecordUrl: Array<IVideoData> = [];
  private jobId;
  constructor(public commonService: CommonService , private settingService: SettingsService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    window['url'] = this;
    this.activatedRoute.params.subscribe(
      (params: Params) => {
        this.jobId = +params['job_id'];
      }
    )
    this.getAllUrlForAgent();
  }

  getAllUrlForAgent() {
    this.settingService.fetchUrlForJobId(this.jobId).subscribe(
      response => {
        this.agentRecordUrl = response.data;
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
  this.infotext = this.commonService.onPageChange(event, allowedRows, this.ptable.filteredValue || array);
}
}
