import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderModule } from '../header/header.module';
import { PaginatorModule } from 'primeng/paginator';

import { JobsitesRoutingModule } from './jobsites-routing.module';
import { JobsiteComponent } from './jobsite.component';
import { SitesListComponent } from './sites-list/sites-list.component';
import { Routes } from '@angular/router';
import { TableModule } from 'primeng/table';
import { JobsitesService } from './jobsites.service';
import { JwCommonModule } from '../jw-common/jw-common.module';





@NgModule({
  imports: [
    CommonModule,
    HeaderModule,
    PaginatorModule,
    JobsitesRoutingModule,
    TableModule,
    JwCommonModule
  ],
  declarations: [JobsiteComponent, SitesListComponent],
  providers:[JobsitesService]
})
export class JobsitesModule { }
