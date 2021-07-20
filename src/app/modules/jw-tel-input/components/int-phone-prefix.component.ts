import { Component, ElementRef, forwardRef, HostListener, Input, OnInit, Renderer2, ViewChild, ChangeDetectionStrategy, Renderer, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { Country } from '../interfaces/country.interface';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { CountryCode } from '../interfaces/country-code.interface';
import { CountryService } from '../services/country.service';
import { LocaleService } from '../services/locale.service';
import * as _ from 'lodash';
import 'rxjs/add/operator/debounceTime';

declare var require: any;

const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const COUNTER_CONTROL_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => IntPhonePrefixComponent),
    multi: true
};

const PLUS = '+';

@Component({
    moduleId: module.id,
    selector: 'int-phone-prefix',
    templateUrl: './int-phone-prefix.component.html',
    styleUrls: [
        './int-phone-prefix.component.scss',
        // "../../../../../node_modules/intl-tel-input/build/css/intlTelInput.css"
        // '../../../../assets/css/flags.min.css'
    ],
    // host: {
    //     '(document:click)': 'hideDropdown($event)',
    // },
    // changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [COUNTER_CONTROL_ACCESSOR, CountryService, LocaleService],
    host: {
        '(change)': 'onChange($event.target.value)',
    }
})
export class IntPhonePrefixComponent implements OnInit, ControlValueAccessor {
    @ViewChild("i") inputField: ElementRef
    private _defaultCountry: string;
    @Input()
    locale: string;
    @Input()
    placeholder: string = "Enter Phone Number";
    @Input()
    set defaultCountry(val: string) {
        this._defaultCountry = !val ? "us" : val.trim();
        if (val)
            this.setCountryCode(val)
    }
    get defaultCountry() {
        return this._defaultCountry ? this._defaultCountry : "us";
    }
    @Output() dialCodeChange: EventEmitter<any> = new EventEmitter();
    @Input()
    maxLength = 15;

    @Input()
    onlyNumbers = true;

    @Input() dialCode = "";
    onChange: any = () => {
        if (this.onModelChange && this.phoneInput) {
            this.onModelChange(this.phoneInput);
        }
    };
    onTouched: any = () => { };
    // ELEMENT REF
    phoneComponent: ElementRef;

    // CONTROL VALUE ACCESSOR FUNCTIONS
    onTouch: Function;
    onModelChange: Function;

    countries: Country[];
    locales: CountryCode;
    selectedCountry: Country;
    countryFilter: string;
    showDropdown = false;
    phoneInput = '';
    disabled = false;

    value = '';
    selectedDialCode: string = "";
    // FILTER COUNTRIES LIST WHEN DROPDOWN IS OPEN
    // @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (this.showDropdown) {
            this.countryFilter = `${this.countryFilter}${event.key}`;
            this.ref.detectChanges();
        }
    }

    public mask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
    constructor(private service: CountryService, private localeService: LocaleService, phoneComponent: ElementRef, private renderer: Renderer, private ref: ChangeDetectorRef) {
        this.phoneComponent = phoneComponent;
        this.locales = this.localeService.getLocales(this.locale);
        this.countries = this.service.getCountries();
    }

    ngOnInit(): void {
        this.translateCountryNames();
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.ref.detectChanges();
    }

    registerOnTouched(fn: Function) {
        this.onTouch = ()=>{
            this.onChange();
            fn();
        }
    }

    registerOnChange(fn: Function) {
        this.onModelChange = fn;
        // if (!this.phoneInput) {
        //     if (this.selectedCountry) {
        //         this.phoneInput = "+" + this.selectedCountry.dialCode + this.phoneInput;
        //     }
        //     else {
        //         this.phoneInput = "+" + this.selectedDialCode + this.phoneInput;

        //     }
        // }
        this.onModelChange(this.phoneInput)
    }

    writeValue(value: string) {
        this.value = value || '';
        this.value = this.value.replace(/ /g, '');
        this.phoneInput = this.value;

        if (IntPhonePrefixComponent.startsWithPlus(this.value)) {
            this.findPrefix(this.value.split(PLUS)[1]);
            if (this.selectedCountry) {
                this.updatePhoneInput(this.selectedCountry.countryCode);
            }

            // if (this.selectedDialCode) {
            //     this.value = this.value.replace("+" + this.selectedDialCode, "");
            // }
        }


        else if (this.defaultCountry) {
            this.updatePhoneInput(this.defaultCountry);
        }
        this.dialCode = this.selectedDialCode;
        this.dialCodeChange.emit(this.dialCode);
        // this.updatePhone();
    }

    updateSelectedCountry(event: Event, countryCode: string) {
        event.preventDefault();
        event.stopPropagation();
        let had_plus = IntPhonePrefixComponent.startsWithPlus(this.phoneInput);
        if (this.selectedCountry) {
            this.phoneInput = this.phoneInput.replace("+" + this.selectedCountry.dialCode, "");
            this.value = this.phoneInput;
        }
        this.updatePhoneInput(countryCode);
        if (this.phoneInput.replace(/ /g, '').trim()) {
            if (had_plus && this.selectedCountry) {
                this.phoneInput = "+" + this.selectedCountry.dialCode + this.phoneInput;
                this.value = this.phoneInput
            }
            this.updateValue();
        }
        this.inputField.nativeElement.focus();
        this.disableClickListener();
        this.disableKeyboardListener();

    }

    showDropDown(e) {
        this.showDropdown = !this.showDropdown;
        this.countryFilter = '';
        e.preventDefault();
        if (this.showDropdown) {
            this.enableClickListener();
            this.enableKeyboardListener();
        }
        else {
            this.disableClickListener();
            this.disableKeyboardListener();
        }
    }

    hideDropdown(event: Event) {
        if (!this.phoneComponent.nativeElement.contains(event.target)) {
            this.showDropdown = false;
            this.disableClickListener();
            this.disableKeyboardListener();
            this.ref.detectChanges();
        }
    }

    updatePhone() {
        if (IntPhonePrefixComponent.startsWithPlus(this.phoneInput)) {
            this.findPrefix(this.phoneInput.split(PLUS)[1]);
        } else {
            // this.selectedCountry = null;
        }

        this.updateValue();
    }

    private translateCountryNames() {
        this.countries.forEach((country: Country) => {
            country.name = this.locales[country.countryCode];
        });

        this.orderCountriesByName();
    }

    private orderCountriesByName() {
        this.countries = _.sortBy(this.countries, 'name');
    }

    private updatePhoneInput(countryCode: string) {
        this.showDropdown = false;

        let newInputValue: string = this.phoneInput;

        this.selectedCountry = this.countries.find((country: Country) => country.countryCode === countryCode) || this.selectedCountry;
        this.phoneInput = `${newInputValue.replace(/ /g, '')}`;
        // this.phoneInput = this.phoneInput.replace("+" + this.selectedDialCode, "");
    }

    private findPrefix(prefix: string) {
        let foundPrefixes: Country[] = this.countries.filter((country: Country) => prefix.startsWith(country.dialCode));
        this.selectedCountry = !_.isEmpty(foundPrefixes)
            ? IntPhonePrefixComponent.reducePrefixes(foundPrefixes ,prefix)
            : this.selectedCountry;
        if (this.selectedCountry != null) {
            this.selectedDialCode = this.selectedCountry.dialCode;
            this.defaultCountry = this.selectedCountry.countryCode;
        }
    }

    private updateValue() {
        this.value = this.phoneInput.replace(/ /g, '');
        this.onModelChange(this.value);
        // this.onTouch();
    }

    private static startsWithPlus(text: string): boolean {
        return text.startsWith(PLUS);
    }

    private static reducePrefixes(foundPrefixes: Country[] , phNumber?: string) {
        try {
          if (foundPrefixes.length > 1 && (phNumber.length > 5)) {
            var selectedPrefix;
            var checkNumberValidity = phoneUtil.parse('+'+phNumber);
            if((phoneUtil.getRegionCodeForNumber(checkNumberValidity))) {
              foundPrefixes.forEach((option) => {
                if(option.countryCode == (phoneUtil.getRegionCodeForNumber(checkNumberValidity).toLowerCase())) {
                    selectedPrefix = { ...option};
                }
            })
            } else {
              selectedPrefix = {
                name: 'UNITED STATES',
                dialCode: '1',
                countryCode: 'us'
              }
            }
            return selectedPrefix;
            // this.getRegion('+15165211187');
          } else {
            return foundPrefixes.reduce(
                (first: Country, second: Country) => first.dialCode.length >= second.dialCode.length
                        ? first
                        : second
            );
          }
        } catch(e) {
          console.log(e);
          selectedPrefix = {
            name: 'UNITED STATES',
            dialCode: '1',
            countryCode: 'us'
          }
          return selectedPrefix;
        }
  
      }
  

    public setCountryCode(countryCode: string) {
        let validCountryCode = this.locales[countryCode] ? countryCode : this.defaultCountry;
        this.updatePhoneInput(validCountryCode);
        this.ref.detectChanges();
    }

    private enableClickListener() {
        this.globalClickListenFunc = this.renderer.listen('document', 'click', e => {
            this.hideDropdown(e)
        });

    }

    private disableClickListener() {
        if (this.globalClickListenFunc)
            this.globalClickListenFunc();
    }

    private disableKeyboardListener() {
        if (this.globalkeyboardListenFunc)
            this.globalkeyboardListenFunc();
    }
    private enableKeyboardListener() {
        this.globalkeyboardListenFunc = this.renderer.listen('document', 'keypress', e => {
            this.handleKeyboardEvent(e)
        });

    }

    validatePhoneNumber() {
        if (!this.phoneInput) {
            return null;
        }
        if (this.phoneInput.length < 2) {
            return { invalidPhoneNumber: 'Phone Number is not valid.' };
        }
        // try {
        //     let i;
        //     if (IntPhonePrefixComponent.startsWithPlus(this.phoneInput)) {
        //         i = this.phoneInput.split(PLUS)[1];
        //     } else {
        //         i = this.phoneInput;
        //     }
        //     const number = phoneUtil.parseAndKeepRawInput(i, this.selectedCountry ? this.selectedCountry.countryCode.toLowerCase() : '');
        //     if (!phoneUtil.isPossibleNumber(number) || !phoneUtil.isValidNumber(number)) {
        //         return { invalidPhoneNumber: 'Phone Number is not valid.' };
        //     }
        //     else {
        //         return null;
        //     }
        // }
        // catch (e) {
        //     console.log(e);
        //     return { invalidPhoneNumber: 'Phone Number is not valid.' };
        // }
    }

    globalClickListenFunc;
    globalkeyboardListenFunc;
}
