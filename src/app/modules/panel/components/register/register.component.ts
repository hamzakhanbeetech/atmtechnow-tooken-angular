import { Component, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ISignup, ISignupParams, ICookieItem } from '../../interfaces/interface';
import { PanelService } from '../../panel.service';
import { Subscription } from 'rxjs/Subscription';
import { IntPhonePrefixComponent } from '../../../jw-tel-input/components/int-phone-prefix.component';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';

import { CustomMessageService } from '../../../../services/custom-message.service';
import { Country } from '../../../jw-tel-input/interfaces/country.interface';
import { ILoginData } from '../../../../interfaces/interface';
import { GaService } from '../../../../services/ga.service';
import { CommonService } from '../../../../services/common.service';
import { environment } from '../../../../../environments/environment';
import { constants } from '../../../../../constants/constants';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss', '../login/login.component.scss']
})
export class RegisterComponent implements OnInit {
  @ViewChild("intlTelInput") phoneInputField: IntPhonePrefixComponent;
  public signupForm: FormGroup;
  public emailPrefilled = false;
  public signupBody: ISignup = <ISignup>{};
  public showPassword: boolean;
  public validatingEmail: string;
  public emailCheckSubs: Subscription;
  public selectedCountryCode: string = "";
  public defaultCountryCode: string = "us";
  private countryConfig: any;
  public btnState;
  public loginViaAccessTokenResponse: ILoginData;
  private _timeout_ref_1;
  private _timeout_ref_2;
  private time: Date;
  public signupParams: ISignupParams = <ISignupParams>{};
  public ButtonStateValuePair = {
    "default": {
      class: "",
      text: "Sign up for a Free Account!",
      id: 0
    },
    "loading": {
      class: "btn-loading",
      text: "Signing up",
      id: 1
    },
    "success": {
      class: "btn-tick",
      text: "",
      id: 2
    },
    "loggingIn": {
      class: "delete-content btn-logging-in",
      text: "",
      id: 3
    },
    "walkthrough": {
      class: "delete-content btn-walkthrough",
      text: "",
      id: 4
    },
    'delete': {
      class: "delete-content btn-tick",
      text: "Signup successful",
      id: 5
    }
  }
  constructor(private formBuilder: FormBuilder, private customMessage: CustomMessageService,
    private router: Router, private panelService: PanelService, private activatedRoute: ActivatedRoute,
    private renderer: Renderer2, private gaService: GaService, public commonService: CommonService) { }



  ngOnInit() {
    window['register'] = this;
    this.initSignupForm();
    this.requestCountryCode();
    this.subscribeToEmailChange();
    this.changeButtonState("default");
    this.activatedRoute.queryParams.subscribe(
      (data) => {
        if (data != null) {
          this.signupParams = data;
          this.setMarketplaceValues();
        }
      });
  }

  /**
   * if user signups from a particular marketplace
   * setting values in form and localstorage
   * signupParams has all the cases of params
   */
  setMarketplaceValues() {
    let cookieItems: ICookieItem = <ICookieItem>{};
    let sourceuser, mediumuser;
    if (this.signupParams.email) {
      this.signupForm.controls.email.setValue(this.signupParams.email);
      cookieItems.c_email = this.signupParams.email;
      // setTimeout(() => {
      //   this.onEmailChange(this.signupParams.email);
      // }, 400);
    }
    if (this.signupParams.phone) {
      this.renderer.setProperty(this.phoneInputField.inputField.nativeElement, 'value', this.signupParams.phone);
      this.signupForm.controls.phone.setValue(this.signupParams.phone);
    }
    if (this.signupParams.name) {
      this.signupForm.controls.name.setValue(this.signupParams.name);
    }
    if (this.signupParams.utm_source) {
      this.signupBody.source = this.signupParams.utm_source;
      sourceuser = this.signupParams.utm_source;;
    }
    if (this.signupParams.utm_medium) {
      this.signupBody.medium = this.signupParams.utm_medium;
      mediumuser = this.signupParams.utm_medium;
    }
    if (this.signupParams.refferal_id) {
      cookieItems.refer_id = this.signupParams.refferal_id;
    }
    if (this.signupParams.l_source) {
      cookieItems.l_source = this.signupParams.l_source;
    }
    if (this.signupParams.tarsan) {
      sourceuser = 'Google';
      mediumuser = 'TN-' + this.signupParams.tarsan;
    }
    if (this.signupParams.previous_page) {
    }

    if (cookieItems.c_email != '' && cookieItems.refer_id != '' && cookieItems.l_source != '') {
      localStorage.setItem('temp', JSON.stringify(cookieItems));
    }
    //existing lead api
    var accessCrendentialsObj = JSON.parse(localStorage.getItem('accessCrendentials'));
    if (sourceuser && mediumuser && accessCrendentialsObj && accessCrendentialsObj.accesstoken) {
      const obj = {
        access_token: accessCrendentialsObj.accesstoken,
        source: sourceuser,
        medium: mediumuser,
        previous_page: this.signupParams.previous_page
      }
      this.panelService.exisitingCustomerLead(obj).subscribe(
        response => {

        });
    }

  }

  initSignupForm() {
    this.signupForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'email': ['', [Validators.required, Validators.pattern(constants.emailPattern)]],
      'password': ['', [Validators.required, Validators.minLength(6)]],
      'phone': ['', Validators.required]
    });
  }

  redirectToLogin() {
    if (this.signupParams != null) {
      this.router.navigate(['/page/login'], { queryParams: this.signupParams, queryParamsHandling: "merge" });
    } else {
      this.router.navigate(['/page/login']);
    }

  }

  /**
   * Api call for signup
   * redirect to dashboard using login via access token
   */
  register() {
    if (!this.signupForm.valid) {
      return this.commonService.validateAllFormFields(this.signupForm);
    } else {
      const name = this.signupForm.controls.name.value.trim();
      const email = this.signupForm.controls.email.value.trim();
      const phoneValue: string = this.signupForm.controls.phone.value.toString();
      const domain = window.location.hostname;
      this.signupBody.name = name
      this.signupBody.first_name = name.split(' ')[0];
      this.signupBody.last_name = name.split(' ')[1] || '';
      this.signupBody.email = this.signupForm.controls.email.value.trim();
      this.signupBody.password = this.signupForm.controls.password.value.trim();
      if (phoneValue.startsWith('+')) {
        this.signupBody.phone = phoneValue;
      } else {
        let countryData: Country = this.phoneInputField.selectedCountry;
        this.signupBody.phone = `+${countryData.dialCode.toString()}${phoneValue}`;
      }
      this.signupBody.country_phone_code = this.phoneInputField.selectedCountry.name;
      this.signupBody.timezone = (new Date).getTimezoneOffset();
      if (domain.search('tookan') != -1) {
        this.signupBody.domain = window.location.hostname;
      } else {
        this.signupBody.domain = '';
      }
      this.signupBody.step = 1;
      this.signupBody.layout_type = 0;
      if (email.length) {
        if (email.indexOf('clicklabs.in') > -1) {
          this.signupBody.internal_user = 1;
        } else if (email.indexOf('click-labs.com') > -1) {
          this.signupBody.internal_user = 1;
        } else if (email.indexOf('clicklabs.co') > -1) {
          this.signupBody.internal_user = 1;
        } else if (email.indexOf('tookanapp.com') > -1) {
          this.signupBody.internal_user = 1;
        } else if (email.indexOf('theroboticshomepage.com') > -1) {
          this.signupBody.internal_user = 1;
        } else if (email.indexOf('ZenqUser') > -1) {
          this.signupBody.internal_user = 1;
        }
      }
      this.gaService.emitEvent('v4_app_tookanapp_register_new_ga_events', 'before_api_call', email);
      this.changeButtonState('loading');
      this.panelService.register(this.signupBody).subscribe(
        response => {

          //animation changes
          this.changeButtonState('success');
          setTimeout(() => {
            this.changeButtonState('delete');
          }, 300);
          this._timeout_ref_1 = setTimeout(() => {
            this.changeButtonState('loggingIn');
          }, 2000);
          this.time = new Date();
          this._timeout_ref_2 = setTimeout(() => {
            this.changeButtonState("walkthrough");
          }, 3500);

          if (this.signupParams.redirect) {
            var isRedirect = this.signupParams.redirect
            if (isRedirect) {
              this.gaService.emitEvent('marketplace_v2', 'Signup', decodeURIComponent(isRedirect));
            }
          }
          //redirection check and call
          let time = (new Date().getTime() - (this.time).getTime()); //ms    
          var timer = time >= 3600 ? 200 : (3600 - time + 200);
          setTimeout(() => {
            var hasHash = window.location.hash;
            if (this.signupParams.is_redirect_to_marketplace && !this.signupParams.redirect_after_onboarding) {
              window.location.href = this.signupParams.is_redirect_to_marketplace;
            }
            else if (this.signupParams.is_redirect_to_marketplace && this.signupParams.redirect_after_onboarding) {
              // to be uncommented when dashboard is moved in Angular.
              // this.router.navigate(['/dashboard'], {
              //   queryParams:
              //     {
              //       redirect_after_onboarding: this.signupParams.redirect_after_onboarding,
              //       redirect: this.signupParams.is_redirect_to_marketplace + (hasHash ? "#" + hasHash : "")
              //     }
              // })
              window.location.href = window.location.origin + "/#/app/dashboard?redirect_after_onboarding=" + this.signupParams.redirect_after_onboarding + "&redirect=" + this.signupParams.is_redirect_to_marketplace + (hasHash ? "#" + hasHash : "");
            }
            else {
              this.redirectionToDashboard(response.data.access_token);
            }
          }, timer);
          this.gaService.emitEvent('v4_app_tookanapp_onboard', 'onboarding_app_tookanapp_register', 'onboarding_app_tookanapp_register');
          this.gaService.emitEvent('v4_app_tookanapp_register_new_ga_events', 'after_api_call_success', email);

          // this.gaService.emitEvent('send', 'event',
          // {
          //     eventCategory: 'Registration Process',
          //     eventAction: 'ButtonClick',
          //     eventLabel: $location.search().previous_page || 'Step 2',
          //     'eventValue': 1,
          //     'hitCallback': function () {
          //     },
          //     'hitCallbackFail': function () {
          //     }
          // })
          localStorage.removeItem('temp');
        },
        error => {
          //loader false
          this.changeButtonState('default');
          this.gaService.emitEvent('v4_app_tookanapp_register_new_ga_events', 'after_api_call_error', email);
          this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
        });
    }


  }

  togglePassword(item: string) {
    let el = document.getElementById(item);
    if (!this.showPassword) {
      el.setAttribute('type', 'text');
      this.showPassword = true;
    }
    else {
      el.setAttribute('type', 'password');
      this.showPassword = false;
    }
  }

  requestCountryCode() {
    this.panelService.requestCountryCode()
      .subscribe(response => {
        if (response && response.status == 200 && response.data) {
          this.countryConfig = response.data;
          this.phoneInputField.setCountryCode(this.countryConfig.country_code.toLowerCase());
          //  jQuery("#companyPhone").intlTelInput("setCountry", this.countryConfig.country_code.toLowerCase())
        }
      },
        error => {

        })
  }

  subscribeToEmailChange() {
    this.signupForm.controls.email.valueChanges
      .debounceTime(400)
      .distinctUntilChanged()
      .subscribe((value) => {
        if (this.signupForm.controls.email.valid)
          this.onEmailChange(value);
        else {
          this.validatingEmail = 'invalidPattern';
          // this.ref.detectChanges();
        }
      });
  }

  onEmailChange(value) {
    this.emailCheckSubs ? this.emailCheckSubs.unsubscribe() : "";
    this.validatingEmail = 'loading';
    this.emailCheckSubs = this.panelService.validateEmail(value)
      .subscribe(response => {
        this.validatingEmail = "success";
        //this.ref.detectChanges();
      },
        error => {
          //tookan not following standard
          this.validatingEmail = "failed";
        });
  }

  /** signup animation testing */
  changeButtonValueState() {
    // setTimeout(() => {
    //   this.changeButtonState('loading')
    // });
    // setTimeout(() => {
    //   this.changeButtonState('success')
    // }, 2000);
    // setTimeout(() => {
    //   this.changeButtonState('delete')
    // }, 2300);
    // setTimeout(() => {
    //   this.changeButtonState('loggingIn')
    // }, 5000);
    // setTimeout(() => {
    //   this.changeButtonState('walkthrough')
    // }, 7000);
    this.changeButtonState('success');
    setTimeout(() => {
      this.changeButtonState('delete');
    }, 300);
    this._timeout_ref_1 = setTimeout(() => {
      this.changeButtonState('loggingIn');
    }, 2000);
    this.time = new Date();
    this._timeout_ref_2 = setTimeout(() => {
      this.changeButtonState('walkthrough')
    }, 3500);
  }

  changeButtonState(key: string) {
    this.btnState = this.ButtonStateValuePair[key];
  }

  /** 
   * API call for loginvia access token after signup
   * @param access_token access token required for login.
  */
  redirectionToDashboard(access_token: string) {
    this.panelService.loginViaAccessToken(access_token).subscribe(
      response => {
        this.loginViaAccessTokenResponse = response.data;
        if (response.data) {
          const obj = {
            access_token: this.loginViaAccessTokenResponse.access_token,
            user_id: this.loginViaAccessTokenResponse.user_id
          };
          localStorage.setItem('accessCrendentials', JSON.stringify(obj));
        }
        this.router.navigate(['/dashboard']);
      },
      error => {
        clearTimeout(this._timeout_ref_1);
        clearTimeout(this._timeout_ref_2);
        this.changeButtonState("default");
        this.router.navigate(['/page/register']);
      });
  }

}
