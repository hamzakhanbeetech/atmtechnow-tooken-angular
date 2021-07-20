import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { IPageSettings, IFavIcon, IResetPassword } from './interfaces/interface';
import { CommonService } from '../../services/common.service';

@Injectable()
export class PanelService {
  constructor(private http: HttpClient, private router: Router, private commonService: CommonService) {
  }

  /**
   * API call for user login
   * @param email 
   * @param password 
   */
  userLogin(email: string, password: string) {
    let timeZone = new Date();
    const body = {
      email: email,
      password: password,
      timezone: timeZone.getTimezoneOffset()
    }
    return this.http
      .post(`${environment.api_url}/user_login`, body)
      .map(this.commonService.tookanResponse);
  }

  /**
   * API call for forgot pwd
   * @param emailVal entered email
   */
  userForgotPasswordFromEmail(emailVal: string) {
    const body = {
      email: emailVal
    }
    return this.http
      .post(`${environment.api_url}/users_forgot_password_from_email`, body)
      .map(this.commonService.tookanResponse);
  }

  /**
   * API for reset password
   * @param body of type IResetPassword
   */
  resetPassword(body: IResetPassword) {
    return this.http
      .post(`${environment.api_url}/forgot_password`, body)
      .map(this.commonService.tookanResponse);
  }

  /**
   * API call for signip
   * @param body of type ISignup
   */

  register(body) {
    return this.http
      .post(`${environment.api_url}/register`, body)
      .map(this.commonService.tookanResponse);
  }

  /**
   * API call to fetch country code for the current user.
   */
  public requestCountryCode() {
    return this.http
      .get(`${environment.api_url2}/requestCountryCodeGeoIP2`)
      .map(this.commonService.tookanResponse);
  }


  /**
   * API call to validate email
   * @param email
   */
  validateEmail(email: string) {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded');
    const body = `email=${encodeURIComponent(email)}`;
    return this.http
      .post(`${environment.api_url}/v2/check_email_exists`, body, { headers: headers })
      .map(this.commonService.tookanResponse);
  }

  /**
   * API call for login via access token
   * @param token 
   */
  loginViaAccessToken(token: string) {
    const obj = {
      access_token: token
    }
    return this.http
      .post(`${environment.api_url}/user_login_via_access_token`, obj)
      .map(this.commonService.tookanResponse);
  }

  /**
   * API call to check existing markeplace lead
   * @param body 
   */
  exisitingCustomerLead(body) {
    return this.http
      .post(`${environment.api_url}/existing_customer_marketing_lead`, body)
      .map(this.commonService.tookanResponse);
  }

}
