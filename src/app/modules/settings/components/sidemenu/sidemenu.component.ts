import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss']
})
export class SidemenuComponent implements OnInit {
  showVideoLinks: boolean;
  showSoftware: boolean;
  constructor(public commonService: CommonService) { }

  ngOnInit() {
    if(this.commonService.loginData.is_dispatcher==0)
    {
    this.showVideoLinks = this.commonService.loginData.merchant_permissions.add_video_links ? true : false;
    this.showSoftware = this.commonService.loginData.merchant_permissions.add_software ? true : false;
    console.log(this.commonService.loginData.merchant_permissions.add_custom_notifications,"hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
    }
  }

  emit(state_name: string) {
    this.commonService.emitDataToParentWindow(state_name);
  }

  onLogoutClick() {
    this.commonService.emitDataToParentWindow('page.login');
  }
}
