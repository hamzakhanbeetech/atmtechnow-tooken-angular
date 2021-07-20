import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderModule } from '../header/header.module';
import { JwCommonModule } from '../jw-common/jw-common.module';
import { JwTelInputModule } from '../jw-tel-input/jw-tel-input.module';
import { JwGoogleAutocompleteModule } from '../jw-google-autocomplete/jw-google-autocomplete.module';

import { CustomerComponent } from './customer/customer.component';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerService } from './customer.service';
const merchantRoutes: Routes = [
  {
      path: '',
      component: CustomerComponent,
      children: [
        {
            path: 'list',
            component: CustomerListComponent
        },
        {
          path:'',
          pathMatch:'full',
          redirectTo:'list'
      }
     
     
       
    ]
   
          
         
      
  }
]

@NgModule({
  imports: [
    CommonModule,
    TableModule,
    HeaderModule,
    PaginatorModule,
    ReactiveFormsModule,
    JwCommonModule,
    JwTelInputModule,
    FormsModule,
    JwGoogleAutocompleteModule,
    RouterModule.forChild(merchantRoutes),

  ],
  declarations: [CustomerComponent, CustomerListComponent],
  providers: [CustomerService]

})
export class CustomerModule { }
