export interface IAddons {
  add_on_id: number,
  add_on_type: number,
  app_abilities: IAppAbilities,
  app_id: number,
  app_logo: string,
  app_url: string,
  config_url: string,
  description: string,
  fixed_cost: number,
  is_active: number,
  more_details: string,
  name: string,
  overview: Array<IOverview>,
  per_fleet_cost: number,
  per_task_cost: number,
  per_unit_cost: number,
  pricing_card: string,
  pricing_detail: string,
  type: number
}
export interface IAppAbilities {
  'side-menu'?: boolean,
  'sms-gateway'?: boolean,
  'topbar-menu'?: boolean
}
export interface IOverview {
  image_url: string,
  heading: string
}
export interface ISidebarApp {
  type: string,
  name: string,
  icon: string,
  functionalize: ISidebarAppFunctionalize
}
export interface ISidebarAppFunctionalize {
  internal_functionality: boolean,
  target: string,
  url: string
}