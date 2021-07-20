export interface IResetPassword {
    email: string,
    password: string,
    token: string,
    type: string
}

export interface ISignup {
    name: string,
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    phone: string,
    country_phone_code: string,
    layout_type: number,
    step: number,
    timezone: number,
    domain: string,
    internal_user: number,
    source: string,
    medium: string,
    ipconfig: Object
}

export interface ISignupParams {
    email ?: string,
    phone ?: string,
    name ?: string,
    utm_source ?: string,
    utm_medium ?: string,
    refferal_id ?: string,
    l_source ?: string,
    tarsan ?: string,
    previous_page ?:string,
    is_redirect_to_marketplace ?: string,
    redirect_after_onboarding ?: string
    redirect ?: string
}

export interface ICookieItem {
    c_email : string,
    l_source: string,
    refer_id: string
}

export interface IPageSettings {
    pre_login_color: string,
    brand_img_page: string,
    favicon : string,
    favTitle: string,
    is_whitelabel_signups_enabled: boolean,
    is_ga_initialize: boolean,
    is_wht_lable: number
}

export interface IFavIcon {
    icon: string,
    title: string
}