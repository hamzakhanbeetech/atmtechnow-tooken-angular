import { Component, OnInit, ViewChild, ChangeDetectorRef, forwardRef, ElementRef, Output, EventEmitter, AfterViewInit, Input } from '@angular/core';
import { NgModel, NG_VALUE_ACCESSOR, ControlValueAccessor } from '../../../../../../node_modules/@angular/forms';
import { debounceTime, distinctUntilChanged, takeWhile } from 'rxjs/operators';
import { AutocompleteService } from '../../service/autocomplete.service';
const COUNTER_CONTROL_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AutocompleteComponent),
  multi: true
};
@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  providers: [COUNTER_CONTROL_ACCESSOR],
})
export class AutocompleteComponent implements OnInit, ControlValueAccessor {
  @Output('latLng') latLng: EventEmitter<google.maps.LatLng> = new EventEmitter<google.maps.LatLng>();
  @ViewChild('ctrl') ctrl: NgModel;
  @ViewChild('el') el: ElementRef;
  @Input('customPlaceholder') customPlaceholder: string;
  text: string;
  service: google.maps.places.AutocompleteService;
  alive: boolean = true;
  predictions: Array<google.maps.places.AutocompletePrediction> = [];

  //lat lng
  latitude: number;
  longitude: number;

  onModelChange: Function;
  onTouch: Function;

  constructor(private ref: ChangeDetectorRef, private autocompleteService: AutocompleteService) { }

  ngOnInit() {
    this.initialize();
    window['g'] = this;
  }

  onLocationSelect(prediction: google.maps.places.AutocompletePrediction) {
    this.el.nativeElement.value = prediction.description;
    // this.writeValue(prediction.description);
    this.onModelChange(this.el.nativeElement.value);
    // this.onTouch();
    this.predictions = [];
    this.ref.detectChanges();
    this.getLatlngByGeocoder(prediction.place_id);
  }

  writeValue(value: string): void {
    this.text = value;
  }
  registerOnChange(fn: any) {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: any) {
    this.onTouch = () => {
      fn();
    };
  }

  outsideClick() {
    this.predictions = [];
    this.onModelChange(this.el.nativeElement.value);
    this.ref.detectChanges();
  }

  private getLatlngByGeocoder(placeId: string) {
    //get saved latlong first
    this.autocompleteService.getLatLongFromPlaceId(placeId)
      .subscribe((response) => {
        const item = response.data[0];
        this.latitude = item.lat;
        this.longitude = item.lng;
        const latlng = new google.maps.LatLng(this.latitude, this.longitude);
        this.latLng.emit(latlng);
      }, error => {
        new google.maps.Geocoder().geocode({
          'placeId': placeId,
        }, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
          const item = results[0];
          this.latitude = item.geometry.location.lat();
          this.longitude = item.geometry.location.lng();
          const latlng = new google.maps.LatLng(this.latitude, this.longitude);
          this.latLng.emit(latlng);

        });
      })


  }

  /**
   * initialize autocomplete
   */
  private initialize() {
    this.service = new google.maps.places.AutocompleteService();
    this.ctrl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), takeWhile(() => this.alive))
      .subscribe(data => {
        if (data && this.ctrl.dirty)
          this.getPredictions(data);
        console.log('valueChanges')
        // this.onModelChange(this.text);
      })
  }

  /**
   * get predictions on ngModelChange
   * @param input input string
   */
  private getPredictions(input) {
    this.service.getPlacePredictions({ input: input },
      (result: google.maps.places.AutocompletePrediction[], status: google.maps.places.PlacesServiceStatus) => {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          this.predictions = result;
          console.log(result);
          this.ref.detectChanges();
        }
      });
    this.onModelChange(input);
  }


}
