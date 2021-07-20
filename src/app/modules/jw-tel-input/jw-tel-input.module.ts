import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryService } from './services/country.service';
import { LocaleService } from './services/locale.service';
import { IntPhonePrefixComponent } from './components/int-phone-prefix.component';
import { CountryPipe } from './pipes/country.pipe';
import { OnlyNumberDirective } from './directives/only-number.directive';
import { FormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TextMaskModule
  ],
  declarations: [
    IntPhonePrefixComponent,
    CountryPipe,
    OnlyNumberDirective
  ],
  providers: [
    CountryService,
    LocaleService
  ],
  exports: [IntPhonePrefixComponent]
})
export class JwTelInputModule { }
