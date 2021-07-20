import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AgmCoreModule } from '@agm/core';
import { MapComponent } from './components/map/map.component';
import { environment } from '../../../environments/environment';

export const dashboardModuleRoutes: Routes = [
  /* configure routes here */

  {
    path: '',
    component: DashboardComponent,
    children: [
    ]
  },

];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(dashboardModuleRoutes),
    AgmCoreModule.forRoot({
      apiKey: environment.google_maps_key,
      libraries: ["places", "drawing", "geometry"]
    })
  ],
  declarations: [DashboardComponent, MapComponent]
})
export class DashboardModule { }
