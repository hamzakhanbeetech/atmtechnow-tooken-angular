import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';
import 'rxjs/add/operator/map';
import { IAssignFleet } from '../interfaces/interface';

@Injectable()
export class RoutesService {

  constructor(private http: HttpClient, private commonService: CommonService) { }
  /**
   * To fetch all routes data 
   */
  getRoutesForDate(date: string) {
    const body = {
      user_id: this.commonService.loginData.user_id,
      access_token: this.commonService.loginData.access_token,
      date: date
    };
    return this.http.post(`${environment.api_url}/get_routes_for_date`, body)
      .map(this.commonService.tookanResponse);
  }


  /**
   * To assign a route to a 
   * particular agent
   */

  assignFleetToRoute(date: string, assignFleetData: Array<IAssignFleet> , userId: string) {
    const body = {
      user_id: this.commonService.loginData.user_id,
      access_token: this.commonService.loginData.access_token,
      date: date,
      route_fleet_map: assignFleetData,
      route_user_id: userId
    }
    return this.http.post(`${environment.api_url}/assign_fleet_to_route`, body)
      .map(this.commonService.tookanResponse);
  }

  /**
   *   To fetch data regarding all 
   *   teams and there fleets
   */
  viewAllTeams() {
    const body = {
      access_token: this.commonService.loginData.access_token
    };
    return this.http.post(`${environment.api_url}/view_team`, body)
      .map(this.commonService.tookanResponse);
  }

  unassignFleetFromRoute(date: string, assignFleetData: Array<any> , userId: string) {
    const body = {
      user_id: this.commonService.loginData.user_id,
      access_token:this.commonService.loginData.access_token,
      date: date,
      route_fleet_map: assignFleetData,
      route_user_id: userId
    }
    return this.http.post(`${environment.api_url}/unassign_route`, body)
      .map(this.commonService.tookanResponse);
  }

  deleteRoute(routeId: number, date: string, fleetId: string , userId: string){
    const body = {
      user_id:this.commonService.loginData.user_id,
      access_token: this.commonService.loginData.access_token,
      date: date,
      route_id: routeId,
      route_user_id: userId
    };

    if(fleetId) {
      body['fleet_id'] = +fleetId;
    }
    return this.http.post(`${environment.api_url}/delete_route`, body)
    .map(this.commonService.tookanResponse);
  }

  fetchTaskDetails(taskArray: Array<string> , userId: string) {
    const body = {
      user_id:this.commonService.loginData.user_id,
      access_token: this.commonService.loginData.access_token,
      tasks: taskArray,
      route_user_id: userId
    };
    return this.http.post(`${environment.api_url}/get_task_details`, body)
    .map(this.commonService.tookanResponse);
  }
  
}
