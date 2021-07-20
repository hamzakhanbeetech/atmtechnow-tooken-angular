import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonService } from '../../../services/common.service';
import { JobsitesService } from '../jobsites.service';
import { LazyLoadEvent } from 'primeng/primeng';
import { ModalType } from '../../../../constants/constants';




@Component({
  selector: 'app-sites-list',
  templateUrl: './sites-list.component.html',
  styleUrls: ['./sites-list.component.scss']
})
export class SitesListComponent implements OnInit {
  @ViewChild('dt') ptable: Table;
  public popupModalType = ModalType;
  showPopup:boolean=false;
  sitesList=[];
  records_text;

  req_body={
    search:'',
    limit:20,
    skip:0,
   };
  cols=[
    {field:'customer_id',header:'Customer ID'},
    {field:'customer_username',header:'Customer Name'},
    {field:'email',header:'Email'},
    {field:'customer_phone',header:'Phone Number'},
    {field:'job_sites',header:'Job Site'},
]
  allSites=[];
  total_records;


  constructor(private jobService:JobsitesService,private commonService:CommonService) { }

  ngOnInit() {
    this.fetchJobSites();
  }
  fetchJobSites(){
    this.commonService.showLoader = true;

    this.jobService.getAllSites(this.req_body).subscribe(response => {
      this.commonService.showLoader = false;
      this.allSites=response.data.rows;
       this.total_records=response.data.count;
       this.records_text=`Showing ${this.req_body.skip + 1} - ${this.req_body.skip + this.allSites.length} of ${this.total_records} records`;
      }, error => {
      this.allSites=[];
      this.commonService.showLoader = false;
})

}

ViewJobSites(data){
  this.sitesList=data;
  this.showPopup=true;
}
onPopupCancelClick(){
  this.showPopup=false;
}
loadOrdersLazy(event: LazyLoadEvent) {

  this.req_body.search=event.globalFilter ? event.globalFilter:'';
  this.req_body.skip=event.first;
  this.fetchJobSites();
}
changeLimit(){
  this.fetchJobSites();
}

}
