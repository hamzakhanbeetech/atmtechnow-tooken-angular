import { Component, OnInit, Input, ViewChild, ViewContainerRef, TemplateRef } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { HeaderService } from './services/header.service';
import { IAddons, ISidebarApp } from './services/interfaces/header.interface';
import { IAddTemplate } from '../../interfaces/interface';
import {Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  showSidebar: boolean;
  showLogoutButton: boolean;
  private sideMenuApp: IAddons;
  private topBarApp: IAddons;
  private smsGatewayApp: IAddons;

  sidebarApps: Array<ISidebarApp> = [];
  topbarApps: Array<ISidebarApp> = [];
  @ViewChild('dynRightLi', { read: ViewContainerRef }) dynRightLi: ViewContainerRef;
  @ViewChild('dynLeftLi', { read: ViewContainerRef }) dynLeftLi: ViewContainerRef;
  constructor(public commonService: CommonService, private router: Router,private headerService: HeaderService) {
    this.handleLogoutBtnVisibilityEvent();
  }

  ngOnInit() {
    this.getApps();
    window['head'] = this;
    
    this.commonService.onTemplateAddEvent
      .subscribe((data:IAddTemplate) => { 
        if (data && data.template) {
          let view = data.template.createEmbeddedView(null);
          if(data.direction=="left"){
            this.dynLeftLi.clear();
            this.dynLeftLi.insert(view);
          }else{
            this.dynRightLi.clear();
            this.dynRightLi.insert(view);
          }
        }else{
          this.dynLeftLi.clear();
          this.dynRightLi.clear();
        }
      });


  }
  // subscribeToNavigationEndEvent(){
  //   this.router.events.subscribe(data => {
  //     if (data instanceof NavigationEnd) {
      

  //     }
  //   })
  // }

  getApps() {
    this.headerService.getApps()
      .subscribe(response => {
        this.sideMenuApp = null; this.topBarApp = null; this.smsGatewayApp = null;
        (response.data as IAddons[]).forEach(app => {
          if (app.app_abilities && app.app_abilities['side-menu'])
            this.sideMenuApp = app;
          if (app.app_abilities && app.app_abilities['topbar-menu'])
            this.topBarApp = app;
          if (app.app_abilities && app.app_abilities['sms-gateway']) {
            this.smsGatewayApp = app;
          }
        });
        this.getJsonFilesForSideMenu();
        this.getJsonFilesForTopBar();
      //  this.subscribeToNavigationEndEvent();
      }, error => {
        this.commonService.handleError(error);
      })
  }

  getJsonFilesForSideMenu() {
    if (this.sideMenuApp && this.sideMenuApp.app_url) {
      const url = this.sideMenuApp.app_url.substring(0, this.sideMenuApp.app_url.lastIndexOf('/')) + '/side-menu.json';
      try {
        this.headerService.fetchJSON(url)
          .subscribe(response => {
            this.sidebarApps = <ISidebarApp[]>response;
          }, error => {
            this.commonService.handleError(error.error);
          });
      } catch (error) {
        console.log(error);
      }
    }
  }
  getJsonFilesForTopBar() {
    if (this.topBarApp && this.topBarApp.app_url) {
      const url = this.topBarApp.app_url.substring(0, this.topBarApp.app_url.lastIndexOf('/')) + '/topbar-menu.json';
      try {
        this.headerService.fetchJSON(url)
          .subscribe(response => {
            this.topbarApps = <ISidebarApp[]>response;
          }, error => {
            this.commonService.handleError(error.error);
          });
      } catch (error) {
        console.log(error);
      }
    }
  }

  redirectToDashboard() {
    if (this.commonService.loginData.default_view) {
      (<any>window).parent.location = `${this.commonService.parentOrigin}/#/app/tasks`;
    } else {
      (<any>window).parent.location = `${this.commonService.parentOrigin}/#/app/dashboard`;
    }

  }

  onLogoutClick() {
    this.commonService.emitDataToParentWindow('page.login');
  }

  /**
   * logout btn show / hide event
   */
  handleLogoutBtnVisibilityEvent() {
    this.commonService.onLogoutBtnVisibilityChange.subscribe(
      (val: boolean) => {
        this.showLogoutButton = val;
      });
  }
  /**
   * open page onclick on top bar app
   */
  onTopbarAppClick(val:ISidebarApp){
    this.commonService.emitDataToParentWindow('', { val }, 'click_on_top_bar_app');
  }
}
