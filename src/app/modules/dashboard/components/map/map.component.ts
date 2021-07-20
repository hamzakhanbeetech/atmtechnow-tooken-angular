import { Component, OnInit } from '@angular/core';
import { blackTheme } from '../../../../../assets/scripts/mapStyle';
import { } from 'googlemaps';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  styleArray = blackTheme;
  latitude: number = 51.678418;
  longitude: number = 7.809007;
  map: any;
  constructor() { }

  ngOnInit() {
  }

  mapReady(event: any) {
    this.map = event;
    this.map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(document.getElementById('Settings'));
  }

}
