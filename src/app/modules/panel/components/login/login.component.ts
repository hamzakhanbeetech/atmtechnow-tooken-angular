import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { PanelService } from '../../panel.service';
import { CommonService } from '../../../../services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { IPageSettings, IFavIcon, ISignupParams } from '../../interfaces/interface';
import { GaService } from '../../../../services/ga.service';
import { environment } from '../../../../../environments/environment';
import { constants } from '../../../../../constants/constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public showPassword: boolean;
  public showLoader: number = 2;
  public showloginwithOauthButton: boolean = false;
  public marketPlaceParams :ISignupParams = <ISignupParams>{};
  constructor(private formBuilder: FormBuilder,
    private panelService: PanelService,
    public commonService: CommonService,
    private router: Router, private customMessage: CustomMessageService, 
    private route: ActivatedRoute , private gaService: GaService) { }

  ngOnInit() {
    this.initLoginForm();
    var hostname = window.location.hostname;
    if (hostname.includes('weedmaps')) {
      this.showloginwithOauthButton = true;
    }
    //if user comes from market place
    this.route.queryParams.subscribe(
      (data) => {
        if(data) {
          this.marketPlaceParams = data;
        }
      });
     
  }

  /**
   * Initialization of login form with two fields
   */
  initLoginForm() {
    this.loginForm = this.formBuilder.group({
      'email': ['', [Validators.required , Validators.pattern(constants.emailPattern)]],
      'password': ['', Validators.required]
    });
  }

  /** 
   * Function called when Login form is submitted
  */
  loginAdmin() {
    if (!this.loginForm.valid) {
      return this.commonService.validateAllFormFields(this.loginForm);
    }
    else {
      const email = this.loginForm.controls.email.value.trim();
      const password = this.loginForm.controls.password.value.trim();
      this.panelService.userLogin(email, password).subscribe(
        response => {
          this.gaService.emitEvent('app_tookanapp_login', 'login_login', 'login_login');
            //this.showLoader = true
            this.commonService.loginData = response.data; 
            this.route.queryParams.subscribe(
              (data) => {
                if(data.search('redirect') != -1) {
                  var isRedirect = data.redirect;
                  if (isRedirect)
                  this.gaService.emitEvent('marketplace_v2', 'Signin', decodeURIComponent(isRedirect));
                }
              });     
            
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
        },
        error => {
          //this.showLoader = false
          this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
          //message service
        });

    }

  }

  /** 
   * Function to redirect to forgot password page
  */
  forgotPassword() {
    this.gaService.emitEvent('app_tookanapp_login', 'login_forgot_pass', 'login_forgot_pass');
    this.router.navigate(['/page/forgotPassword']);
  }


  public togglePassword(item: string) {
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

  /** 
   * If host is weedmaps , login redirects to different page
  */
  loginDifferentDomain() {
    this.gaService.emitEvent('app_tookanapp_login', 'login_via_weedmap', 'login_via_weedmap');
    window.location.href = "https://weedmaps.com/oauth/authorize?client_id=a66013973c3bc71a29da59ecc57cc1f1eccb70c05da6c5aadeb79bd98fc19bca&redirect_uri=https://owner.weedmaps.com&response_type=code";
  }

  sendCreateEvent() {
  }

  goToRegister() {
    //for marketplace user
    if(this.marketPlaceParams != null) {
      //preserve query params and then forward
      this.sendMarketPlaceGA('goto_register');
      this.router.navigate(['/page/register'] , { queryParams: this.marketPlaceParams , queryParamsHandling: "merge" } );
    } else {
      this.gaService.emitEvent('app_tookanapp_login', 'login_create_new', 'login_create_new');
      this.router.navigate(['/page/register']);
    }
   
  }

  sendMarketPlaceGA(action:string , label?:string) {
    var isRedirect = this.marketPlaceParams.redirect;
    if (isRedirect) {
        this.gaService.emitEvent('marketplace_v2', action, label || decodeURIComponent(isRedirect));
    }
  }

 
 
}
