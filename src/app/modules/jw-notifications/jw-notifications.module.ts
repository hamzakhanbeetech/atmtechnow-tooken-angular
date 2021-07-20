import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './components/alert/alert.component';
import { JwCommonModule } from '../jw-common/jw-common.module';
import { ConfirmationService } from './services/confirmation.service';
import { ConfirmComponent } from './components/confirm/confirm.component';

@NgModule({
  imports: [
    CommonModule,
    JwCommonModule
  ],
  declarations: [
    AlertComponent,
    ConfirmComponent
  ],
  exports: [
    AlertComponent,
    ConfirmComponent
  ],
  providers: [ConfirmationService]
})
export class JwNotificationsModule { }
