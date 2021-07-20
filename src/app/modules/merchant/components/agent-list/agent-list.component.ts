import { Component, OnInit, Input } from '@angular/core';
import { IAgentData } from '../../interfaces/interface';
import { MerchantService } from '../../services/merchant.service';
import { LazyLoadEvent } from 'primeng/api';
@Component({
  selector: 'app-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.scss']
})
export class AgentListComponent implements OnInit {
  @Input('merchantID') merchantID: number;

  public totalRecords;
  public agentList: Array<IAgentData> = [];
  public rows = 10;
  public infotext;
  public columns = [
    { field: 'fleet_id', header: 'ID' },
    { field: 'fleet_thumb_image', header: 'IMAGE' },
    { field: 'username', header: 'FULLNAME ' },
    { field: 'phone', header: 'PHONE' },
    { field: 'email', header: 'EMAIL' }
  ];
  constructor(private merchantService: MerchantService) { }

  ngOnInit() {
   this.getMerchantAgentData(this.merchantID);
  }



  getMerchantAgentData(merchantId: number) {
    this.merchantService.viewFleetDetails(merchantId).subscribe(
      (response) => {
        this.agentList = response.data;
      },
      error => {
        console.log(error);
      });
  }
}
