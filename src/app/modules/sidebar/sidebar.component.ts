import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { ISidebarApp } from '../header/services/interfaces/header.interface';
import { GaService } from '../../services/ga.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss' , 
  "../../../../node_modules/font-awesome/scss/font-awesome.scss"]
})
export class SidebarComponent implements OnInit {
  @Input('customApps') sidebarApps: Array<ISidebarApp> = [];
  @Input() visible: boolean;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  private marketplaceWindowRef: any;
  private hippoWindowRef: any;
  constructor(public commonService: CommonService,private gaService: GaService) { }

  ngOnInit() {
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  onDeveloperAppsClick(app: ISidebarApp) {
    if (app.functionalize.internal_functionality) {
      //
      if (app.functionalize.target == '_self')
        (<any>window).parent.location = this.commonService.parentOrigin + "/" + (app.functionalize.url);
      else
        (<Window>window).open(app.functionalize.url, '_blank');
    }
    else {
      var url = app.functionalize.url;
      var append_url_value = 'access_token=' + this.commonService.loginData.access_token + '&user_id=' + this.commonService.loginData.user_id;
      if (url.indexOf('?') > 0) {
        url = url + '&' + append_url_value;
      }
      else {
        url = url + '?' + append_url_value;
      }
      if (app.functionalize.target == '_self') {
        this.commonService.emitDataToParentWindow('app.marketplace', { "iframe_url": url })
      }
      else {
        (<Window>window).open(url, '_blank');
      }
    }
  }

  goToMarketpalce() {
    if (this.commonService.loginData.reseller && Object.keys(this.commonService.loginData.reseller).length) {
      (<any>window).parent.location = this.commonService.parentOrigin + "/" + '#/app/settings/addons';
    } else {
      if (this.marketplaceWindowRef) {
        this.marketplaceWindowRef.close();
        this.marketplaceWindowRef = window.open('https://marketplace.tookanapp.com', '_blank');
      } else {
        this.marketplaceWindowRef = window.open('https://marketplace.tookanapp.com', '_blank');
      }
    }
  }
  goToHippoDashboard(){
    this.hippoWindowRef = window.open('https://techtalk.techataclick.com/#/dashboard?access_token='+this.commonService.loginData.access_token, '_blank');
  }
  goToTookanGuide(){
    this.gaService.emitEvent('v3_app_tookanapp_sidebar', 'click_on_tookan_guide', 'click_on_tookan_guide');
    this.hippoWindowRef = window.open('https://jungleworks.com/tookan/tookan-guide/support/?id=post-6157', '_blank');
  }

  openHippoWidget() {
    this.gaService.emitEvent('v3_app_tookanapp_sidebar', 'click_on_support', 'click_on_support');
    let hostName = this.commonService.parentOrigin.replace(/https:\/\//,'');
    let hostContent = hostName.split('.');
    (<any>window).fuguInit({
      "appSecretKey": "07de4b582efae50d964f4d8e6e548fed",
      uniqueId: (this.commonService.loginData.user_id + '_' + (hostContent[0] || 'app')),
      name: name,
      email: this.commonService.loginData.email,
      phone: this.commonService.loginData.phone,
      showData: true,
      tags: ['Tookan Dashboard'],
      "collapseType": "hide"
    });
  }

  redirectToDashboard(){
    (<any>window).parent.location=`${this.commonService.parentOrigin}/#/app/dashboard`;
  }
}
