import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JobsiteComponent } from './jobsite.component';
import { SitesListComponent } from './sites-list/sites-list.component';

const routes: Routes = [
  {
    path: '',
    component: JobsiteComponent,
    children: [
      {
          path: 'list',
          component: SitesListComponent
      },
      {
        path:'',
        pathMatch:'full',
        redirectTo:'list'
    }
    ]
 }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobsitesRoutingModule { }
