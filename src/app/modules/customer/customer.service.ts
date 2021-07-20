import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../services/common.service';
import { environment } from '../../../environments/environment';
import 'rxjs/add/operator/map';



@Injectable()
export class CustomerService {

  constructor(private http: HttpClient, private commonService: CommonService) { }


  getAllCompanies(){
    return this.http.get(`${environment.api_url}/fleet/get_affiliated_program?access_token=` + this.commonService.loginData.access_token)
    .map(this.commonService.tookanResponse)
  }
  getAllMerchants(data)
  {
    data.company_id=this.commonService.loginData.user_id

    if(data.sort_order==-1)
    {
      data.sort_order=0;
    }
    else
    {
      data.sort_order=1;
    }
    return this.http.get(`${environment.api_url}/merchant_customer/get?access_token=${this.commonService.loginData.access_token}&search_key=${data.sSearch}&limit=${data.limit}&skip=${data.skip}&sort_key=${data.sort_key}&sort_order=${data.sort_order}&user_id=${data.company_id}`)
    .map(this.commonService.tookanResponse) 
  }


  addCustomer(data,isEdit,merchat_customer_id)
  {
    const body = {
      access_token: this.commonService.loginData.access_token,
      first_name:data.first_name,
      last_name:data.last_name,
      customer_company_name:data.company_name,
      company_phone:data.company_phone_number,
      phone:data.phone_number,
      company_address:data.company_address,
      email:data.email,
      company:data.company,
      country_code:data.country_code,
      company_country_code:data.company_country_code,
      company_latitude:data.company_latitude,
      company_longitude:data.company_longitude,
      password:data.password,
      user_id:this.commonService.loginData.user_id

     

    }
    if(!isEdit)
    {
    return this.http.post(`${environment.api_url}/merchant_customer/add`, body)
      .map(this.commonService.tookanResponse)
    }
    else{
      body['merchat_customer_id']=merchat_customer_id;
      return this.http.post(`${environment.api_url}/merchant_customer/edit`, body)
      .map(this.commonService.tookanResponse)
    }
  }
  deleteCustomer(id)
  {
    const body = {
      access_token: this.commonService.loginData.access_token,
      merchat_customer_id:id

   
     

    }
    return this.http.post(`${environment.api_url}/merchant_customer/delete`, body)
      .map(this.commonService.tookanResponse)
  }

}
