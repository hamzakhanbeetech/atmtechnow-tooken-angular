import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss', '../../../assets/css/tooltip.scss',
    "../../../../node_modules/primeng/resources/components/fieldset/fieldset.css",
    "../../../../node_modules/primeng/resources/components/common/common.css",
    "../../../../node_modules/primeng/resources/components/table/table.css",
    "../../../../node_modules/primeng/resources/components/chips/chips.css",
    "../../../../node_modules/primeng/resources/components/accordion/accordion.css",
    "../../../../node_modules/primeng/resources/components/paginator/paginator.css",
    "../../../../node_modules/primeng/resources/components/dropdown/dropdown.css",
    "../../../../node_modules/font-awesome/scss/font-awesome.scss",
    "../../../../node_modules/primeng/resources/components/multiselect/multiselect.css",
    "../../../../node_modules/primeng/resources/components/checkbox/checkbox.css",
    "../../../../node_modules/primeng/resources/components/dropdown/dropdown.css",
    "../../../../node_modules/primeng/resources/components/calendar/calendar.css",
    "../../../../node_modules/primeng/resources/components/common/common.css",
    "../../../../node_modules/ngx-bootstrap/datepicker/bs-datepicker.css" ,
    '../../../assets/css/table.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit, OnDestroy {
  isSidebarVisible: boolean;
  constructor(private commonService: CommonService, private router: Router) { }

  ngOnInit() {
    this.commonService.showLogoutBtn();
    this.router.events.subscribe(data => {
      if (data instanceof NavigationEnd) {
        (<any>window).scrollTo(0, 0);
      }
    })
  }


  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible
    !this.isSidebarVisible ? this.commonService.showBodyScroll() : this.commonService.hideBodyScroll()
  }
  onLogoutClick() {
    this.commonService.emitDataToParentWindow('page.login');
  }

  ngOnDestroy() {
    this.commonService.hideLogoutBtn();
  }
}
