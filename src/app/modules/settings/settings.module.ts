import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { SidemenuComponent } from './components/sidemenu/sidemenu.component';
import { Routes, RouterModule } from '@angular/router';
import { ApiKeysComponent } from './components/api-keys/api-keys.component';
import { SettingsService } from './services/settings.service';
import { TooltipModule } from 'primeng/tooltip';
import { HeaderModule } from '../header/header.module';
import { DevelopersComponent } from './components/developers/developers.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { JwCommonModule } from '../jw-common/jw-common.module';
import { TableModule } from 'primeng/table';
import { ChipsModule } from 'primeng/chips';
import { AccordionModule } from 'primeng/accordion';
import { PaginatorModule } from 'primeng/paginator';
import { AutoAllocationComponent } from './components/auto-allocation/auto-allocation.component';
import { ManagerComponent } from './components/manager/manager.component';
import { GetTeamNameFromManagersPipe } from './pipes/pipes.pipe';
import { RemoveUnderscorePipe } from './pipes/removeUnderscore.pipe';
import { JwTelInputModule } from '../jw-tel-input/jw-tel-input.module';
import { MultiSelectModule } from 'primeng/multiselect';
import { AgentAppComponent } from './components/agent-app/agent-app.component';
import { TeamsComponent } from './components/teams/teams.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PreferencesComponent } from './components/preferences/preferences.component';

import { EmailComponent } from './components/email/email.component';
import { DropdownModule } from 'primeng/dropdown';
import { NguiMapModule } from '@ngui/map';
import { RightsComponent } from './components/rights/rights.component';
import { ProfileComponent } from './components/profile/profile.component';
import { environment } from '../../../environments/environment';
import { AgmCoreModule } from '@agm/core';
import { OpentokhistoryComponent } from './components/opentokhistory/opentokhistory.component';
import { CalendarModule } from 'primeng/calendar';
//import { BsDatepickerModule } from 'ngx-bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CallurlComponent } from './components/callurl/callurl.component';
import { RequestotpComponent } from './components/requestotp/requestotp.component';
import { DriverWalletComponent } from './components/driver-wallet/driver-wallet.component';
import { KeyFilterModule } from 'primeng/keyfilter';
import { AgentSkillComponent } from './components/agent-skill/agent-skill.component';
import { ContactusComponent } from './components/contactus/contactus.component';
import { AddonServicesComponent } from './components/addon-services/addon-services.component';
import { CancellationPolicyComponent } from './components/cancellation-policy/cancellation-policy.component';
import { CustomNotificationsComponent } from './components/custom-notifications/custom-notifications.component';
import { VideoLinksComponent } from './components/video-links/video-links.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { Daterangepicker } from 'ng2-daterangepicker';
import { CompanyReportsComponent } from './components/company-reports/company-reports.component';
import { SoftwareUploadComponent } from './components/software-upload/software-upload.component';
import { SparePartComponent } from './components/spare-part/spare-part.component';
import { QuickBooksComponent } from './components/quick-books/quick-books.component';
import { TaxesComponent } from './components/taxes/taxes.component';
import { RaiseDisputeComponent } from './components/raise-dispute/raise-dispute.component';
import { StripeComponent } from './components/stripe/stripe.component';
import { TasksEnterpriseComponent } from './components/tasks-enterprise/tasks-enterprise.component';
const settingsRoutes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: 'apiKey',
        component: ApiKeysComponent
      },
      {
        path: 'developer',
        component: DevelopersComponent
      },
      {
        path: 'assignment',
        component: AutoAllocationComponent
      },
      {
        path: 'manager',
        component: ManagerComponent
      },
      {
        path: 'agent-app',
        component: AgentAppComponent
      },
      {
        path: 'agent-skill',
        component: AgentSkillComponent
      },
      {
        path: 'addon-services',
        component: AddonServicesComponent
      },
      {
        path: 'teams',
        component: TeamsComponent
      },
      {
        path: 'email',
        component: EmailComponent
      },
      {
        path: 'rights',
        component: RightsComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'preferences',
        component: PreferencesComponent
      },
      {
        path: 'callhistory',
        component: OpentokhistoryComponent
      },
      {
        path: 'spareParts',
        component: SparePartComponent
      },
      {
        path: 'taxes',
        component: TaxesComponent
      },
      {
        path: 'disputes',
        component: RaiseDisputeComponent
      },
      {
        path: 'enterprise-tasks',
        component: TasksEnterpriseComponent
      },
      {
        path: 'stripe',
        component: StripeComponent
      },
      {
        path: 'quickBooks',
        component: QuickBooksComponent
      },
      {
        path: 'callhistory/:job_id',
        component: CallurlComponent
      },
      {
        path: 'requestotp',
        component: RequestotpComponent
      },
      {
        path: 'driverWallet',
        component: DriverWalletComponent
      },
      {
        path: 'contactus',
        component: ContactusComponent
      },
      {
        path: 'cancellation-policy',
        component: CancellationPolicyComponent
      },
      {
        path: 'custom-notifications',
        component: CustomNotificationsComponent
      },
      {
        path: 'video-links',
        component: VideoLinksComponent
      },
      {
        path: 'software-upload',
        component: SoftwareUploadComponent
      },
      {
        path: 'payments',
        component: PaymentsComponent
      },
      {
        path: 'company-reports',
        component: CompanyReportsComponent
      },

    ]
  }
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(settingsRoutes),
    TooltipModule,
    HeaderModule,
    ReactiveFormsModule,
    FormsModule,
    JwCommonModule,
    TableModule,
    ChipsModule,
    AccordionModule,
    PaginatorModule,
    JwTelInputModule,
    MultiSelectModule,
    OverlayPanelModule,
    CalendarModule,
    Daterangepicker,
    KeyFilterModule,
    BsDatepickerModule.forRoot(),
    DropdownModule,
    AgmCoreModule.forRoot({
      channel: 'tookan_dashboard',
      clientId: environment.google_maps_key,
      libraries: ["places", "geometry"]
    }),
    NguiMapModule.forRoot({ apiUrl: 'https://maps.google.com/maps/api/js?key=AIzaSyA7a9isA6-C0HlZ9Lqp3Kc_q4ntThVvCdo&libraries=places' }),
  ],
  declarations: [
    SettingsComponent,
    SidemenuComponent,
    ApiKeysComponent,
    DevelopersComponent,
    AutoAllocationComponent,
    ManagerComponent,
    GetTeamNameFromManagersPipe,
    RemoveUnderscorePipe,
    AgentAppComponent,
    TeamsComponent,
    EmailComponent,
    RightsComponent,
    PreferencesComponent,
    ProfileComponent,
    OpentokhistoryComponent,
    CallurlComponent,
    RequestotpComponent,
    DriverWalletComponent,
    AgentSkillComponent,
    ContactusComponent,
    AddonServicesComponent,
    CancellationPolicyComponent,
    CustomNotificationsComponent,
    VideoLinksComponent,
    PaymentsComponent,
    CompanyReportsComponent,
    SoftwareUploadComponent,
    SparePartComponent,
    QuickBooksComponent,
    TaxesComponent,
    RaiseDisputeComponent,
    StripeComponent,
    TasksEnterpriseComponent,

  ],
  providers: [SettingsService]
})
export class SettingsModule { }
