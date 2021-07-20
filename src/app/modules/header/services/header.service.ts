import { Injectable } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable()
export class HeaderService {

  constructor(private http: HttpClient, private commonService: CommonService) { }

  /** get developer apps  */
  getApps() {
    const body = {
      access_token: this.commonService.loginData.access_token
    }
    return this.http.post(`${environment.api_url}/user/getApps`, body)
      .map(this.commonService.tookanResponse)
  }

  /** retrieve json file from the server */
  fetchJSON(url) {
    return this.http.get(url)
      .map(response => response)
  }

}
