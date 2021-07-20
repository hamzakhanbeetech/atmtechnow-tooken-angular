import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, TemplateRef } from '@angular/core';
import { ConfirmationService } from '../../../jw-notifications/services/confirmation.service';
import { SettingsService } from '../../services/settings.service';
import { CommonService } from '../../../../services/common.service';
import { IAddTeamData, ITeamData } from '../../interfaces/interfaces';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { GaService } from '../../../../services/ga.service';
import { SlicePipe } from '@angular/common';
import { BatteryUsage } from '../../enums/enum';
import { Paginator } from 'primeng/paginator';
@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss', '../developers/developers.component.scss']
})
export class TeamsComponent implements OnInit {
  BatteryUsageEnum = BatteryUsage;
  @ViewChild('buttonTemplate') buttonTemp: TemplateRef<any>;
  @ViewChild('paginator') paginator: Paginator;
  private teamsSub: Subscription;
  public addTeamForm: FormGroup;
  public showAddTeamPopup: boolean;
  public teamList: Array<ITeamData> = [];
  public filteredTeams: Array<ITeamData> = [];
  public is_editing_team_id: number;
  public totalRecords: number;
  public is_editing_team: boolean;
  public team_popup_action_title: string;
  public itemsPerPage = 9;
  public currentPage = 1;


  constructor(private confirmationService: ConfirmationService, private settingsService: SettingsService,
    public commonService: CommonService, private customMessage: CustomMessageService, private formBuilder: FormBuilder,
    private gaService: GaService) { }

  ngOnInit() {
    window['teams'] = this;
    this.getAllTeams();
  }

  ngAfterViewInit() {
    this.commonService.appendTemplateToHeader(this.buttonTemp);
  }

  /**
   * get list of teams
   */
  getAllTeams() {
    this.gaService.emitEvent('v4_app_tookanapp_team', 'team_page_land_dashboard', 'team_page_land_dashboard');
    if (this.teamsSub)
      this.teamsSub.unsubscribe();

    this.teamsSub = this.settingsService.getAllTeams().subscribe(
      response => {
        this.teamList = Array.isArray(response.data) ? response.data : [];
        const default_team={...this.commonService.loginData.teams[0]};
        this.commonService.loginData.teams=[...this.teamList];
        this.commonService.loginData.teams.unshift(default_team);
        this.filteredTeams = this.teamList.slice(0, 9);
        this.totalRecords = this.teamList.length;
        this.paginate({ page: 0 })
        this.paginator.changePage(0);
      }, error => {
        this.teamList = [];
        this.commonService.handleError(error.error);
      });

  }
  /**
   * get next list of teams
   */
  paginate(event) {
    //event.page = Index of the new page
    this.filteredTeams = this.teamList.slice((event.page) * 9, (event.page + 1) * 9);
  }
  /**
   * open add team popup
   */
  showAddPopup() {
    this.is_editing_team = false;
    this.team_popup_action_title = 'Add Team';
    this.initAddTeamForm();
  }


  /**
  * Initialising add team form
  */
  initAddTeamForm() {
    this.showAddTeamPopup = true;
    this.addTeamForm = this.formBuilder.group({
      'team_name': ['', Validators.required],
      'battery_usage': [BatteryUsage.HIGH],
      'tags': [[]]
    });
  }

  addTeam() {
    this.gaService.emitEvent('v4_app_tookanapp_teams', 'add_team_from_dashboard', 'add_team_from_dashboard');
    if (!this.addTeamForm.valid) {
      return this.commonService.validateAllFormFields(this.addTeamForm);
    } else {
      const team_name = this.addTeamForm.controls.team_name.value.trim();
      const tags = this.addTeamForm.controls.tags.value || '';
      const battery_usage = this.addTeamForm.controls.battery_usage.value;


      let body: IAddTeamData = {
        team_name: team_name,
        tags: tags.toString(),
        battery_usage: battery_usage,
      }
      this.commonService.showLoader = true;
      if (!this.is_editing_team) {
        this.settingsService.addTeam(body).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.showAddTeamPopup = false;
            this.getAllTeams();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
            this.commonService.emitDataToParentWindow('', { team_id: response.data.team_id, team_name }, 'addTeam')
          }, error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error)
          });
      } else {
        body.team_id = this.is_editing_team_id
        this.settingsService.editTeam(body).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.showAddTeamPopup = false;
            this.getAllTeams();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
            this.commonService.emitDataToParentWindow('', { team_id: this.is_editing_team_id, team_name }, 'editTeam')
          }, error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error)
          });
      }

    }
  }

  onCancelClick() {
    this.showAddTeamPopup = false;
  }
  /**
   * click on a row of tile for edit a team
   * @param item team member to be edited
   */
  editTeamItem(item: ITeamData) {
    this.is_editing_team = true;
    this.is_editing_team_id = item.team_id;
    console.log(item)
    this.initAddTeamForm();
    this.addTeamForm.setValue({
      'team_name': item.team_name,
      'battery_usage': item.battery_usage,
      'tags': item.tags ? item.tags.split(',') : "",
    });
    this.team_popup_action_title = 'Edit Team';

  }
  /**
   * confirmation for delete team
   * @param item item to be deleted
   */
  deleteTeamItem(item: ITeamData) {
    this.gaService.emitEvent('v4_app_tookanapp_team', 'delete_team_from_teams', 'delete_team_from_teams');
    const id = item.team_id.toString();
    this.deleteTeam(id);
  }

  /**
   * confirm and delete selected Team
   * @param team_id team id
   */
  private deleteTeam(team_id: string) {
    this.confirmationService.confirm({
      header: "Confirm Delete",
      message: "Are you sure you want to delete this team?",
      accept: () => {
        //showLoader
        this.settingsService.deleteTeam(team_id)
          .subscribe(response => {
            //loaderhide
            this.getAllTeams();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
            this.commonService.emitDataToParentWindow('', { team_id }, 'deleteTeam')
          }, error => {
            this.commonService.handleError(error);
          })
      }
    })
  }

  /**
   * To enable action menu on click
   * @param event 
   */
  showActionMenu(event: Event) {
    const el: HTMLElement = event.target as HTMLElement;
    if (el.nextElementSibling.matches('.menu-list')) {
      el.nextElementSibling.setAttribute('display', 'block');
    }
  }
  ngOnDestroy() {
    this.commonService.removeTemplateFromHeader();
  }
}
