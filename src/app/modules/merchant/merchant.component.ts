import { Component, OnInit, ViewEncapsulation } from '@angular/core';
@Component({
  selector: 'app-merchant',
  templateUrl: './merchant.component.html',
  styleUrls: ['./merchant.component.scss',
  "../../../../node_modules/primeng/resources/components/common/common.css",
  "../../../../node_modules/primeng/resources/components/table/table.css",
  "../../../../node_modules/primeng/resources/components/paginator/paginator.css",
  "../../../../node_modules/font-awesome/scss/font-awesome.scss",
  '../../../assets/css/tooltip.scss',
  "../../../../node_modules/primeng/resources/components/calendar/calendar.css",
  // "../../../../node_modules/primeng/resources/components/rating/rating.css",
 "../../../../node_modules/primeng/resources/components/dropdown/dropdown.css",
 "../../../../node_modules/primeng/resources/components/tooltip/tooltip.css",
  '../../../assets/css/table.scss'
],
encapsulation: ViewEncapsulation.None
})
export class MerchantComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
