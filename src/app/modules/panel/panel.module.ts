import { NgModule } from '@angular/core';
import {ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from '../../modules/panel/components/login/login.component';
import {PanelService} from '../panel/panel.service';
import { ForgotPasswordComponent } from '../../modules/panel/components/forgot-password/forgot-password.component';
import { RegisterComponent } from '../../modules/panel/components/register/register.component';
import { HttpClientModule } from '@angular/common/http';
import { ResetPasswordComponent } from '../../modules/panel/components/reset-password/reset-password.component';
import { JwTelInputModule } from '../jw-tel-input/jw-tel-input.module';
import { JwCommonModule } from '../jw-common/jw-common.module';
export const panelModuleRoutes: Routes = [
  /* configure routes here */
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'forgotPassword',
    component: ForgotPasswordComponent
  },
  {
    path:'resetPassword',
    component: ResetPasswordComponent
  }

];
@NgModule({
    imports: [
      CommonModule,
      ReactiveFormsModule,
      FormsModule,
      HttpClientModule,
      RouterModule.forChild(panelModuleRoutes),
      JwTelInputModule,
      JwCommonModule
    ],
    declarations: [
      LoginComponent,
      ForgotPasswordComponent,
      RegisterComponent,
      ResetPasswordComponent
    ],
    providers: [PanelService]
  })
  export class PanelModule { }