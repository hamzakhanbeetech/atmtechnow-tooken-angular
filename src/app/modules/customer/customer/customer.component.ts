import { Component, OnInit,ViewChild,ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss',
  "../../../../../node_modules/primeng/resources/components/common/common.css",
   "../../../../../node_modules/primeng/resources/components/table/table.css",
   "../../../../../node_modules/primeng/resources/components/paginator/paginator.css",
   "../../../../../node_modules/primeng/resources/components/dropdown/dropdown.css",
  "../../../../../node_modules/font-awesome/scss/font-awesome.scss",
  '../../../../assets/css/table.scss' ,
   "../../../../../node_modules/ngx-bootstrap/datepicker/bs-datepicker.css", 
  '../../../../assets/css/dropdown.scss'
],
encapsulation: ViewEncapsulation.None

})
export class CustomerComponent implements OnInit {


  constructor() { }

  ngOnInit() {

  }

}
