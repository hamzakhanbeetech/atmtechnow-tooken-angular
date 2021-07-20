import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '../../../../../node_modules/@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CommonService } from '../../../services/common.service';

@Injectable()
export class AutocompleteService {

  constructor(private http: HttpClient, private commonService: CommonService) { }

  getLatLongFromPlaceId(placeId: string) {
    const req_body = {
      "placeId" :placeId
    };
    return this.http.post(environment.maps_api_url + '/maps/get_geocoding_data', req_body)
      .map(this.commonService.tookanResponse)
  }
}
