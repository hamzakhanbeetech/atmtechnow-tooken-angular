import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';
import 'rxjs/add/operator/map';
import { IAddManagerData, IAddTeamData, IBroadcastOption, IFleetSignupBody, IFields, IVendorSignup, IAddSkillData } from '../interfaces/interfaces';
import { WalletType } from '../enums/wallet.enum';

@Injectable()
export class SettingsService {

  constructor(private http: HttpClient, private commonService: CommonService) { }

  /*
  * generate new api key for user
  */
  generateApiKey() {
    const body = {
      access_token: this.commonService.loginData.access_token,
      user_id: this.commonService.loginData.user_id
    }
    return this.http.post(`${environment.api_url}/v2/generate_api_key`, body)
      .map(this.commonService.tookanResponse)
  }
  /*
  * get all api keys for user
  */
  getApiKeys() {
    const body = {
      access_token: this.commonService.loginData.access_token,
      user_id: this.commonService.loginData.user_id
    }
    return this.http.post(`${environment.api_url}/v2/view_user_api_key`, body)
      .map(this.commonService.tookanResponse)
  }






  deleteApiKey(api_key: string) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      user_id: this.commonService.loginData.user_id,
      api_key: api_key
    }
    return this.http.post(`${environment.api_url}/v2/delete_user_api_key`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * API call to get all developers
   */
  getAllDevelopers() {
    const body = {
      access_token: this.commonService.loginData.access_token
    }
    return this.http.post(`${environment.api_url}/developer/getDevelopers`, body)
      .map(this.commonService.tookanResponse)
  }



  getSparePartDetails() {
    const body = {
      access_token: this.commonService.loginData.access_token
    }
    return this.http.post(`${environment.api_url}/user/getSpareParts`, body)
      .map(this.commonService.tookanResponse)
  }

  addNewPart(data) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      spare_part_unique_id: data.spare_part_unique_id,
      spare_part_name: data.spare_part_name,
      spare_part_description: data.spare_part_description,
      spare_part_price: data.spare_part_price
    }
    return this.http.post(`${environment.api_url}/user/addSpareParts`, body)
      .map(this.commonService.tookanResponse)
  }

  editPart(data, id) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      spare_part_unique_id: data.spare_part_unique_id,
      spare_part_name: data.spare_part_name,
      spare_part_description: data.spare_part_description,
      spare_part_id: id,
      spare_part_price: data.spare_part_price

    }
    return this.http.post(`${environment.api_url}/user/editSpareParts`, body)
      .map(this.commonService.tookanResponse)
  }




  /**
   * API call to delete a developer
   * @param id developer id
   */
  deleteDeveloper(id: string) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      developer_id: id
    };
    return this.http.post(`${environment.api_url}/developer/removeDeveloper`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * API call to invite or add developer
   * with following details of user invited
   * @param email invitee email
   * @param fname invitee first name
   * @param lname invitee last name
   * @param username invitee username(fname + lname)
   * @param pwd password
   */
  inviteDeveloper(email: string, fname: string, lname: string, username: string, pwd: string) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      dev_email: email,
      dev_first_name: fname,
      dev_username: username,
      dev_password: pwd,
      dev_last_name: lname
    }
    return this.http.post(`${environment.api_url}/developer/inviteDeveloper`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * API call to get all managers
   */
  getAllManager() {
    const body = {
      access_token: this.commonService.loginData.access_token
    }
    return this.http.post(`${environment.api_url}/view_all_dispatcher`, body)
      .map(this.commonService.tookanResponse)
  }
  /**
   * API call for deleting a manager
   */
  deleteManager(id: string) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      dispatcher_id: id
    };
    return this.http.post(`${environment.api_url}/delete_dispatcher`, body)
      .map(this.commonService.tookanResponse)
  }
  /**
   * API call to invite/add manager
   */
  addManager(body: IAddManagerData) {
    let timeZone = new Date();
    body.timezone = timeZone.getTimezoneOffset();
    body.access_token = this.commonService.loginData.access_token;
    return this.http.post(`${environment.api_url}/add_dispatcher`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
    * API call to update/edit manager
    */
  editManager(body: IAddManagerData) {
    let timeZone = new Date();
    body.timezone = timeZone.getTimezoneOffset();
    body.access_token = this.commonService.loginData.access_token;
    return this.http.post(`${environment.api_url}/update_dispatcher`, body)
      .map(this.commonService.tookanResponse)
  }
  /**
 * API call to get all skills
 */
  getAllSkill() {
    // const body = {
    //   access_token: this.commonService.loginData.access_token
    // }
    return this.http.get(`${environment.api_url}/fleet/get_skill_set?access_token=` + this.commonService.loginData.access_token)
      .map(this.commonService.tookanResponse)
  }

  deleteSkill(id: string) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      id: id,
      is_deleted: 1
    };
    return this.http.post(`${environment.api_url}/fleet/edit_skill_set`, body)
      .map(this.commonService.tookanResponse)
  }
  /**
   * API call to invite/add skill;
   */
  addSkill(body: IAddSkillData) {
    body.access_token = this.commonService.loginData.access_token;
    return this.http.post(`${environment.api_url}/fleet/add_skill_set`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
    * API call to update/edit skill
    */
  editSkill(body: IAddSkillData) {
    body.access_token = this.commonService.loginData.access_token;
    return this.http.post(`${environment.api_url}/fleet/edit_skill_set`, body)
      .map(this.commonService.tookanResponse)
  }
  /**
   * Api cal to get all services
   */
  getAllServices() {
    return this.http.get(`${environment.api_url}/dashboard/getAddOnService?access_token=` + this.commonService.loginData.access_token)
      .map(this.commonService.tookanResponse)
  }

  /**
  * API call to invite/add service;
  */
  addService(body: any) {
    body.access_token = this.commonService.loginData.access_token;
    return this.http.post(`${environment.api_url}/dashboard/addAddOnService`, body)
      .map(this.commonService.tookanResponse)
  }
  getImageUrl(formData: FormData) {
    return this.http.post(`${environment.api_url}/upload_reference_images`, formData)
      .map(this.commonService.tookanResponse)
  }
  /**
    * API call to update/edit skill
    */
  editService(body: any) {
    body.access_token = this.commonService.loginData.access_token;
    return this.http.post(`${environment.api_url}/dashboard/editAddOnService`, body)
      .map(this.commonService.tookanResponse)
  }
  /**
   * API call for deleting a Skill
   */
  deleteService(id: string) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      id: id,
      is_deleted: 1
    };
    return this.http.post(`${environment.api_url}/dashboard/editAddOnService`, body)
      .map(this.commonService.tookanResponse)
  }

  //----------------Custom Notifications api start-------------

  /**
 * API call for getting all notifications
 */

  getAllNotifications() {
    return this.http.get(`${environment.api_url}/dashboard/getCustomNotification?access_token=` + this.commonService.loginData.access_token)
      .map(this.commonService.tookanResponse)
  }
  /**
  * API call for adding a notification
  */
  addNotification(body: any) {
    body.access_token = this.commonService.loginData.access_token;
    return this.http.post(`${environment.api_url}/dashboard/addCustomNotification`, body)
      .map(this.commonService.tookanResponse)
  }
  /**
  * API call for deleting a Notification
  */
  deleteNotification(id: string) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      notification_id: id,
      is_deleted: 1
    };
    return this.http.post(`${environment.api_url}/dashboard/editCustomNotification`, body)
      .map(this.commonService.tookanResponse)
  }

  editNotification(body: any) {
    body.access_token = this.commonService.loginData.access_token;
    return this.http.post(`${environment.api_url}/dashboard/editCustomNotification`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
    * API call for sending notification to customers.
    */
  sendNotificationtoCustomers(id: string) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      notification_id: id
    };
    return this.http.post(`${environment.api_url}/dashboard/sendCustomNotifications`, body)
      .map(this.commonService.tookanResponse)
  }

  //----------------Custom Notifications api ends here-------------





  //----------------Softwares api start-------------

  /**
 * API call for getting all notifications
 */

  getAllSoftwares() {
    return this.http.get(`${environment.api_url}/dashboard/getZipFile?access_token=` + this.commonService.loginData.access_token)
      .map(this.commonService.tookanResponse)
  }


  addSoftware(formData: FormData) {
    return this.http.post(`${environment.api_url}/dashboard/addZipFile`, formData)
      .map(this.commonService.tookanResponse)
  }

  inactiveSoftware(software_id: number, blockedStatus: number) {
    const data = {
      access_token: this.commonService.loginData.access_token,
      software_id,
      is_active: blockedStatus
    };
    return this.http.post(`${environment.api_url}/dashboard/inactiveZipFile`, data)
      .map(this.commonService.tookanResponse);

  }

  deleteSoftware(id: string) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      software_id: id
    };
    return this.http.post(`${environment.api_url}/dashboard/deleteZipFile`, body)
      .map(this.commonService.tookanResponse)
  }


  editSoftware(formData: FormData) {
    return this.http.post(`${environment.api_url}/dashboard/editZipFile`, formData)
      .map(this.commonService.tookanResponse)
  }
  //----------------Video Links api start-------------

  /**
 * API call for getting all videos
 */

  getAllVideos() {
    return this.http.get(`${environment.api_url}/dashboard/getVideoLink?access_token=` + this.commonService.loginData.access_token)
      .map(this.commonService.tookanResponse)
  }
  /**
  * API call for adding a notification
  */
  addVideo(body: any) {
    body.access_token = this.commonService.loginData.access_token;
    return this.http.post(`${environment.api_url}/dashboard/addVideoLink`, body)
      .map(this.commonService.tookanResponse)
  }
  editVideo(body: any) {
    body.access_token = this.commonService.loginData.access_token;
    return this.http.post(`${environment.api_url}/dashboard/editVideoLink`, body)
      .map(this.commonService.tookanResponse)
  }
  /**
 * API call for deleting a Notification
 */
  deleteVideo(body: any) {
    body.access_token = this.commonService.loginData.access_token;
    return this.http.post(`${environment.api_url}/dashboard/editVideoLink`, body)
      .map(this.commonService.tookanResponse)
  }




  changeUserAddon(add_on_id: number, activate_tag: boolean) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      user_id: this.commonService.loginData.user_id,
      add_on_id,
      activate_tag: +activate_tag
    }
    return this.http.post(`${environment.api_url}/change_user_addon`, body)
      .map(this.commonService.tookanResponse)
  }
  /**
   * API call to get all tookan forms
   */
  getFormList() {
    const body = {
      access_token: this.commonService.loginData.access_token,
      user_id: this.commonService.loginData.user_id
    };
    return this.http.post(`${environment.api_url}/get_form_settings_by_user`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * API call to get all teams
   */
  getAllTeams() {
    const body = {
      access_token: this.commonService.loginData.access_token
    }
    return this.http.post(`${environment.api_url}/view_team`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
    * API call to add team
    */
  addTeam(body: IAddTeamData) {
    body.access_token = this.commonService.loginData.access_token;
    return this.http.post(`${environment.api_url}/create_team`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
    * API call to update team
    */
  editTeam(body: IAddTeamData) {
    body.access_token = this.commonService.loginData.access_token;
    return this.http.post(`${environment.api_url}/update_team`, body)
      .map(this.commonService.tookanResponse)
  }

  requestWhiteListedEmail(email: string, sender: string) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      from_email: email,
      from_name: sender
    }
    return this.http.post(`${environment.api_url}/request_whitelisted_email`, body)
      .map(this.commonService.tookanResponse)
  }

  getWhitelistedEmailDetails() {
    const body = {
      access_token: this.commonService.loginData.access_token
    }
    return this.http.post(`${environment.api_url}/get_whitelisted_email_details`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
    * API call to delete team
    */
  deleteTeam(id: string) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      team_id: id
    };
    return this.http.post(`${environment.api_url}/delete_team`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * For submission of rights
   */
  submitUserRights(right_type: number, comments: string) {
    const body = {
      right_type: right_type,
      comments: comments,
      access_token: this.commonService.loginData.access_token
    };
    return this.http.post(`${environment.api_url}/submit_user_right`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * For check  pending dues of account to delete account
   */
  checkDeleteUserCard(password: string) {
    const body = {
      user_id: this.commonService.loginData.user_id,
      password: password,
      access_token: this.commonService.loginData.access_token
    };
    return this.http.post(`${environment.api_url}/check_delete_user_card`, body)
      .map(this.commonService.tookanResponse)
  }
  /**
   * For  delete account
   * @param password user's password
   */
  deleteUserCard(password: string) {
    const body = {
      user_id: this.commonService.loginData.user_id,
      password: password,
      access_token: this.commonService.loginData.access_token
    };
    return this.http.post(`${environment.api_url}/delete_user_card`, body)
      .map(this.commonService.tookanResponse)
  }
  /**
   * For change password of account
   */
  changePassword(old_password: string, new_password: string) {
    const body = {
      new_password: new_password,
      old_password: old_password,
      access_token: this.commonService.loginData.access_token
    };
    return this.http.post(`${environment.api_url}/users_change_password`, body)
      .map(this.commonService.tookanResponse)
  }
  /**
   * update user's profile data
   * @param formData formdata
   */
  updateProfile(formData: FormData) {
    return this.http.post(`${environment.api_url}/account_settings`, formData)
      .map(this.commonService.tookanResponse)
  }

  /*
   * API call to get all available view task fields
   */
  getAvailableTaskViewFields() {
    const body = {
      access_token: this.commonService.loginData.access_token,
      user_id: this.commonService.loginData.user_id,
      tile_type: 'agent'
    };
    return this.http.post(`${environment.api_url}/get_available_task_view_fields`, body)
      .map(this.commonService.tookanResponse)

  }

  /**
   * API call to get all task view fields
   */
  getTaskViewFields(label: string) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      user_id: this.commonService.loginData.user_id,
      layout_type: this.commonService.loginData.layout_type,
      tile_type: label
    };
    return this.http.post(`${environment.api_url}/get_task_view_fields`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * API call to get all layout template names
   */
  getAllLayoutTemplateNames() {
    const body = {
      access_token: this.commonService.loginData.access_token,
      layout_type: this.commonService.loginData.layout_type
    };
    return this.http.post(`${environment.api_url}/get_all_layout_template_names`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * API call for activate fleet signup
   */
  activateFleetSignup(body: IFleetSignupBody) {
    body.access_token = this.commonService.loginData.access_token;
    body.user_id = this.commonService.loginData.user_id;
    return this.http.post(`${environment.api_url}/activate_fleet_signup`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * API call for getting user layout fields for
   * initial setup
   */
  getUserLayoutFields(actionType: number, get_all_data?: number) {
    console.log('debug2')
    let body = {
      access_token: this.commonService.loginData.access_token,
      layout_type: this.commonService.loginData.layout_type,
      actionType: actionType
    };
    if (get_all_data) {
      body['get_all_data'] = 1;
    }
    return this.http.post(`${environment.api_url}/get_user_layout_fields`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * API call to update the user layout field
   */
  updateUserLayoutField(data: Array<IFields>, actionType: number) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      layout_type: this.commonService.loginData.layout_type,
      actionType: actionType,
      fields: data
    };
    return this.http.post(`${environment.api_url}/update_workflow`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
 * API call to update broadcast option
 */
  updateWorkflowOption(data: IBroadcastOption, actionType: number) {
    data.is_enabled = +data.is_enabled;
    const body = {
      access_token: this.commonService.loginData.access_token,
      layout_type: this.commonService.loginData.layout_type,
      actionType: actionType,
      fields: data
    };
    return this.http.post(`${environment.api_url}/update_workflow`, body)
      .map(this.commonService.tookanResponse)
  }
  /**
   * API call to view fleet signup addons
   */
  viewFleetSignupAddon() {
    const body = {
      access_token: this.commonService.loginData.access_token,
      layout_type: this.commonService.loginData.layout_type
    };
    return this.http.post(`${environment.api_url}/view_fleet_signup_addon`, body)
      .map(this.commonService.tookanResponse)
  }

  getReminderTime() {
    const body = {
      access_token: this.commonService.loginData.access_token,
    };
    return this.http.get(`${environment.api_url}/dashboard/getTaskNotificationReminder?access_token=` + this.commonService.loginData.access_token)
      .map(this.commonService.tookanResponse)
  }
  setReminderTime(data) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      notification_minutes: data.notification_minutes
    };
    return this.http.post(`${environment.api_url}/dashboard/editTaskNotificationReminder`, body)
      .map(this.commonService.tookanResponse)
  }

  setPrivacyLinks(pl, ndal, tcl, licence, certificate) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      fleet_privacy_policy_link: pl,
      fleet_nda_link: ndal,
      fleet_tnc_link: tcl,
      fleet_weapon_link: licence,
      fleet_training_certificate: certificate
    };
    return this.http.post(`${environment.api_url}/dashboard/editFleetAppLinks`, body)
      .map(this.commonService.tookanResponse)
  }
  /**
   * for payment of users due amount
   */
  payUserAmount() {
    const body = {
      access_token: this.commonService.loginData.access_token,
      user_id: this.commonService.loginData.user_id
    };
    return this.http.post(`${environment.api_url}/pay_user_amount`, body)
      .map(this.commonService.tookanResponse)
  }
  /**
   * API call to enable disable customer
   * teams
   * @param activeStatus (checked/unchecked status)
   */
  enableDisableCustomerTeam(activeStatus: boolean) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      activate_tag: +activeStatus
    };
    return this.http.post(`${environment.api_url}/enable_disable_customer_teams`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * Used to update the selected value
   * in preferences component
   * @param label describes the type for which
   * we need to update eg. distance_in , default_view
   * @param value respective value a/c label
   */
  updateAction(label: string, value: any) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      action_type: label,
      value: value
    };
    return this.http.post(`${environment.api_url}/update_action`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * to set the values for
   * green chips for the preview updated by user
   * @param fields
   */
  setTaskViewFields(fields: any) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      layout_type: this.commonService.loginData.layout_type,
      tile_type: 'agent',
      user_id: this.commonService.loginData.user_id,
      view_fields: fields
    };
    return this.http.post(`${environment.api_url}/set_task_view_fields`, body)
      .map(this.commonService.tookanResponse)
  }

  activateVendorSignup(data: IVendorSignup) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      user_id: this.commonService.loginData.user_id,
      signup_template_name: data.signup_template_name,
      auto_verify_signup: data.auto_verify_signup,
      signup_template_layout_type: data.signup_template_layout_type,
      vendor_signup_info: data.vendor_signup_info,
      is_editable: data.is_editable,
      action: 1
    };
    return this.http.post(`${environment.api_url}/activate_vendor_signup`, body)
      .map(this.commonService.tookanResponse)
  }

  viewVendorSignupAddon() {
    const body = {
      access_token: this.commonService.loginData.access_token,
      layout_type: this.commonService.loginData.layout_type
    };
    return this.http.post(`${environment.api_url}/view_vendor_sign_up_addon`, body)
      .map(this.commonService.tookanResponse)
  }

  changeUserAddOnDemand(activate_tag: boolean) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      user_id: this.commonService.loginData.user_id,
      activate_tag: +activate_tag
    };
    return this.http.post(`${environment.api_url}/activate_on_demand_add_on`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * To get list of all the agents
   * for which we want to fetch call history
   */
  getAllAgents() {
    const body = {
      access_token: this.commonService.loginData.access_token,
    };
    return this.http.post(`${environment.api_url}/get_available_fleets`, body)
      .map(this.commonService.tookanResponse)
  }


  getPaymentEarningData(startDate: string, endDate: string) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      start_date: startDate,
      end_date: endDate,
    };
    return this.http.post(`${environment.api_url}/dashboard/getTechnicianEarnings`, body)
      .map(this.commonService.tookanResponse)
  }
  exportEarning(data, val) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      start_date: data.start,
      end_date: data.end,
    };
    if (val) {
      return this.http.post(`${environment.api_url}/dashboard/exportTechnicianEarningReport`, body, { responseType: 'text' })
        .map(resp => resp)
    } else {
      return this.http.post(`${environment.api_url}/dashboard/exportCustomerDetails`, body, { responseType: 'text' })
        .map(resp => resp)
    }
  }
  getCustomerEarningData(startDate: string, endDate: string) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      start_date: startDate,
      end_date: endDate,
    };
    return this.http.post(`${environment.api_url}/dashboard/getCustomerDetails`, body)
      .map(this.commonService.tookanResponse)
  }


  getCompanyEarningData(startDate: string, endDate: string) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      start_date: startDate,
      end_date: endDate,
    };
    return this.http.post(`${environment.api_url}/dashboard/getCompanyDetails`, body)
      .map(this.commonService.tookanResponse)
  }
  exportCompanyEarning(data) {
    console.log(data, '?????')
    const body = {
      access_token: this.commonService.loginData.access_token,
      start_date: data.start,
      end_date: data.end,
    };
    return this.http.post(`${environment.api_url}/dashboard/exportCompanyDetails`, body, { responseType: 'text' })
      // .map(this.commonService.tookanResponse)
      .map(resp => resp)
  }

  /**
   * To get agent video call data
   * @param fleet_id 
   * @param startDate 
   * @param endDate 
   * @param offset 
   */
  getAgentCallHistoryData(fleet_id: number, startDate: string, endDate: string, offset: number) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      starting_date: startDate,
      ending_date: endDate,
      user_id: this.commonService.loginData.user_id,
      fleet_id: fleet_id,
      limit: 25,
      offset: offset
    };
    return this.http.post(`${environment.api_url}/view_call_history`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * To fetch video urls for
   * parcticular jobid
   * @param jobID 
   */
  fetchUrlForJobId(jobID: number) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      user_id: this.commonService.loginData.user_id,
      job_id: jobID,
    };
    return this.http.post(`${environment.api_url}/get_video_url`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * request otp api
   * @param smsText 
   */
  requestOtpMessage(smsText: string) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      sms_text: smsText
    };
    return this.http.post(`${environment.api_url}/configure_otp_add_on`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * Custom otp response for goven access token
   */
  otpMessage() {
    const body = {
      access_token: this.commonService.loginData.access_token,
    };
    return this.http.post(`${environment.api_url}/get_otp_add_on_settings`, body)
      .map(this.commonService.tookanResponse)
  }

  /**
   * To get agent waleet data
   * @param fleet_id 
   * @param startDate 
   * @param endDate 
   * @param offset 
   * @param limit 
   * @param isExport
   */
  getAgentWalletData(fleet_id: number, startDate: string, endDate: string, offset: number, limit: number, wallet_type: WalletType, isExport?: boolean) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      starting_date: startDate,
      ending_date: endDate,
      limit: limit,
      offset: offset,
      wallet_type,
      is_export: isExport ? 1 : undefined
    };
    if (fleet_id != -1) {
      body['fleet_id'] = fleet_id;
    }
    if (!isExport) {
      return this.http.post(`${environment.api_url}/fleet/wallet/read_transaction_history`, body)
        .map(this.commonService.tookanResponse)
    }
    else {
      return this.http.post(`${environment.api_url}/fleet/wallet/read_transaction_history`, body, { responseType: 'text' })
        .map(resp => resp)
    }
  }
  /**
 * API call to  add transaction
 * with following details of add transaction
 * @param fleet_id 
 * @param amount 
 * @param order_id 
 * @param transaction_type 
 * @param description 
 * @param remarks 
 */
  addTransaction(fleet_id: string, amount: number, order_id: string, transaction_type: string, description: string, remarks: string, wallet_type: WalletType) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      "fleet_id": fleet_id,
      "amount": amount,
      "transaction_type": transaction_type,
      wallet_type
    }
    if (order_id) {
      body['reference_id'] = order_id;
    }
    if (description) {
      body['description'] = description;
    }
    if (remarks) {
      body['remarks'] = remarks;
    }
    return this.http.post(`${environment.api_url}/fleet/wallet/create_transaction`, body)
      .map(this.commonService.tookanResponse)
  }
  /**
* API call to get contact data
*/
  getContactData() {
    return this.http.get(`${environment.api_url}/dashboard/get_contact_info?access_token=` + this.commonService.loginData.access_token)
      .map(this.commonService.tookanResponse)
  }
  /**
  * API call to update the user layout field
  */
  updateContactInfo(data) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      link: data.link,
      email: data.email,
      phone: data.phone,
      address1: data.address1,
      address2: data.address2,
    };
    return this.http.post(`${environment.api_url}/dashboard/set_contact_info`, body)
      .map(this.commonService.tookanResponse)
  }
  getCancellationPriceData() {
    return this.http.get(`${environment.api_url}/dashboard/getCancellationInfo?access_token=` + this.commonService.loginData.access_token)
      .map(this.commonService.tookanResponse)
  }
  updateCancellationInfo(data) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      cancellation_minutes: data.cancellation_minutes,
      cancellation_charge: data.cancellation_charge,
      no_access_fee: data.no_access_fee,
      access_fee_minutes: data.access_fee_minutes,
      extra_fee_minutes: data.access_fee_interval_minutes,
      extra_fee: data.access_fee_interval_price,
      diagnostic_fee: data.diagnostic_fee,
      base_fare: data.base_fare,
      distance_fare: data.distance_fare,
      time_fare: data.time_fare,
      diagnostic_time: data.diagnostic_time,
      no_access_wait_time_fare: data.no_access_wait_time_fare,
      no_access_wait_minutes: data.no_access_wait_minutes
    };
    return this.http.post(`${environment.api_url}/dashboard/setCancellationInfo`, body)
      .map(this.commonService.tookanResponse)
  }

  getAllCompanies() {
    return this.http.get(`${environment.api_url}/fleet/get_affiliated_program?access_token=` + this.commonService.loginData.access_token)
      .map(this.commonService.tookanResponse)
  }
  getAllDisputes(data) {
    var serverUrl;
    if (data.search) {
      serverUrl = `${environment.api_url}/get_all_vendor_disputes?access_token=${this.commonService.loginData.access_token}&search_key=${data.search}&limit=${data.limit}&skip=${data.skip}`;
    } else {
      serverUrl = `${environment.api_url}/get_all_vendor_disputes?access_token=${this.commonService.loginData.access_token}&limit=${data.limit}&skip=${data.skip}`;
    }
    return this.http.get(serverUrl)
      .map(this.commonService.tookanResponse)
  }
  changeDisputeStatus(rowData, status) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      id: rowData.id,
      is_vendor:rowData.vendor_id ? 1 :0,
      status: status
    }
    return this.http.post(`${environment.api_url}/vendor/updateVendorDisputeStatus`, body)
      .map(this.commonService.tookanResponse)
  }
  getAllTaxes(data) {
    return this.http.get(`${environment.api_url}/get_us_taxes?access_token=${this.commonService.loginData.access_token}&search_key=${data.search}&limit=${data.limit}&skip=${data.skip}`)
      .map(this.commonService.tookanResponse)
  }
  getEnterpriseListing(data) {
    let serverUrl;
    if(data.search){
      serverUrl=`${environment.api_url}/enterprise_free_tasks?access_token=${this.commonService.loginData.access_token}&limit=${data.limit}&search_key=${data.search}&skip=${data.skip}`;
    }
    else{
      serverUrl=`${environment.api_url}/enterprise_free_tasks?access_token=${this.commonService.loginData.access_token}&limit=${data.limit}&skip=${data.skip}`;
    }
    return this.http.get(serverUrl)
      .map(this.commonService.tookanResponse)
  }
  updateEnterpriseTasks(data) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      company_id: data.company_id, 
      free_tasks_count:data.free_tasks_count
    };
  return this.http.post(`${environment.api_url}/enterprise_free_tasks`, body)
    .map(this.commonService.tookanResponse)
  }

  addTax(data, mode, id?) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      state_name: data.state_name,
      abbreviation: data.abbr,
      tax: data.tax
    };
    if (!mode) {
      return this.http.post(`${environment.api_url}/add_us_taxes`, body)
        .map(this.commonService.tookanResponse)
    }
    else {
      body['id'] = id;
      return this.http.post(`${environment.api_url}/edit_us_taxes`, body)
        .map(this.commonService.tookanResponse)
    }

  }
  delete(id) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      id: id,
      is_deleted: 1
    };

    body['id'] = id;
    return this.http.post(`${environment.api_url}/edit_us_taxes`, body)
      .map(this.commonService.tookanResponse)
  }

  importErrorCodes(formData: FormData) {
    return this.http.post(`${environment.api_url}/dashboard/importErrorCodes`, formData)
      .map(this.commonService.tookanResponse)
  }

  importSpareParts(formData: FormData) {
    return this.http.post(`${environment.api_url}/dashboard/importSpareParts`, formData)
      .map(this.commonService.tookanResponse)
  }

  importTaxes(formData: FormData) {
    return this.http.post(`${environment.api_url}/dashboard/importUSTaxes`, formData)
      .map(this.commonService.tookanResponse)
  }
  exportErrorCodes() {
    const body = {
      access_token: this.commonService.loginData.access_token
    }
    return this.http.post(`${environment.api_url}/dashboard/exportErrorCodes`, body, { responseType: 'text' })
      .map(resp => resp)
  }

  exportSpareParts() {
    const body = {
      access_token: this.commonService.loginData.access_token
    }
    return this.http.post(`${environment.api_url}/user/downloadSampleSparePartCSV`, body, { responseType: 'text' })
      .map(resp => resp)
  }

  exportTaxes() {
    const body = {
      access_token: this.commonService.loginData.access_token
    }
    return this.http.post(`${environment.api_url}/user/downloadSampleTaxesCSV`, body, { responseType: 'text' })
      .map(resp => resp)
  }

  deletePart(data) {
    const body = {
      access_token: this.commonService.loginData.access_token,
      spare_part_id: data.spare_part_id
    };
    return this.http.post(`${environment.api_url}/user/deleteSpareParts`, body)
      .map(this.commonService.tookanResponse)
  }
  addMerchantCard(cardDetails,name){
    const body = {
      access_token: this.commonService.loginData.access_token,
      card_details:cardDetails,
      company_id:this.commonService.loginData.user_id,
      name:name
    };
    return this.http.post(`${environment.api_url}/enterprise_cards`, body)
      .map(this.commonService.tookanResponse)
  }
  getMerchantCards() {
    return this.http.get(`${environment.api_url}/enterprise_cards?access_token=${this.commonService.loginData.access_token}&company_id=${this.commonService.loginData.user_id}`)
      .map(this.commonService.tookanResponse)
  }
  deleteCard(){
    return this.http.delete(`${environment.api_url}/enterprise_cards?access_token=${this.commonService.loginData.access_token}&company_id=${this.commonService.loginData.user_id}`)
    .map(this.commonService.tookanResponse)
  
  }
}


