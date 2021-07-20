import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from '../../../../services/common.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RoutesService } from '../../services/routes.service';
import { IAssignFleet, ITeamsFleetsData, IFleetBody } from '../../interfaces/interface';

@Component({
  selector: 'app-assign-agent',
  templateUrl: './assign-agent.component.html',
  styleUrls: ['./assign-agent.component.scss']
})
export class AssignAgentComponent implements OnInit {
@Input('routeID') routeID: number;
@Output() assignObj: EventEmitter<Array<IAssignFleet>> = new EventEmitter();
  public assignAgentForm: FormGroup;
  public agentsList: Array<IFleetBody> = [];
  public teamList : Array<ITeamsFleetsData> = [];
  private routeMapData: Array<IAssignFleet> = [];
  constructor(public commonService: CommonService , private formBuilder: FormBuilder, private routesService: RoutesService) { }

  ngOnInit() {
    window['pop']=this;
    this.initAssignAgentForm();
    this.getAllTeamsFleetData();
    this.routeMapData = [];
  }

  initAssignAgentForm() {
    this.assignAgentForm = this.formBuilder.group({
      'team': [''],
      'fleet_id': ['']
    });
  }

  onAgentSelection() {
    this.routeMapData = [];
    var obj: IAssignFleet = {
      route_id: +this.routeID,
      team_id: +this.assignAgentForm.controls.team.value.team_id,
      fleet_id: this.assignAgentForm.controls.fleet_id.value.fleet_id
    };
    this.routeMapData.push(obj);
    this.assignObj.emit(this.routeMapData);
  }

  getAllTeamsFleetData() {
    this.routesService.viewAllTeams().subscribe(
      response => {
        this.teamList = response.data;
        this.agentsList = this.teamList[0].fleets;
        this.agentsList.sort(function(a, b){
          var alc = a['fleet_name'].toLowerCase(),
          blc = b['fleet_name'].toLowerCase();
          return alc > blc ? 1 : alc < blc ? -1 : 0;
          });
        if(response.data) {
          this.assignAgentForm.controls.team.setValue(this.teamList[0]);
        }
     
      },
      error => {
        console.log(error);
      }
    )
  }

  onTeamSelection() {
    let selectedTeam = this.assignAgentForm.controls.team.value.team_id;
    this.teamList.forEach((team) => {
      if(team.team_id == selectedTeam) {
        this.agentsList = team.fleets;
      }
    })
  }

}
