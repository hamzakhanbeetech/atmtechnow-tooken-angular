export interface IMerchantData {
    id: number,
    username: string,
    phone: string,
    email: string,
    company_address: string,
    is_active: number
}

export interface ICustomField {
    label: string,
    display_name: string,
    data_type: string,
    required: boolean,
    value: string,
    order: number,
    search_enable: boolean,
    allowed_values?: string[],
    language ?: string,
    on_signup ?: boolean
}

export interface IUploadDocField {
    label: string,
    display_name: string,
    data_type: string,
    required: boolean,
    value: string,
    order: number,
    search_enable: boolean,
    expiry_date: string
}

export interface IGeofenceData {
    region_name: string,
    region_description: string,
    region_data: string,
    region_id?: number
}

export interface IPhoneDirectory {
    phone: string,
    country_code: string
}

export interface IPermissionData {
  
  technician_skill: any,
  tech_skill: any,
  add_catalogue: any,
  is_merchant_addOn_active:any,
    add_task: number,
    view_task: number,
    add_team: number,
    view_team: number,
    add_region: number,
    view_region: number,
    add_agent: number,
    view_agent: number,
    view_fleet_avalibility: number,
    edit_fleet_avalibility: number,
    add_manager:number,
    edit_task:number,
    view_manager:number,
    add_video_links:number,
    add_custom_notifications : number
}

export interface IEditMerchantData extends IMerchantReqBody {
    company_address: string,
    company_name: string,
    company_registration_number:number,
    company_website:string,
    company_structure:number,
    company_price?:number,
    merchant_image:string
}
export interface IMerchantReqBody {
    name: string,
    first_name: string,
    last_name: string,
    password: string,
    email: string,
    time_zone: number,
    phone_directory: IPhoneDirectory,
    commission_percentage: number,
    custom_fields: ICustomField[],
    geofence: IGeofenceData,
    merchant_permission: IPermissionData
}

export interface IMerchantReport {
    address: string,
    completed_task: number,
    document: Array<IUploadDocField>,
    email: string,
    failed_task: number,
    first_name: string,
    last_name: string,
    merchant_id: number,
    merchant_rating: string
    total_agents: number,
    geofence: Array<IGeofenceData>
}

export interface IAgentData {
    email: string,
    fleet_id: number,
    phone: string,
    username: string,
    fleet_thumb_image: string;
}