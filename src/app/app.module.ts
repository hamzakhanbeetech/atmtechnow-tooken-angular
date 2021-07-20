import { BrowserModule, } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { SelectivePreloadingStrategy, routing } from './app.routing';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { CommonService } from './services/common.service';
import { JwNotificationsModule } from './modules/jw-notifications/jw-notifications.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StartupService } from './services/startup.service';
import { CustomMessageService } from './services/custom-message.service';
import { GrowlModule } from 'primeng/growl';
import { MessageService } from 'primeng/components/common/messageservice';
import { GaService } from '../app/services/ga.service';
import { AppInterceptor } from './interceptor/app.interceptor';

export function startupServiceFactory(startupService: StartupService): Function {
  return () => startupService.load();
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    routing,
    HttpClientModule,
    JwNotificationsModule,
    BrowserAnimationsModule,
    GrowlModule
  ],
  providers: [
    SelectivePreloadingStrategy,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    CommonService,
    StartupService,
    {
      // Provider for APP_INITIALIZER
      provide: APP_INITIALIZER,
      useFactory: startupServiceFactory,
      deps: [StartupService],
      multi: true
    },
    CustomMessageService,
    MessageService,
    GaService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppInterceptor,
      multi: true
    }
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
