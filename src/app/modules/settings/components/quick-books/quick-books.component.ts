import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../services/common.service';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-quick-books',
  templateUrl: './quick-books.component.html',
  styleUrls: ['./quick-books.component.scss','../developers/developers.component.scss']
})
export class QuickBooksComponent implements OnInit {

  constructor(public commonService: CommonService,private customMessage: CustomMessageService) { }

  ngOnInit() {
  }
  open_quickBooks()
  {
 
    window.open(environment.quick_books_url, "_blank");
   

  }

}
