import { Injectable } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import 'rxjs/add/operator/map';



@Injectable()
export class JobsitesService {

  constructor(private http: HttpClient, private commonService: CommonService) { }

  getAllSites(data)
  {

 return this.http.get(`${environment.api_url}/operators_job_site_mappping?access_token=${this.commonService.loginData.access_token}&search_key=${data.search}&limit=${data.limit}&skip=${data.skip}`)
    .map(this.commonService.tookanResponse) 
      }
    }
