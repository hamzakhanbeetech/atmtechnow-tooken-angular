export interface IApiKeys {
  api_key: string,
  creation_datetime: Date,
  key_type: number
}

export interface IDeveloperData {
  company_name: string,
  developer_id: number,
  email: string,
  first_name: string,
  is_active: number
  last_name: string
  phone: string
  user_id: number
}

export interface IPoolData {
  pool_threshold_radius: number,
  waiting_time_at_merchant: number,
  delivery_batching_multiplication_factor: 1,
  eta_at_pickup: number,
  sla: number,
  send_push_to_busy_driver_in_first_slot: boolean | number
}

export interface IBroadcastAutoAllocation {
  acceptTime: number,
  attemptLimit: number,
  batchSize: number,
  batchTime: number,
  broadcast_type: number
  expires_in: number,
  incRadius: number
  is_enabled: boolean | number,
  offline_agents: number,
  radius: number,
  radiusLimit: number,
  retryLimit: number,
  send_to_all_expires_in: number,
  startingRadius: number,
  tasks: number
}
export interface IBroadcastOption extends IBroadcastAutoAllocation {
  put_agent_busy: number,
  teams: ITeamAllocationData,
  make_default_for_all?: number
}

export interface IManagerData {
  company_name: string,
  dispatcher_id: number,
  email: string,
  first_name: string,
  is_active: number
  last_name: string
  phone: string
  user_id?: number,
  teams: Array<IManagerTeam>,
  teamNames: string, //self
  forms: Array<any>,
  view_task: number,
  create_driver: number,
  create_task: number,
  edit_task: number,
  fleet_schedule_permission?: number,
  allow_all_access?: boolean,
  view_status: number,
  edit_status: number,
  view_auto_allocation: number,
  edit_fleet_wallet: number,
  company_id?:number,
  add_custom_notifications:number,
  add_video_links:number
}

export interface IManagerTeam {
  team_id: number,
  team_name: string
  user_id: number
}
export interface IAddManagerData {
  access_token?: string,
  timezone?: number,
  dispatcher_id?: number,
  email: string,
  first_name: string,
  name: string,
  password: string,
  dispatcher_teams: any,
  dispatcher_forms: string,
  task_access: number,
  add_driver_access: number,
  can_create_task: number,
  can_edit_task: number,
  can_view: number,
  can_edit: number,
  view_auto_allocation: number,
  last_name: string,
  phone: string,
  edit_fleet_wallet: number,
  company_id:number,
  can_add_video_links:number,
  can_add_custom_notifications:number
}

export interface IAddTeamData {
  access_token?: string,
  team_name: string
  team_id?: number,
  battery_usage: number,
  tags: string[]
}

export interface ITeamData {
  team_name: string,
  team_id: number,
  battery_usage: number,
  fleets: Array<IFleets>,
  tags: string
}
export interface IFleets {
  fleet_id: number,
  fleet_name: string,
  fleet_thumb_image: string,
  fleet_image: string

}
export interface ISkillData{
  access_token?: string,
  id?:number,
  name:string 
}
export interface IAddSkillData{
  access_token?: string,
  id?:number,
  name:string,
}
export interface IFleetSignupBody extends IAcessTokenProperty, IUserIDProperty {
  action: number,
  auto_verify_signup: number,
  fleet_signup_info: string,
  is_tags_enabled: number,
  is_team_enabled: number,
  is_editable: number,
  signup_template_layout_type: number,
  signup_template_name: string
}

export interface IAcessTokenProperty {
  access_token?: string
}

export interface IUserIDProperty {
  user_id?: number
}

export interface IFields {
  label: string,
  value: number,
  required?: number
}

export interface IAgentFields {
  dummy: any,
  label: string,
  keyname: string,
  translate: string,
  custom_id?: number
}

export interface IVendorSignup {
  auto_verify_signup: number,
  vendor_signup_info: string,
  signup_template_layout_type: number,
  signup_template_name: string,
  is_editable: number
}

export interface ITeamAutoAllocation extends IBroadcastOption {
  teams: ITeamAllocationData;
}

export interface ITeamAllocationData {
  [key: string]: IBroadcastAutoAllocation
}

export interface IAgentData {
  username: string,
  fleet_id: number
}

export interface IVideoData {
  call_log_id: number,
  recorded_by: number,
  video_url: string
}

export interface IClubbingData {
  delivery_distance: number,
  preparation_time: number,
  clubbing_enable: number,
  max_clubbed_orders: number
}