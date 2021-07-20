import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteComponent } from './components/autocomplete/autocomplete.component';
import { FormsModule } from '../../../../node_modules/@angular/forms';
import { AutocompleteService } from './service/autocomplete.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [AutocompleteComponent],
  providers: [AutocompleteService],
  exports: [AutocompleteComponent]
})
export class JwGoogleAutocompleteModule { }
