export interface IRouteData {
    user_id: number,
    route_id: string,
    fleet_id: string,
    layout_type: string,
    date: string,
    routed: Array<string>,
    polylines: Array<string>
}

export interface IAssignFleet {
    route_id:number,
    fleet_id:number,
    team_id: number
}

export interface IAgentList {
    fleet_id: number;
    username: string;
}

export interface ITeamsFleetsData {
    team_id: number;
    team_name: string;
    fleets: Array<IFleetBody>;
}
export interface IFleetBody {
    fleet_id: number;
    fleet_name: string
}

export interface ITaskDetail {
    customer_username: string,
    job_id: number,
    job_address: string,
    job_latitude: string,
    job_longitude: string,
    job_status: number,
    job_type: number,
    user_id: number
}