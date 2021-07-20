import { TemplateRef } from "@angular/core";
import { ITeamData } from "../modules/settings/interfaces/interfaces";

export interface ILoginData {
  access_token: string,
  add_catalogue:number;
  technician_skill:number;
  user_id: number,
  email: string,
  phone: string,
  call_dispatcher_as: string, //managerNamedAs
  call_fleet_as: string, //driverNamedAs,AgentNamedAs
  call_tasks_as: string,
  calendar_availability_status: number,
  vendor_form: number,
  vendor_signup: number,
  custom_business_app: number,
  business_app: number,
  is_dispatcher: number, //is manager
  billing_plan: number,
  billing_popup: IBillingPopup,
  reseller: IReseller,
  logo: string,
  country_phone_code: string,
  is_whitelabel: number,
  whitelisted_user_email: number,
  name: string,
  company_name: string,
  username: string,
  first_name: string,
  last_name: string,
  company_address: string,
  country: string,
  company_image: string,
  fleet_background_image:string,
  fugu_chat: number,//hippo activated or not
  layout_type: number, //workflow
  fleet_signup: number,
  teams: Array<ITeamsList>
  distance_in: string,
  default_view: number,
  language: string,
  tracking_language: string,
  customer_teams_setting: number,
  dispatcher_permissions: IDispatcherPermissions,
  is_video_enabled: number,//is open tok activated or not
  on_demand: number, //for add ons activate
  customer_otp_service: number //otp addon
  fleet_wallet: number //otp addon
  date_format: string, //date format for account
  date_format_angular5: string, //date format for angular 5 date pipe
  time_format: string, //time format for account
  is_merchant: number,
  merchant_add_on: number,
  block_agent_availability: number,
  has_routing: number,
  map_theme:number
  dispatcher_user_id:number /// admin user id in case of dispatcher
  dashboard_view: number,
  user_view: number,
  merchant_permissions: IMerchantPermissions,
  start_job_radius:number,
  fleet_job_image:any;
  redirect_url;

}
export interface IDispatcherPermissions {
  dispatcher_permission_id: number,
  dispatcher_id: number,
  user_id: number,
  view_driver: boolean,
  view_task: boolean,
  view_team: boolean,
  view_notification: boolean,
  create_driver: boolean,
  create_team: boolean,
  update_notification: boolean,
  create_task: boolean,
  edit_task: boolean,
  active_status: boolean,
  view_availability: boolean,
  edit_availability: boolean,
  view_auto_allocation: boolean,
  creation_datetime: Date,
  edit_fleet_wallet: number,
  teams: string,
  forms: string,
  add_video_links:boolean,
  add_custom_notifications:boolean
}
export interface IMerchantPermissions{
  add_agent: boolean
  add_manager: boolean
  add_region: boolean
  add_task: boolean
  add_team: boolean
  creation_date: string
  edit_fleet_avalibility: boolean
  edit_task: boolean
  merchant_id: number
  merchant_permission_id: number
  updation_date: string
  view_agent: boolean
  view_fleet_avalibility: boolean
  view_manager: boolean
  view_region: boolean
  view_task: boolean
  view_team: boolean,
  add_video_links:number,
  add_custom_notifications:any,
  add_software: boolean
}
export interface IBillingPopup {
  skip_link: number,
  show_billing_popup: number,
  days_left: string | number,
  tasks_left?: number,
}
export interface ITeamsList {
  team_id: number,
  team_name: string
}

export interface IReseller {
  company_name: string,
  email: string
}

export interface IAddTemplate {
  template: TemplateRef<any>,
  direction: string
}
