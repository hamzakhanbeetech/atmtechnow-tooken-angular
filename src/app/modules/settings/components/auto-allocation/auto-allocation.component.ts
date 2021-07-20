import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonService } from '../../../../services/common.service';
import { FormGroup, FormBuilder, FormControl, FormArray, Validators } from '@angular/forms';
import { BroadcastType, WorkflowType } from '../../enums/enum';
import { SettingsService } from '../../services/settings.service';
import { IBroadcastOption, IPoolData, ITeamAutoAllocation, ITeamAllocationData, IClubbingData } from '../../interfaces/interfaces';
import { CustomMessageService } from '../../../../services/custom-message.service';
import { GaService } from '../../../../services/ga.service';
import { constants } from '../../../../../constants/constants';
import { CustomValidators } from '../../../../../utils/custom.validators';
import { ITeamsList } from '../../../../interfaces/interface';

@Component({
  selector: 'app-auto-allocation',
  templateUrl: './auto-allocation.component.html',
  styleUrls: ['./auto-allocation.component.scss', './../developers/developers.component.scss', './../agent-app/agent-app.component.scss']
})
export class AutoAllocationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('buttonTemplate') teamListDropdown: TemplateRef<any>;

  private selectedFormGroup: FormGroup;
  initialState: boolean;
  autoAssignEnabled: boolean;

  autoAssignBroadcastEnum = BroadcastType;
  workflowTypeEnum = WorkflowType

  selectedBroadcast: number;
  broadcastOneForm: FormGroup;
  broadcastTwoForm: FormGroup;
  broadcastThreeForm: FormGroup;
  broadcastFourForm: FormGroup;
  broadcastFiveForm: FormGroup;
  broadcastSixForm: FormGroup;
  poolFormResponse: IPoolData;
  clubbingFormResponse: IClubbingData;
  poolForm: FormGroup;
  clubbingForm: FormGroup;
  isPoolEnabled: Boolean;
  isClubbingEnabled: Boolean;
  broadcastOptResponse: IBroadcastOption = <IBroadcastOption>{};
  public temaList: any;
  public selectedTeam: ITeamsList;
  public autoAllocationTeamLevel: number
  public autoAllocationData: ITeamAutoAllocation;
  public dropdownIcon = 'fa fa-fw fa-caret-down';
  public dropdownUpIcon = 'fa fa-fw fa-caret-up';
  public dropdownDownIcon = 'fa fa-fw fa-caret-down';
  public enableActionAutoAssignment:Boolean = false;
  constructor(public commonService: CommonService, private formBuilder: FormBuilder,
    private settingsService: SettingsService, private customMessage: CustomMessageService,
    private gaService: GaService) { }

  ngOnInit() {
    window['aa'] = this;
    this.initializeTeamDropDown()
    this.getAllOptions();
  }


  ngAfterViewInit() {
    this.commonService.appendTemplateToHeader(this.teamListDropdown, 'left');
  }

  initClubbingForm() {
    this.clubbingForm = this.formBuilder.group({
      'delivery_distance':['' , [Validators.pattern(constants.numbersWithDecimalEmptyAllowed)]],
      'preparation_time':['' , [Validators.pattern(constants.onlyNumbersEmptyAllowed)]],
      'max_clubbed_orders':['', [Validators.pattern(constants.onlyNumbersEmptyAllowed)]]
    })
  }

  initPoolForm() {
    this.poolForm = this.formBuilder.group({
      'pool_threshold_radius': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'waiting_time_at_merchant': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'eta_at_pickup': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'sla': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'send_push_to_busy_driver_in_first_slot': [''],

    });
  }
  /**
   * intialize team dropdown 
   */
  initializeTeamDropDown() {
    this.temaList = [...this.commonService.loginData.teams];
    this.temaList.splice(0, 1);
    if (this.commonService.loginData.is_dispatcher) {
      this.selectedTeam = {
        team_id: this.temaList[0].team_id,
        team_name: this.temaList[0].team_name
      };
    } else {
      this.temaList.unshift({
        team_id: 0,
        team_name: "Default"
      });
      this.selectedTeam = {
        team_id: 0,
        team_name: "Default"
      };
    }


  }
  /**
   * @param response = data for auto allocation
   */
  setDataByTeamID(data) {
    data['broadcast_type'] = parseInt(data['broadcast_type']);
    data['is_enabled'] = +data['is_enabled'];
    data['offline_agents'] = Boolean(parseInt(data['offline_agents']));
    data['send_to_all_expires_in'] = parseInt(data['send_to_all_expires_in']) || 300;
    data['expires_in'] = parseInt(data['expires_in']) || 30;
    data['startingRadius'] = parseFloat(data['startingRadius']) || 5;
    data['incRadius'] = parseInt(data['incRadius']) || 1;
    data['radiusLimit'] = parseFloat(data['radiusLimit']) || 10;
    data['batchTime'] = parseInt(data['batchTime']) || 30;
    data['acceptTime'] = parseInt(data['acceptTime']) || 30;
    data['batchSize'] = parseInt(data['batchSize']) || 5;
    data['attemptLimit'] = parseInt(data['attemptLimit']) || 5;
    data['tasks'] = parseInt(data['tasks']) || 20;
    data['radius'] = parseInt(data['radius']) || 10;
    data['retryLimit'] = parseInt(data['retryLimit']) || 0;
    // if(response.data["0"]['auto_assign']['teams']){
    //   let keys = Object.keys(response.data["0"]['auto_assign']['teams']);
    //   keys.forEach((field: any) => {

    //   })
    // }

    if (data.pool_parameters) {
      this.poolFormResponse = data.pool_parameters;
    }

    if(data.clubbing_parameters) {
      this.clubbingFormResponse = data.clubbing_parameters;
      this.isClubbingEnabled = !!data.clubbing_parameters.clubbing_enable;
    } else {
      this.isClubbingEnabled = false;
    }

    this.isPoolEnabled = data.ride_type || 0;
    this.broadcastOptResponse = { ...data};
    this.initialState = !!this.broadcastOptResponse.is_enabled;
    // if(this.initialState) {
    this.autoAssignEnabled = this.initialState;
    this.selectedBroadcast = this.broadcastOptResponse.broadcast_type;
    this.setRadioAssign(this.selectedBroadcast, true);
  }
  /**
   * Function to get all details regarding broadcast option
   */
  getAllOptions() {
    const actionType = 3;
    const getAllData = 1;
    this.settingsService.getUserLayoutFields(actionType, getAllData).subscribe(
      response => {
        this.autoAllocationData = response.data["0"]['auto_assign'];
        if (response.data["0"]["fields"] && response.data["0"]["fields"]["app_optional_fields"]) {
          const app_optional_fields_data = response.data["0"]["fields"]["app_optional_fields"];
          for (var i = 0; i < app_optional_fields_data.length; i++) {
            if (app_optional_fields_data[i]['label'] == "team_level_auto_assignment") {
              this.autoAllocationTeamLevel = app_optional_fields_data[i]['value']
            }
          }
        }
        if (this.selectedTeam && this.selectedTeam.team_id && response.data["0"]["auto_assign"]["teams"] && response.data["0"]["auto_assign"]["teams"][this.selectedTeam.team_id]) {
          this.setDataByTeamID(response.data["0"]["auto_assign"]["teams"][this.selectedTeam.team_id])
        } else {
          this.setDataByTeamID(response.data["0"]["auto_assign"])
        }
        this.enableActionAutoAssignment = true;
        // }
      }, error => {
        this.isPoolEnabled = false;
        this.isClubbingEnabled = false;
      });


  }
  /**
   * change team from team dropdown
   * @param team_id :selected team
   */
  changeTeam(team_id) {
    if (!this.autoAllocationData.teams) {
      this.autoAllocationData.teams = <ITeamAllocationData>{};
    }
    if (this.autoAllocationData.teams && this.autoAllocationData['teams'][team_id]) {
      this.setDataByTeamID(this.autoAllocationData['teams'][team_id]);
    } else {
      var tempDataForNewTeam = { ...this.autoAllocationData };
      delete tempDataForNewTeam.teams;
      this.setDataByTeamID(tempDataForNewTeam);
    }
  }
  /**
   * to reset settings of auto allocation for selected team
   */
  resetDefaultSettings(resetForAll) {
    var tempDataForNewTeam = { ...this.autoAllocationData };
    delete tempDataForNewTeam.teams;
    if (resetForAll) {
      delete this.autoAllocationData.teams;
      //make_default_for_all
    } else {
      if (this.autoAllocationData.teams && this.autoAllocationData.teams[this.selectedTeam.team_id])
        delete this.autoAllocationData.teams[this.selectedTeam.team_id]
    }
    this.setDataByTeamID(tempDataForNewTeam);
    this.updateWorkflow(this.selectedFormGroup, this.selectedBroadcast, false, resetForAll, !resetForAll);

  }
  /**
   * Toggle button of auto-assign 
   * to enable or disable
   * broadcast options
   * @param event checkbox event trigger
   */
  setAutoAssign(event) {
    this.gaService.emitEvent('v3_app_tookanapp_auto_assign', 'auto_enable_auto_assign', 'auto_enable_auto_assign');
    if (event.target.checked) {
      this.autoAssignEnabled = true;
      if (!this.selectedBroadcast) {
        this.selectedBroadcast = 1;
        this.selectedFormGroup = this.broadcastOneForm;
        this.setRadioAssign(this.selectedBroadcast, true);
      }
      this.updateWorkflow(this.selectedFormGroup, this.selectedBroadcast, false);
      //this.getAllOptions()
    } else {
      this.autoAssignEnabled = false;
      this.updateWorkflow(this.selectedFormGroup, this.selectedBroadcast, false);
      //this.selectedBroadcast = 0;
    }
  }

  initBroadcastOneForm(customRetryLimit?: number) {
    const retryLimit = customRetryLimit > 8 ? customRetryLimit : 8;
    this.broadcastOneForm = this.formBuilder.group({
      'expires_in': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'retryLimit': ['', [Validators.required, Validators.pattern(constants.onlyNumbers), CustomValidators.maxValue(retryLimit, `We allow a maximum of ${retryLimit} retries,  please update the settings accordingly.`)]]
    });
  }

  initBroadcastTwoForm() {
    this.broadcastTwoForm = this.formBuilder.group({
      'send_to_all_expires_in': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]]
    });
  }

  initBroadcastThreeForm(customRetryLimit?: number) {
    const retryLimit = customRetryLimit > 8 ? customRetryLimit : 8;
    this.broadcastThreeForm = this.formBuilder.group({
      'retryLimit': ['', [Validators.required, Validators.pattern(constants.onlyNumbers), CustomValidators.maxValue(retryLimit, `We allow a maximum of ${retryLimit} retries,  please update the settings accordingly.`)]],
      'startingRadius': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal),
      CustomValidators.lessThan("radiusLimit", "Starting radius should be less than maximum radius"),
      CustomValidators.minValue(0.5, "Starting radius should be greater than 0.5")
      ]],
      'incRadius': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'radiusLimit': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal),
      CustomValidators.greaterThan("startingRadius", "Maximum radius should be greater than starting radius"),
      CustomValidators.minValue(0.6, "Maximum radius should be greater than 0.6")

      ]],
      'batchTime': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'acceptTime': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'batchSize': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'attemptLimit': ['', [Validators.required, Validators.pattern(constants.onlyNumbers), CustomValidators.maxValue(100, "We allow a maximum of 100 batches, so please update the settings accordingly")]]
    });
  }

  initBroadcastFourForm() {
    this.broadcastFourForm = this.formBuilder.group({
      'offline_agents': [false],
      'tasks': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'radius': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]]
    });
  }

  initBroadcastFiveForm() {
    this.broadcastFiveForm = this.formBuilder.group({
      'radius': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]]
    });
  }

  initBroadcastSixForm(customRetryLimit?: number) {
    const retryLimit = customRetryLimit > 8 ? customRetryLimit : 8;
    this.broadcastSixForm = this.formBuilder.group({
      'retryLimit': ['', [Validators.required, Validators.pattern(constants.onlyNumbers), CustomValidators.maxValue(retryLimit, `We allow a maximum of ${retryLimit} retries,  please update the settings accordingly.`)]],
      'startingRadius': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal),
      CustomValidators.lessThan("radiusLimit", "Starting radius should be less than maximum radius"),
      CustomValidators.minValue(0.5, "Starting radius should be greater than 0.5")
      ]],
      'incRadius': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'radiusLimit': ['', [Validators.required, Validators.pattern(constants.numbersWithDecimal),
      CustomValidators.greaterThan("startingRadius", "Maximum radius should be greater than starting radius"),
      CustomValidators.minValue(0.6, "Maximum radius should be greater than 0.6")

      ]],
      'batchTime': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'acceptTime': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'batchSize': ['', [Validators.required, Validators.pattern(constants.onlyNumbers)]],
      'attemptLimit': ['', [Validators.required, Validators.pattern(constants.onlyNumbers), CustomValidators.maxValue(100, "We allow a maximum of 100 batches, so please update the settings accordingly")]]
    });
  }

  /**
   * Updating the workflow on blur
   * @param fg selected form group
   * @param type selected broadcast type
   * @param makeDefaultForAll send params for reset settings for all team
   * @param makeDefaultForSelectedTeam send params for reset settings for selected Team
   */
  updateWorkflow(fg: FormGroup, type: number, fetchOptions: boolean, makeDefaultForAll?: boolean, makeDefaultForSelectedTeam?: boolean) {
    if (!fg.valid) {
      return this.commonService.validateAllFormFields(fg);
    }
    else {
      if (fg == this.poolForm) {
        if (!this.broadcastThreeForm.valid) {
          return this.commonService.validateAllFormFields(this.broadcastThreeForm);
        }
      }

      if(fg == this.clubbingForm) {
        if (!this.broadcastSixForm.valid) {
          return this.commonService.validateAllFormFields(this.broadcastSixForm);
        }
      }

      this.generateRequestBody(fg, type);
      this.broadcastOptResponse['offline_agents'] = +this.broadcastOptResponse['offline_agents'];
      this.broadcastOptResponse['broadcast_type'] = type;
      if (type !== this.autoAssignBroadcastEnum.BROADCAST_THREE || this.commonService.loginData.layout_type !== 0) {
        // delete(this.broadcastOptResponse['ride_type']);
        this.broadcastOptResponse['ride_type'] = 0

        delete (this.broadcastOptResponse['pool_parameters']);
      }

      if (type !== this.autoAssignBroadcastEnum.BROADCAST_FOUR) {
        this.broadcastOptResponse['offline_agents'] = 0; //set to default value
      }
      this.commonService.showLoader = true;
      if (this.selectedTeam.team_id == 0 && this.autoAllocationData.teams) {
        if (!this.broadcastOptResponse['ride_type']) {
          delete this.broadcastOptResponse['pool_parameters'];

        }
        this.broadcastOptResponse.teams = { ...this.autoAllocationData.teams };
      } else {
        var req_body = { ...this.autoAllocationData };
        if (!req_body.teams) {
          req_body.teams = {};
        }
        if (this.selectedTeam.team_id && !makeDefaultForSelectedTeam) {
          delete this.broadcastOptResponse.teams;
          if (!this.broadcastOptResponse['ride_type']) {
            delete this.broadcastOptResponse['pool_parameters'];
          }
          req_body.teams[this.selectedTeam.team_id.toString()] = <ITeamAutoAllocation>{ ...this.broadcastOptResponse, is_enabled: +this.broadcastOptResponse.is_enabled };
        }
        req_body['offline_agents'] = +req_body['offline_agents'];
        this.broadcastOptResponse = { ...req_body};
      }
      // if (makeDefaultForAll) {
      //   this.broadcastOptResponse.make_default_for_all = 1
      // }
      const actionType = 3;

      this.changeBoolToInt();


      this.settingsService.updateWorkflowOption(this.broadcastOptResponse, actionType).subscribe(
        response => {
          this.autoAllocationData = { ...this.broadcastOptResponse };
          // if (fetchOptions)
          this.getAllOptions();
          this.commonService.showLoader = false;
        },
        error => {
          this.getAllOptions();
          this.commonService.showLoader = false;
          this.customMessage.showMessage({ severity: "error", summary: "error", detail: error.message });
        });
    }
  }
  validateDeliveryDistance(e){
    var allowedKeyCode=[8,9,13,37,39,190]//
    if (allowedKeyCode.indexOf(e.keyCode)<0 &&(!/^(?:[0-9]+(?:\.[0-9]{0,1})?)?$/.test(this.clubbingForm.controls.delivery_distance.value)))
    {
      return false;
    }
  }
  changeBoolToInt() {
    this.broadcastOptResponse.is_enabled = +this.broadcastOptResponse.is_enabled;
    this.broadcastOptResponse.offline_agents = +this.broadcastOptResponse.offline_agents;
    Object.values(this.broadcastOptResponse.teams).forEach(item => {
      item.is_enabled = +item.is_enabled;
      item.offline_agents = +item.offline_agents;
    })
  }
  /**
   * Function to loop over form
   * to generate request body 
   * for update workflow api
   * @param fg selected broadcast form
   * @param type selected broadcast type
   */
  generateRequestBody(fg: FormGroup, type: number) {
    let keys = Object.keys(fg.controls);
    if (fg !== this.poolForm && fg !== this.clubbingForm) {
      keys.forEach((field: any) => {
        const control = fg.get(field);
        if (control instanceof FormControl) {
          if (field == 'retryLimit') {
            this.broadcastOptResponse[field] = +(control.value);
          }
          // else if (field == 'offline_agents1') {
          //   this.broadcastOptResponse[field] = (control.value) || this.broadcastOptResponse[field];
          // } 
          else if (field == 'offline_agents') {
            if (control && (+(control.value) == 0 || +(control.value))) {
              this.broadcastOptResponse[field] = +(control.value)
            } else
              this.broadcastOptResponse[field] = +(control.value) || +this.broadcastOptResponse[field] || 0;
          }
          else {
            // if(control && (+(control.value)==0 || +(control.value))){
            //   this.broadcastOptResponse[field] = +(control.value)
            // }else
            // this.broadcastOptResponse[field] = +(control.value) || this.broadcastOptResponse[field] || 0;
            this.broadcastOptResponse[field] = +(control.value) || +this.broadcastOptResponse[field] || 0;
          }

        }
      });
    } else if(fg == this.poolForm) {
      this.broadcastOptResponse['pool_parameters'] = {};
      if (this.poolForm.controls.pool_threshold_radius.value || this.poolForm.controls.pool_threshold_radius.value == 0) {
        this.broadcastOptResponse['pool_parameters'].pool_threshold_radius = (+this.poolForm.controls.pool_threshold_radius.value * 1000)
      } else {
        this.broadcastOptResponse['pool_parameters'].pool_threshold_radius = this.poolFormResponse.pool_threshold_radius
      }
      if (+this.poolForm.controls.waiting_time_at_merchant.value || +this.poolForm.controls.waiting_time_at_merchant.value == 0) {
        this.broadcastOptResponse['pool_parameters'].waiting_time_at_merchant = +this.poolForm.controls.waiting_time_at_merchant.value
      } else {
        this.broadcastOptResponse['pool_parameters'].waiting_time_at_merchant = this.poolFormResponse.waiting_time_at_merchant
      }
      if (+this.poolForm.controls.eta_at_pickup.value || +this.poolForm.controls.eta_at_pickup.value == 0) {
        this.broadcastOptResponse['pool_parameters'].eta_at_pickup = +this.poolForm.controls.eta_at_pickup.value
      } else {
        this.broadcastOptResponse['pool_parameters'].eta_at_pickup = this.poolFormResponse.eta_at_pickup
      }
      if (+this.poolForm.controls.sla.value || +this.poolForm.controls.sla.value == 0) {
        this.broadcastOptResponse['pool_parameters'].sla = +this.poolForm.controls.sla.value
      } else {
        this.broadcastOptResponse['pool_parameters'].sla = (this.poolFormResponse && this.poolFormResponse.sla ? this.poolFormResponse.sla : 0)
      }
      this.broadcastOptResponse['pool_parameters'].send_push_to_busy_driver_in_first_slot = +this.poolForm.controls.send_push_to_busy_driver_in_first_slot.value || 0
    } else {
      //clubbing form
      this.broadcastOptResponse['clubbing_parameters'] = {};
      if (this.clubbingForm.controls.delivery_distance.value || this.clubbingForm.controls.delivery_distance.value === 0) {
        console.log('in if')
        this.broadcastOptResponse['clubbing_parameters'].delivery_distance = ((+this.clubbingForm.controls.delivery_distance.value) * 1000)
      }else {
        delete this.broadcastOptResponse['clubbing_parameters'].delivery_distance;
      }
      //  else { 
      //   this.broadcastOptResponse['clubbing_parameters'].delivery_distance = this.clubbingFormResponse.delivery_distance
      // }
      if (this.clubbingForm.controls.preparation_time.value || this.clubbingForm.controls.preparation_time.value === 0) {
        this.broadcastOptResponse['clubbing_parameters'].preparation_time = +this.clubbingForm.controls.preparation_time.value
      }else{
        delete this.broadcastOptResponse['clubbing_parameters'].preparation_time
      }
      //  else {
      //   this.broadcastOptResponse['clubbing_parameters'].preparation_time = this.clubbingFormResponse.preparation_time
      // }
      if (this.clubbingForm.controls.max_clubbed_orders.value || this.clubbingForm.controls.max_clubbed_orders.value === 0) {
        this.broadcastOptResponse['clubbing_parameters'].max_clubbed_orders = +this.clubbingForm.controls.max_clubbed_orders.value
      } else{
        delete this.broadcastOptResponse['clubbing_parameters'].max_clubbed_orders;
      }
      // else {
      //   this.broadcastOptResponse['clubbing_parameters'].max_clubbed_orders = this.clubbingFormResponse.max_clubbed_orders
      // }
      if (this.isClubbingEnabled) {
        this.broadcastOptResponse['clubbing_parameters'].clubbing_enable = 1;
      } else {
        this.broadcastOptResponse['clubbing_parameters'].clubbing_enable = 0;
      }

    }

    this.broadcastOptResponse['is_enabled'] = +this.autoAssignEnabled;
    if (type == this.autoAssignBroadcastEnum.BROADCAST_THREE && this.commonService.loginData.layout_type == 0) {
      this.broadcastOptResponse['ride_type'] = +this.isPoolEnabled;
    }

    if(!this.isClubbingEnabled) {
      delete(this.broadcastOptResponse['clubbing_parameters']);
    }

  }

  /**
   * Initialization and setting values of 
   * selected broadcast option
   * of there respective controls
   * @param type gives the selected option value
   */
  setRadioAssign(type: BroadcastType, skipUpdateCall: boolean = false) {
    let broadcastOptResponse = { ...this.broadcastOptResponse };
    // Object.assign(broadcastOptResponse, this.broadcastOptResponse);
    switch (type) {
      case BroadcastType.BROADCAST_ONE: {
        this.initBroadcastOneForm(broadcastOptResponse.retryLimit);
        this.broadcastOneForm.setValue({
          'expires_in': broadcastOptResponse.expires_in,
          'retryLimit': broadcastOptResponse.retryLimit
        });
        this.selectedFormGroup = this.broadcastOneForm;
        if (!skipUpdateCall)
          this.updateWorkflow(this.broadcastOneForm, 1, false);
        this.gaService.emitEvent('v3_app_tookanapp_auto_assign', 'auto_one_by_one', 'auto_one_by_one');
        break;
      }


      case BroadcastType.BROADCAST_TWO: {
        this.initBroadcastTwoForm();
        this.broadcastTwoForm.setValue({
          'send_to_all_expires_in': broadcastOptResponse.send_to_all_expires_in
        });
        this.selectedFormGroup = this.broadcastTwoForm;
        if (!skipUpdateCall)
          this.updateWorkflow(this.broadcastTwoForm, 2, false);
        this.gaService.emitEvent('v3_app_tookanapp_auto_assign', 'auto_send_to_all', 'auto_send_to_all');
        break;
      }


      case BroadcastType.BROADCAST_THREE: {
        this.initBroadcastThreeForm(broadcastOptResponse.retryLimit);
        if (!this.poolForm)
          this.initPoolForm();
        this.broadcastThreeForm.setValue({
          'retryLimit': broadcastOptResponse.retryLimit,
          'startingRadius': broadcastOptResponse.startingRadius,
          'incRadius': broadcastOptResponse.incRadius,
          'radiusLimit': broadcastOptResponse.radiusLimit,
          'batchTime': broadcastOptResponse.batchTime,
          'acceptTime': broadcastOptResponse.acceptTime,
          'batchSize': broadcastOptResponse.batchSize,
          'attemptLimit': broadcastOptResponse.attemptLimit
        });

        this.poolForm.setValue({
          'pool_threshold_radius': this.poolFormResponse ? this.poolFormResponse.pool_threshold_radius / 1000 : '5',
          'waiting_time_at_merchant': this.poolFormResponse ? this.poolFormResponse.waiting_time_at_merchant : '2',
          'eta_at_pickup': this.poolFormResponse ? this.poolFormResponse.eta_at_pickup : '15',
          'sla': this.poolFormResponse ? this.poolFormResponse.sla : '0',
          'send_push_to_busy_driver_in_first_slot': this.poolFormResponse ? this.poolFormResponse.send_push_to_busy_driver_in_first_slot.toString() : '1',
        });
        if (this.isPoolEnabled) {
          this.enablePoolFields();
        } else {
          this.disablePoolFields();
        }
        this.selectedFormGroup = this.broadcastThreeForm;
        if (!skipUpdateCall) {
          this.updateWorkflow(this.broadcastThreeForm, 3, false);
          this.updateWorkflow(this.poolForm, 3, false);
        }



        this.gaService.emitEvent('v3_app_tookanapp_auto_assign', 'auto_batch_wise', 'auto_batch_wise');
        break;
      }

      case BroadcastType.BROADCAST_FOUR: {
        const actionType = 3;
        this.initBroadcastFourForm();
        this.broadcastFourForm.setValue({
          'offline_agents': !!broadcastOptResponse.offline_agents,
          'tasks': broadcastOptResponse.tasks,
          'radius': broadcastOptResponse.radius
        });


        this.selectedFormGroup = this.broadcastFourForm;

        if (!skipUpdateCall)
          this.updateWorkflow(this.broadcastFourForm, 4, false);
        this.gaService.emitEvent('v3_app_tookanapp_auto_assign', 'auto_round_robin', 'auto_round_robin');
        break;
      }

      case BroadcastType.BROADCAST_FIVE: {
        this.initBroadcastFiveForm();
        this.broadcastFiveForm.setValue({
          'radius': broadcastOptResponse.radius
        });
        this.selectedFormGroup = this.broadcastFiveForm;
        if (!skipUpdateCall)
          this.updateWorkflow(this.broadcastFiveForm, 5, false);
        this.gaService.emitEvent('v3_app_tookanapp_auto_assign', 'auto_nearest_available', 'auto_nearest_available');
        break;
      }

      case BroadcastType.BROADCAST_SIX: {
        this.initBroadcastSixForm(broadcastOptResponse.retryLimit);
        if(!this.clubbingForm)
        this.initClubbingForm();
        this.broadcastSixForm.setValue({
          'retryLimit': broadcastOptResponse.retryLimit,
          'startingRadius': broadcastOptResponse.startingRadius,
          'incRadius': broadcastOptResponse.incRadius,
          'radiusLimit': broadcastOptResponse.radiusLimit,
          'batchTime': broadcastOptResponse.batchTime,
          'acceptTime': broadcastOptResponse.acceptTime,
          'batchSize': broadcastOptResponse.batchSize,
          'attemptLimit': broadcastOptResponse.attemptLimit
        });


        this.clubbingForm.setValue({
          'delivery_distance': (this.clubbingFormResponse && (this.clubbingFormResponse.delivery_distance || this.clubbingFormResponse.delivery_distance===0))  ? this.clubbingFormResponse.delivery_distance / 1000 : '',
          'preparation_time': (this.clubbingFormResponse && (this.clubbingFormResponse.preparation_time|| this.clubbingFormResponse.preparation_time===0)) ? this.clubbingFormResponse.preparation_time : '',
          'max_clubbed_orders': (this.clubbingFormResponse && (this.clubbingFormResponse.max_clubbed_orders || this.clubbingFormResponse.max_clubbed_orders===0)) ? this.clubbingFormResponse.max_clubbed_orders : '',
        });
        if (this.isClubbingEnabled) {
          this.enableClubbingFields();
        } else {
          this.disableClubbingFields();
        }

        this.selectedFormGroup = this.broadcastSixForm;
        if (!skipUpdateCall) {
          this.updateWorkflow(this.broadcastSixForm, 6, false);
        }
        this.gaService.emitEvent('v3_app_tookanapp_auto_assign', 'auto_fifo_wise', 'auto_fifo_wise');
        break;
      }


    }
  }

  enablePool(event) {
    if (event.target.checked) {
      this.isPoolEnabled = true;
      this.enablePoolFields()
      this.updateWorkflow(this.poolForm, 3, false);

    } else {
      this.isPoolEnabled = false;
      this.updateWorkflow(this.poolForm, 3, false);
      this.disablePoolFields();
    }

  }


  disablePoolFields() {
    this.poolForm.disable();
  }

  enablePoolFields() {
    this.poolForm.enable();

  }

  //clubbing
  enableClubbing(event) {
    if (event.target.checked) {
      this.isClubbingEnabled = true;
      this.enableClubbingFields();
      this.updateWorkflow(this.clubbingForm, 6, false);

    } else {
      this.isClubbingEnabled = false;
      this.updateWorkflow(this.clubbingForm, 6, false);
      this.disableClubbingFields();
    }

  }

  enableClubbingFields() {
    this.clubbingForm.enable();
  }

  disableClubbingFields() {
    this.clubbingForm.disable();
  }



  ngOnDestroy() {
    this.commonService.removeTemplateFromHeader();
  }
}
