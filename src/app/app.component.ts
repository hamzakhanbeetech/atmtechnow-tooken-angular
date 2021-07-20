import { Component, OnInit } from '@angular/core';
import { CommonService } from './services/common.service';
import { ConfirmationService } from './modules/jw-notifications/services/confirmation.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss', '../assets/css/growl-style.scss']
})
export class AppComponent implements OnInit {
  constructor(public commonService: CommonService, public confirmationService: ConfirmationService, private route: ActivatedRoute) {
    this.commonService.getIcons();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if(params.origin){
        this.commonService.parentOrigin = params.origin;
        console.log(params.origin);
      }
    })
  }
}
