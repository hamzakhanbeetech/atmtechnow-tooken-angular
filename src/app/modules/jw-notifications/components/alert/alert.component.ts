import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { layer, scale } from '../../animations/common.animation';
@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  animations: [layer, scale]
})
export class AlertComponent implements OnInit {
  @Input() header: string;
  @Input() message: string;
  @Input() buttonText: string = "Ok";
  @Output() okClick: EventEmitter<Event> = new EventEmitter<Event>();

  constructor() { }

  ngOnInit() {
  }

  onOkClick(e) {
    this.okClick.emit(e);
  }

  onEnterPress(e) {
    this.onOkClick(e);
  }

}
