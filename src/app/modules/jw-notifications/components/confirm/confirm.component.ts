import { Component, OnInit } from '@angular/core';
import { layer, scale } from '../../animations/common.animation'
import { ConfirmationService } from '../../services/confirmation.service';
@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss', '../alert/alert.component.scss'],
  animations: [layer, scale]

})
export class ConfirmComponent implements OnInit {

  constructor(public confirmationService: ConfirmationService) { }

  ngOnInit() {
  }


  onYesClick(e) {
    this.confirmationService.onAccept();
  }

  onNoClick(e) {
    this.confirmationService.onReject();
  }

}
