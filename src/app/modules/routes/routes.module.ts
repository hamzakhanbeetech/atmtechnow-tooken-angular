import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HeaderModule } from '../header/header.module';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { JwCommonModule } from '../jw-common/jw-common.module';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { RoutesComponent } from './routes.component';
import { RouteTableComponent } from './components/route-table/route-table.component';
import { RoutePopupComponent } from './components/route-popup/route-popup.component';
import { RoutesService } from './services/routes.service';
import { AssignAgentComponent } from './components/assign-agent/assign-agent.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// import { AgmCoreModule } from '@agm/core';
// import { environment } from '../../../environments/environment';
const routersRoutes: Routes = [
    {
        path: '',
        component: RoutesComponent,
        children: [
            {
                path: 'routesData',
                component: RouteTableComponent
            },
            {
                path: 'routesData/:id',
                component: RoutePopupComponent
            },
            {
                path:'',
                pathMatch:'full',
                redirectTo:'routesData'
            }
           
        ]
    }
]
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routersRoutes),
        HeaderModule,
        TableModule,
        PaginatorModule,
        ReactiveFormsModule,
        FormsModule,
        JwCommonModule,
        TooltipModule,
        DropdownModule,
        BsDatepickerModule.forRoot()
    ],
    declarations: [
        RoutesComponent,
        RouteTableComponent,
        RoutePopupComponent,
        AssignAgentComponent
    ],
    exports: [RoutesComponent],
    providers: [RoutesService]
})
export class RoutesModule { }