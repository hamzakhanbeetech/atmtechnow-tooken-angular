import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { SidebarModule } from '../sidebar/sidebar.module';
import { HeaderService } from './services/header.service';
@NgModule({
  imports: [
    CommonModule,
    SidebarModule,

  ],
  declarations: [HeaderComponent],
  providers: [HeaderService],
  exports: [HeaderComponent]
})
export class HeaderModule { }
