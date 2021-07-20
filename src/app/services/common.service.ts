import { Injectable, TemplateRef, EventEmitter } from '@angular/core';
import { ILoginData } from '../interfaces/interface';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { IPageSettings, IFavIcon } from '../modules/panel/interfaces/interface';
import { IAddTemplate } from '../interfaces/interface';
import { FormGroup, FormControl, FormArray, ValidatorFn, ValidationErrors } from '@angular/forms';
import { PanelService } from '../modules/panel/panel.service';
import { environment } from '../../environments/environment';
import { CustomMessageService } from './custom-message.service';


@Injectable()
export class CommonService {
  loginData: any;
  parentOrigin: string;
  errorMessage: string;
  showLoader: boolean;
  blockSpecial :RegExp = /^[^<>]*$/;
  /**
  * Page settings object for global object
  * of format settings of pages
  */
  private _pageSettings: IPageSettings = <IPageSettings>{};

  set pageSettings(val) {
    this._pageSettings = val;
  }

  get pageSettings() {
    return this._pageSettings;
  }
  onTemplateAddEvent: EventEmitter<IAddTemplate> = new EventEmitter<IAddTemplate>();
  onLogoutBtnVisibilityChange: EventEmitter<Boolean> = new EventEmitter<Boolean>();

  constructor(private titleService: Title, private http: HttpClient, private customMessage: CustomMessageService) { }

  /** Tookan not following response code standards. */
  public tookanResponse(res: any, index: number) {
    if (!(res.status === 200)) {
      throw new Error(res.message);
    }
    else
      return res;
  }

  /** show error message to the user. */
  public handleError(err: HttpErrorResponse) {
    // this.errorMessage = err.message;
    this.customMessage.showMessage({ severity: "error", summary: "error", detail: err.message });
  }

  /** close alert popup */
  public onAlertOkClick() {
    this.errorMessage = "";
  }
  /**
   * API call to get team list (no extra data in this api).
   * @param name Provide access_token
   */
  public getTeamListOnly() {
    return this.http.post(`${environment.api_url}/view_team_only`, { access_token: this.loginData.access_token })
      .map(this.tookanResponse)
  }
  public getToken(id) {
    return this.http.post(`${environment.api_url}/user/getAccessToken`, { user_id: JSON.stringify(id) })
      .map(this.tookanResponse)
  }
  get_image_format(file)
  {
    return this.http.post(`${environment.api_url}/upload_ref_images`, { user_id: JSON.stringify(this.loginData.user_id),access_token:this.loginData.access_token,ref_image:file })
      .map(this.tookanResponse) 
  }
  public loginViaAccessToken(access_token: string) {
    return this.http.post(`${environment.api_url}/user_login_via_access_token`, { access_token: access_token })
      .map(this.tookanResponse)
  }
  /**
   * Retrieve a cookie form cookies.
   * @param name Provide cookie name to to be retrieved from cookies
   */
  public getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }

  /** hide body scroller */
  public hideBodyScroll() {
    document.getElementsByTagName('body')[0].style.overflow = 'hidden';
  }

  /** show body scroller */
  public showBodyScroll() {
    document.getElementsByTagName('body')[0].style.overflow = 'auto';
  }
  /**set document title */
  public setTitle() {
    if (this.pageSettings.favTitle) {
      this.titleService.setTitle(this.pageSettings.favTitle);
    } else {
      this.titleService.setTitle('Tookan');
    }
  }

  public setFavicon() {
    if (this.pageSettings.favicon) {
      const link = document.querySelector("link[rel*='icon']");
      link['href'] = this.pageSettings.favicon;
    } else {
      const link = document.querySelector("link[rel*='icon']");
      link['href'] = '../../../../../assets/images/favicon.png';
    }
  }

  /**
 * to fire all errors before submission
 * @param form FormGroup to be validated.
 */
  public validateAllFormFields(form: FormGroup) {
    let keys = Object.keys(form.controls);
    keys.forEach((field: any) => {
      const control = form.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
        control.markAsDirty({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
      else if (control instanceof FormArray) {
        (<FormArray>control).controls.forEach((element: FormGroup) => {
          this.validateAllFormFields(element);
        });
      }
    });
  }

  /**
  * Initial Api hit to get page settings dynamically
  * uses interface IPageSettings
 */
  public getIcons() {
    var hostname = window.location.hostname;
    let tookanText = ['app.tookanapp.com', 'dev.tookanapp.com', 'test.tookanapp.com', 'localhost'];
    if (!(tookanText.indexOf(hostname) >= 0)) {
      const url = 'https://' + hostname;
      this.getPageSettings(url).subscribe(
        response => {
          if (response.data.whitelabel && response.data.whitelabel.is_whitelabel_signups_enabled) {
            this.pageSettings.is_whitelabel_signups_enabled = response.data.whitelabel.is_whitelabel_signups_enabled;
          }
          if (response.data.brand_image) {
            this.pageSettings.brand_img_page = response.data.brand_image;
          }
          if (response.data.fav_icon) {
            this.pageSettings.favicon = response.data.fav_icon;
          }

          if (response.data.company_name && response.data.is_whitelabel) {
            this.pageSettings.favTitle = response.data.company_name;
          }
          if (response.data.whitelabel && response.data.whitelabel.color) {
            this.pageSettings.pre_login_color = response.data.whitelabel.color ? response.data.whitelabel.color : '#2980B9';
          }
        });
    }
    this.setTitle();
    this.setFavicon();
  }

  /**
 * API call for page settings retrieval
 * @param url domain to get seetings for
 */
  public getPageSettings(url: string) {
    const body = {
      url: url
    }
    return this.http
      .post(`${environment.api_url}/getImagesFromUrl`, body)
      .map(this.tookanResponse);
  }

  public emitDataToParentWindow(state_name: string, obj?: any, type: string = "updateState") {
    window.parent.postMessage({ li: 'parent', state_name: state_name, obj: obj || {}, type }, this.parentOrigin)
  }
  /**
   * set infotext for tables.
   * @param event of type {rows:number, first:number}
   * @param allowedRows number of rows allowed per page
   * @param array list of items binded with p-table.
   *
   * ```
   * onPageChange({ rows: 10, first: 0 },rows,list)
   * ```
   * @returns
   * string to be shown.
   * eg: Showing 1-3 of 9
   */
  public onPageChange(event, allowedRows: number, array: Array<any>): string {
    event.rows = +event.rows;
    event.first = +event.first;
    allowedRows = +allowedRows;
    let _of = ((event.rows > allowedRows ? allowedRows : event.rows) + event.first);
    return `Showing ${event.first + 1} - ${_of > array.length ? array.length : _of} of ${array.length} entries`;
  }
  /** Add dynamic content to the main header
   * @param template ng-template reference as TemplateRef to be dynamically placed in header
   * ```
   * ngAfterViewInit(){
   *  this.commonService.appendTemplateToHeader(this.tmp);
   * }
   *
   * ```
   *
   * to remove template from header use removeTemplateFromHeader
  */
  public appendTemplateToHeader(template: TemplateRef<any>, direction: string = 'right') {
    this.onTemplateAddEvent.emit({ template, direction });
  }

  /** Remove dynamically added content from the main header
   * ```
   * ngDestroy(){
   *  this.commonService.removeTemplateFromHeader();
   * }
   *
   * ```
  */
  public removeTemplateFromHeader() {
    this.onTemplateAddEvent.emit(null);
  }
  /**
   *
   * @param telInput reference of telinput control
   */
  public validPhoneNumber(telInput: any): ValidatorFn {

    return (c: FormControl): ValidationErrors | null => {
      return telInput.validatePhoneNumber();
    }
  };

  /**
   * show logout btn
   */
  public showLogoutBtn() {
    this.onLogoutBtnVisibilityChange.emit(true);
  }

  /**
   * hide logout btn
   */
  public hideLogoutBtn() {
    this.onLogoutBtnVisibilityChange.emit(false);
  }
  /**
   * modify date format
   */
  modifyDateTimeFormat() {
    switch (this.loginData.date_format) {
      case ('DD MMM YYYY'): {
        this.loginData.date_format_angular5 = 'dd MMM yyyy';
        break;
      }
      case ('MM/DD/YYYY'): {
        this.loginData.date_format_angular5 = 'MM/dd/yyyy';
        break;
      }
      case ('YYYY/MM/DD'): {
        this.loginData.date_format_angular5 = 'yyyy/MM/dd';
        break;
      }
    }
  }
}
