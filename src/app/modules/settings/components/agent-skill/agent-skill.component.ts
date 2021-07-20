import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, TemplateRef } from '@angular/core';
import { ConfirmationService } from '../../../jw-notifications/services/confirmation.service';
import { SettingsService } from '../../services/settings.service';
import { CommonService } from '../../../../services/common.service';
import { ISkillData, IAddSkillData } from '../../interfaces/interfaces';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { GaService } from '../../../../services/ga.service';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-agent-skill',
  templateUrl: './agent-skill.component.html',
  styleUrls: ['./agent-skill.component.scss', '../developers/developers.component.scss']
})
export class AgentSkillComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('dt') ptable: Table;
  @ViewChild('buttonTemplate') buttonTemp: TemplateRef<any>;

  private skillSub: Subscription;
  public addSkillForm: FormGroup;
  public showAddSkillPopup: boolean;
  public skillList: Array<ISkillData> = [];
  public totalRecords: number = 0;
  public rows: number = 25;
  public infotext: string;
  public is_editing_skill: boolean;
  public is_editing_skill_id: number;
  public skill_popup_action_title: string;
  public form_list: Array<any> = [];
  public columns = [
    { field: 'id', header: 'ID' },
    { field: 'name', header: 'Skill Name' },
    { field: 'creation_datetime', header: 'Added on' },
    { field: 'action', header: 'Actions' }
  ]

  constructor(private confirmationService: ConfirmationService, private settingsService: SettingsService,
    public commonService: CommonService, private customMessage: CustomMessageService, private formBuilder: FormBuilder,
    private gaService: GaService) { }

  ngOnInit() {
    this.getAllSkillList();
    window['agent-skill'] = this;
  }
  ngAfterViewInit() {
    this.commonService.appendTemplateToHeader(this.buttonTemp);
  }

    /**
  * initialize edit Skill form
  * @param item skill to be edited
  */
 private initEditSkillForm(item: ISkillData) {
   console.log(item);
  this.initAddSkillForm();
  this.addSkillForm.setValue({
    'skillname': item.name,
  });
  this.skill_popup_action_title = 'Edit Skill';
}



  /**
    * confirm & delete selected Skill
    * @param skill_id id of manager to be deleted
    */
   private deleteSkill(skill_id: string) {
    this.confirmationService.confirm({
      header: "Confirm Delete",
      message: "Are you sure you want to delete this Skill ?",
      accept: () => {
        //showLoader
        this.settingsService.deleteSkill(skill_id)
          .subscribe(response => {
            //loaderhide
            this.getAllSkillList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.handleError(error);
          })
      }
    })
  }

    //public methods
  /**
   * start get list of skills
   */
  getAllSkillList() {
    this.gaService.emitEvent('v4_app_tookanapp_manager', 'manager_page_land_dashboard', 'manager_page_land_dashboard');
    if (this.skillSub)
    this.skillSub.unsubscribe();

    this.skillSub = this.settingsService.getAllSkill().subscribe(
      response => {
        this.skillList = Array.isArray(response.data.skills) ? response.data.skills : [];
        this.totalRecords = this.skillList.length;
        this.onPageChange({ rows: +this.rows, first: 0 }, this.rows, this.skillList);
      }, error => {
        this.skillList = [];
        this.commonService.handleError(error);
      });

  }


  showAddPopup() {
    this.is_editing_skill = false;
    this.initAddSkillForm();
  }

  /**
   * Initialising add skill form
   */
  initAddSkillForm() {
    this.showAddSkillPopup = true;
    this.skill_popup_action_title = 'Add Skill';
    this.addSkillForm = this.formBuilder.group({
      'skillname': ['', Validators.required],
    });
  }



   //api call for add skill
   addSkill() {
    this.gaService.emitEvent('v4_app_tookanapp_manager', 'add_manager_from_dashboard', 'add_manager_from_dashboard');
    if (!this.addSkillForm.valid) {
      return this.commonService.validateAllFormFields(this.addSkillForm);
    } else {
      let body: IAddSkillData = this.createAddSkillData();
      this.commonService.showLoader = true;
      if (!this.is_editing_skill) {
        this.settingsService.addSkill(body).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.showAddSkillPopup = false;
            this.getAllSkillList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error)
          });
      }else{
        body.id = this.is_editing_skill_id;
        this.settingsService.editSkill(body).subscribe(
          response => {
            this.commonService.showLoader = false;
            this.showAddSkillPopup = false;
            this.getAllSkillList();
            this.customMessage.showMessage({ severity: "success", summary: "success", detail: response.message });
          }, error => {
            this.commonService.showLoader = false;
            this.commonService.handleError(error)
          });
      }
    }
  }


    /**
   * create request body for add/edit skill
   * @returns IAddSkillData data
   */
  private createAddSkillData(): IAddSkillData {
    const skillname = this.addSkillForm.controls.skillname.value.trim();
    //permissions
    let body: IAddSkillData = {
      name: skillname
    };
    return body;
  }

   /**
   * on edit manager click 
   * @param item manager to be edited
   */
  editSkillItem(item: ISkillData) {
    this.is_editing_skill = true;
    this.is_editing_skill_id = item.id;
    this.initEditSkillForm(item);
  }



  /**
   * Function to enable action menu on click
   * @param event 
   */
  showActionMenu(event: Event) {
    const el: HTMLElement = event.target as HTMLElement;
    if (el.nextElementSibling.matches('.menu-list')) {
      el.nextElementSibling.setAttribute('display', 'block');
    }
  }


  onCancelClick() {
    this.showAddSkillPopup = false;
  }
    /**
     * confirmation for delete skill
     * @param item skill to be deleted
     */
    deleteSkillItem(item: ISkillData) {
      this.gaService.emitEvent('v4_app_tookanapp_skill', 'delete_skill_from_skill', 'delete_skill_from_skill');
      const id = item.id.toString();
      this.deleteSkill(id);
    }

  onFilterChange(event) {
    this.onPageChange({ rows: +this.rows, first: 0 }, this.rows, event.filteredValue);
  }

  onPageChange(event, allowedRows: number, array: Array<any>) {
    console.log(event, allowedRows, this.ptable.filteredValue || array,'????ss')
    this.infotext = this.commonService.onPageChange(event, allowedRows, this.ptable.filteredValue || array);
  }

  ngOnDestroy() {
    this.commonService.removeTemplateFromHeader();
  }
}

