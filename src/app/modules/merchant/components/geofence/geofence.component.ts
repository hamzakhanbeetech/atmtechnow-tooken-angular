import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { styles, activePolygonOption } from '../../../../../assets/scripts/geofence';
import { CommonService } from '../../../../services/common.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '../../../../../../node_modules/@angular/forms';
import { IGeofenceData } from '../../interfaces/interface';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/operator/takeWhile";
import { Subscription } from '../../../../../../node_modules/rxjs/Subscription';
import { CustomMessageService } from '../../../../services/custom-message.service';

@Component({
  selector: 'app-geofence',
  templateUrl: './geofence.component.html',
  styleUrls: ['./geofence.component.scss']
})
export class GeofenceComponent implements OnInit, OnDestroy {
  @Input('data') geoFenceData: Array<IGeofenceData> = [];
  @Input('listMode') geoListMode: boolean;
  @Input() events: Observable<string>;
  @Output() onSave: EventEmitter<boolean> = new EventEmitter<boolean>();


  public mapSearchCtrl:FormControl;

  private subs: Subscription;

  private drawingManager: google.maps.drawing.DrawingManager = new google.maps.drawing.DrawingManager();
  private drawingManagerOptions = {
    drawingControl: false,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYGON,
      ],
    },
    polygonOptions: {
      editable: true,
      draggable: true,
      strokeWeight: 2,
      fillColor: '#F00',
      strokeColor: '#F00',
      fillOpacity: 0.3,
    },
    rectangleOptions: {
      draggable: true
    }
  };
  private addedPolygon: google.maps.Polygon;
  private mainPolygons: Array<google.maps.Polygon> = [];
  private disableDrawingOptions = {
    drawingControl: false,
    drawingControlOptions: {},
    polygonOptions: {
    },
    rectangleOptions: {
    }
  };

  @ViewChild('geofenceMap') set gmapElement(val) {
    if (val) {
      this._gmapElement = val;
      this.initializeMap();
      // if (this.merchantEditMode) {
      //   this.setGeofenceData()
      // }
    }
  };
  get gmapElement() {
    return this._gmapElement;
  }

  //map
  map: google.maps.Map;
  private bounds: google.maps.LatLngBounds = new google.maps.LatLngBounds();
  private _gmapElement;
  hideMapEditingOptions: boolean;

  //geofence form
  geofenceForm: FormGroup;

  constructor(public commonService: CommonService, private formBuilder: FormBuilder, private customMessage: CustomMessageService) { }

  ngOnInit() {
    this.initGeofenceForm();
    this.mapSearchCtrl = new FormControl();
    if(!this.geoListMode) {
      this.setGeofenceData();
      this.listenToParentEvents();
    } else {
      this.setPreviewData();
    }

    if(this.geoFenceData && this.geoFenceData.length == 0) {
      this.geoFenceData.push(<IGeofenceData>{});
    }
   
  }

  /**
   * To delete region drawn on map
   */
  deletePolygonMarkedRegion() {
    if (this.addedPolygon) {
      this.addedPolygon.setMap(null);
      this.hideMapEditingOptions = false;
    }
  }

  /**
   * To move /  drag map
   */
  stopMarkRegion() {
    // To hide:
    this.drawingManager.setOptions({
      drawingControl: false,
      polygonOptions: activePolygonOption
    });
    this.drawingManager.setDrawingMode(null);
    this.hideMapEditingOptions = false;
    this.addedPolygon.setMap(null);
  }

  /**
   * To start making polygon shape on map
   */
  startMarkRegion() {
    this.drawingManager = new google.maps.drawing.DrawingManager(this.drawingManagerOptions);
    console.log(this.drawingManager);
    this.drawingManager.setMap(this.map);
    this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);

    //listen to events
    google.maps.event.addListener(this.drawingManager, 'polygoncomplete', (polygon) => {
      console.log(polygon);
      this.updateShape(polygon, 'polygoncomplete');
      polygon.getPaths().forEach((path) => {
        console.log(path);
        google.maps.event.addListener(path, 'insert_at', () => {
          this.updateShape(polygon, 'insert_at');
        });

        google.maps.event.addListener(path, 'remove_at', () => {
          this.updateShape(polygon, 'remove_at');
        });

        google.maps.event.addListener(path, 'set_at', () => {
          this.updateShape(polygon, 'set_at');

        });

        google.maps.event.addListener(polygon, 'dragend', () => {
          this.updateShape(polygon, 'dragend');
        });
      });
    });


  }

  /**
   * To ypdate the coordinates of the shape being drawn
   * by listening to events triggered on map
   * @param polygon data fetched from drawing manager event listner
   * @param event name of event
   */
  private updateShape(polygon: google.maps.Polygon, event) {
    this.addedPolygon = polygon;
    if (event == 'polygoncomplete') {
      this.hideMapEditingOptions = true;
      this.drawingManager.setMap(null);
    }
    console.log('COOORDINATES' + this.saveFinalShape());
  }

  /**
   *  For getting the coordinates
   *  of the final shape saved
   */
  private saveFinalShape(): string[] {
    var path = this.addedPolygon.getPath();
    var polyCord = [];
    path.forEach(coords => {
      polyCord.push(`${coords.lat()} ${coords.lng()}`)
    });

    return polyCord;
  }


  /**
   * On save click of geofence popup , to save
   * the name desc and region
   */
  addGeofenceData() {
    if (!this.geofenceForm.valid) {
      return this.commonService.validateAllFormFields(this.geofenceForm);
    }
    if(!this.addedPolygon) {
      this.customMessage.showMessage({severity: "error", summary: "error", detail: 'Please add a region first.' });
      return;
    }
    this.geoFenceData[0].region_name = this.geofenceForm.controls.geoName.value;
    this.geoFenceData[0].region_description = this.geofenceForm.controls.geoDescription.value;
    if (this.addedPolygon) {
      let regionData = this.saveFinalShape();
      regionData.push(regionData[0]);
      this.geoFenceData[0].region_data = regionData.join(',');
    }
    this.onSave.emit(true);
  }

  /**
 * Initialization of Map
 * with certain properties
 */
  private initializeMap() {
    var mapProp: google.maps.MapOptions = {
      center: new google.maps.LatLng(30.741482, 76.768066),
      zoom: 13,
      styles: <google.maps.MapTypeStyle[]>styles
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
  }

  /**
  * Initialise geofence form
  */
  private initGeofenceForm() {
    this.geofenceForm = this.formBuilder.group({
      'geoName': ['', Validators.required],
      'geoDescription': ['', Validators.required]
    })
  }

  /**
  * Seperate function to set geofence data
  * when popup is opened 
  */
  private setGeofenceData() {
    //Geofence data set
    if (this.geoFenceData.length > 0 && Object.keys(this.geoFenceData[0]).length) {
      this.geofenceForm.setValue({
        'geoName': this.geoFenceData[0].region_name,
        'geoDescription': this.geoFenceData[0].region_description
      });
      this.constructPolygons(this.geoFenceData[0]);
      this.hideMapEditingOptions = true;
      // if (this.addedPolygon.getPath().getLength()) {
      // var regionCoords = this.saveFinalShape();
      // this.geoFenceData.region_data = regionCoords.join(',');

      // }
    }


  }

  /**
   * For setting geofence preview 
   */
  private setPreviewData() {
    if (this.geoFenceData.length > 0) {
      this.hideMapEditingOptions = true;
      this.geoFenceData.forEach((geoRegion) => {
        this.constructPolygons(geoRegion);  
      })
    }
  }

  /**
   * To construct polygons
   * accordin to region data
   * of geofence regions
   * @param data response from view_regions
   */
  private constructPolygons(data: IGeofenceData) {
    this.mainPolygons = [];
    //  this.initializeMap();
    // this.mapViewChild(this.mapOpts);
    if (data.region_data) {
      var newCoords = this.generateCoordinates(data.region_data);
      var createRegion = new google.maps.Polygon({
        paths: newCoords,
        strokeColor: '#3468fa',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3468fa',
        fillOpacity: 0.4,
        draggable: false
      });
      this.mainPolygons.push(createRegion);
      this.addedPolygon = this.mainPolygons[0];
      createRegion.setMap(this.map);
    }
    this.map.fitBounds(this.bounds);
  }


  /**
   * To transform the region_data of
   * geofence region into lat-lng 
   * manner for polygon creation
   * @param regionData region_data of geofence region
   */
  private generateCoordinates(regionData: string): google.maps.LatLng[] {
    let newCoords = [];
    this.bounds = new google.maps.LatLngBounds();
    regionData.split(',').forEach((str) => {
      const coords = str.trim().split(' ');
      const latLng = new google.maps.LatLng(+coords[0], +coords[1]);
      this.bounds.extend(latLng);
      newCoords.push(latLng);
    });
    return newCoords;
  }

  private listenToParentEvents() {
    this.subs = this.events.subscribe(data => {
      console.log('conter')
      switch (data) {
        case 'Save':
          this.addGeofenceData();
      }
    });
  }

    /**
   * on gecoding latlng event
   * @param latlng google.maps.LatLng object
   */
  public onLatLngEvent(latlng: google.maps.LatLng) {
    console.log(latlng.lat(), latlng.lng());
    this.map.setCenter(latlng);

  }

  ngOnDestroy() {
    if(this.subs) {
      this.subs.unsubscribe();
    }
    
  }
}
