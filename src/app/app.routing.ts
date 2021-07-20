
import { ModuleWithProviders } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Routes, RouterModule, PreloadingStrategy, Route } from '@angular/router';
import 'rxjs/add/observable/of';
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: Function): Observable<any> {
    return route.data && route.data.preload ? load() : Observable.of(null);
  }
}

const appRoutes: Routes = [
  {
    path: 'dashboard',
    loadChildren: './modules/dashboard/dashboard.module#DashboardModule',
    data: { preload: false },
  },
  {
    path: 'page',
    loadChildren: './modules/panel/panel.module#PanelModule',
  },
  {
    path: 'merchant',
    loadChildren: './modules/merchant/merchant.module#MerchantModule',
    data: { preload: true },
  },
  {
    path: 'customer',
    loadChildren: './modules/customer/customer.module#CustomerModule',
    data: { preload: true },
  },
  {
    path: 'jobsites',
    loadChildren: './modules/jobsites/jobsites.module#JobsitesModule',
    data: { preload: true },
  },
  {
    path: 'routes',
    loadChildren: './modules/routes/routes.module#RoutesModule',
    data: { preload: true },
  },
  {
    path: 'settings',
    loadChildren: './modules/settings/settings.module#SettingsModule',
    data: { preload: false },
  },
  {
    path: '',
    pathMatch:"full",
   redirectTo:'/dashboard'
  },
];
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, { preloadingStrategy: SelectivePreloadingStrategy });
