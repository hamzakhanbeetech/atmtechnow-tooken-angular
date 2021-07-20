import { Component, OnInit } from '@angular/core';
import { MerchantService } from '../../services/merchant.service';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { IMerchantReport, IGeofenceData } from '../../interfaces/interface';
import { Subject } from 'rxjs/Subject';
@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss', '../add/add.component.scss']
})
export class PreviewComponent implements OnInit {

  public merchant_id: number;
  public merchantReport: IMerchantReport = <IMerchantReport>{};
  public geofenceData: Array<IGeofenceData> = [];
  public showGeofencePopup: boolean;
  public showAgentPopup: boolean;
  public agentDetails;
  public showDocuments: boolean;

  triggerGeoFenceEvents: Subject<string> = new Subject<string>();
  constructor(private merchantService: MerchantService , public commonService: CommonService , 
  private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    window['prev']=this;
    this.activatedRoute.params.subscribe(
      (params: Params) => {
        if (params.id) {
          this.merchant_id = params.id;
          this.getMerchantReport(+params.id);
        }
      });
  }

  getMerchantReport(merchant_id: number) {
    this.commonService.showLoader = true;
    this.merchantService.merchantReport(merchant_id).subscribe(
      response => {
        this.commonService.showLoader = false;
        this.merchantReport = response.data;
        if(this.merchantReport.document.length > 0) {
          this.showDocuments = true;
        }
        this.geofenceData = this.merchantReport.geofence;
        this.transformGeofenceData();
      },
      error => {
        this.merchantReport = {
          address: 'dummy',
          completed_task: 0,
          document : null,
          email: 'dummy@dummy.com',
          failed_task: 0,
          first_name: 'dummy',
          last_name: 'dummy',
          merchant_id: 0,
          merchant_rating: '0',
          total_agents: 0,
          geofence: []
        }
        this.commonService.showLoader = false;
        this.commonService.handleError(error);

      });
  }

  transformGeofenceData() {
    this.geofenceData.forEach((geoRegion) => {
      if ((geoRegion.region_data.length > 0)) {
        let regionData: any = geoRegion.region_data[0];
        geoRegion.region_data = regionData.map(item => `${item.x} ${item.y}`).join(',');
      }
      //CHANGE
      geoRegion = {
        region_name: geoRegion.region_name,
        region_description: geoRegion.region_description,
        region_id: geoRegion.region_id,
        region_data: geoRegion.region_data
      }
    });
  
  }

  viewAgents() {
    this.showAgentPopup = true;
  }

  viewGeofence() {
    this.showGeofencePopup=true;
  }

   /**
   * emit action to be performed to Review component
   */
  emitEventToReview() {
    this.triggerGeoFenceEvents.next('Save');
  }

  onPopupCancelClick() {
    this.showGeofencePopup = false;
  }

  onAgentPopupCancelClick() {
    this.showAgentPopup = false;
  }



  backToMerchantList() {
    this.commonService.emitDataToParentWindow('app.merchant');
    this.router.navigate(['merchant/list']);
  }
}
