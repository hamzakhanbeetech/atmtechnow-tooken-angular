import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';
import 'rxjs/add/operator/map';

@Injectable()
export class MerchantService {

  constructor(private http: HttpClient, private commonService: CommonService) { }
/**
 * To fetch all merchants data 
 * tooo: change access_token and user_id for all
 */
  viewMerchantData(sortOrder , sortKey ) {
    return this.http.get(`${environment.api_url}/merchant/view_merchant_with_pagination_filter?user_id=`+this.commonService.loginData.user_id+'&access_token='+this.commonService.loginData.access_token)
    .map(this.commonService.tookanResponse);
  }

  /**
   * For deleting a merchant
   * from table
   */
  deleteMerchant(merchnatID : number) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      merchant_id: merchnatID.toString()
    };
    return this.http.post(`${environment.api_url}/merchant/delete` , body)
    .map(this.commonService.tookanResponse);
  }

  /**
   * For adding a new merchant
   */
  addMerchant(data) {
    data['access_token']= this.commonService.loginData.access_token;
    data['user_id']=this.commonService.loginData.user_id;
    return this.http.post(`${environment.api_url}/merchant/sign_up` , data)
    .map(this.commonService.tookanResponse);

  }

  /**
   * For generating value url
   * for upload document
   */
  uploadMerchantDoc(data :FormData) {
    //this.commonService.loginData.access_token
    data.append('access_token', this.commonService.loginData.access_token );
    return this.http.post(`${environment.api_url}/merchant/upload_merchant_docs` , data)
    .map(this.commonService.tookanResponse);
  }

  /**
   * To request country code
   */
  requestCountryCode() {
    return this.http
    .get(`${environment.api_url3}/requestCountryCodeGeoIP2`)
    .map(this.commonService.tookanResponse);
  }

  /**
   * For editing a merchant
   * to fetch data for particular merchantID
   */
  getMerchantsData(merchantID: number) {
    
    return this.http.get(`${environment.api_url}/merchant/get_merchant_data?access_token=${this.commonService.loginData.access_token}&user_id=${merchantID}`)
    .map(this.commonService.tookanResponse);
  }

  /**
   * Edit merchant (updating the fields)
   * after editing
   */
  editMerchant(data) {
    data['access_token'] = this.commonService.loginData.access_token;
    data['user_id']= this.commonService.loginData.user_id;
    return this.http.post(`${environment.api_url}/merchant/edit_merchant` , data)
    .map(this.commonService.tookanResponse);
    
  }

  /**
   * To block/ unblock a merchant
   * @param merchant_id 
   * @param blockedStatus 
   */
  blockMerchant(merchant_id: number, blockedStatus: number) {
    const data = {
     access_token : this.commonService.loginData.access_token,
      merchant_id,
      is_blocked: blockedStatus
    };
    return this.http.post(`${environment.api_url}/merchant/block_merchant` , data)
    .map(this.commonService.tookanResponse);
    
  }

  /**
   * To fetch view details / report
   * of particular merchant
   */
  merchantReport(merchant_id: number) {
    return this.http.get(`${environment.api_url}/merchant/report?access_token=${this.commonService.loginData.access_token}&user_id=${this.commonService.loginData.user_id}&merchant_id=${merchant_id}`)
    .map(this.commonService.tookanResponse);
   }

   /**
    * To get all the agent list  
    * of particular merchant id
    */
   viewFleetDetails(merchant_id: number) {
    const data = {
      access_token : this.commonService.loginData.access_token,
      merchant_id,
     };
     return this.http.post(`${environment.api_url}/view_all_fleets` , data)
     .map(this.commonService.tookanResponse);
   }

}
