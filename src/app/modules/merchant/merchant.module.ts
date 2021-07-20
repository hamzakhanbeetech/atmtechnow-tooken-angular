import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MerchantComponent } from './merchant.component';
import { HeaderModule } from '../header/header.module';
import { MerchantService } from './services/merchant.service';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { JwCommonModule } from '../jw-common/jw-common.module';
import { JwTelInputModule } from '../jw-tel-input/jw-tel-input.module';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { MerchantListComponent } from './components/list/list.component';
import { MerchantAddComponent } from './components/add/add.component';
import { GeofenceComponent } from './components/geofence/geofence.component';
import {CalendarModule} from 'primeng/calendar';
import { PreviewComponent } from './components/preview/preview.component';
import {RatingModule} from 'primeng/rating';
import { AgentListComponent } from './components/agent-list/agent-list.component';
import { JwGoogleAutocompleteModule } from '../jw-google-autocomplete/jw-google-autocomplete.module';
import {KeyFilterModule} from 'primeng/keyfilter';
// import { AgmCoreModule } from '@agm/core';
// import { environment } from '../../../environments/environment';
const merchantRoutes: Routes = [
    {
        path: '',
        component: MerchantComponent,
        children: [
            {
                path: 'list',
                component: MerchantListComponent
            },
            {
                path: 'edit/:id',
                component: MerchantAddComponent
            },
            {
                path: 'add',
                component: MerchantAddComponent
            },
            {
                path: 'preview/:id',
                component: PreviewComponent
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
        RouterModule.forChild(merchantRoutes),
        HeaderModule,
        TableModule,
        PaginatorModule,
        ReactiveFormsModule,
        FormsModule,
        JwCommonModule,
        JwTelInputModule,
        TooltipModule,
        KeyFilterModule,
        DropdownModule,
        CalendarModule,
        RatingModule,
        JwGoogleAutocompleteModule
        // AgmCoreModule.forRoot({
        //     channel:'tookan_dashboard',
        //     clientId: environment.google_maps_key,
        //     libraries: ["places","drawing" ,"geometry"]
        //   })
    ],
    declarations: [
        MerchantComponent,
        MerchantListComponent,
        MerchantAddComponent,
        GeofenceComponent,
        PreviewComponent,
        AgentListComponent
    ],
    exports: [MerchantComponent],
    providers: [MerchantService]
})
export class MerchantModule { }