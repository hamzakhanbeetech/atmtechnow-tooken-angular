import { NgModule } from '@angular/core';
import { KeyboardEvent } from './directives/keyboard-event.directive';
import { Autofocus } from './directives/autofocus.directive';
import { PopupComponent } from './components/popup/popup.component'
import { CommonModule } from '@angular/common';
import { ControlMessages } from './components/control-messages/control-messages';
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    KeyboardEvent,
    Autofocus,
    PopupComponent,
    ControlMessages,
  ],
  exports: [
    KeyboardEvent,
    Autofocus,
    PopupComponent,
    ControlMessages,
  ]
})
export class JwCommonModule { }
