import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { styles } from '../../../../../assets/scripts/geofence';
import { GoogleMapDecoding } from '../../../../../utils/googlemap.decoding';
import { ITaskDetail } from '../../interfaces/interface';
import { constants } from '../../../../../constants/constants';
import { CommonService } from '../../../../services/common.service';
@Component({
  selector: 'app-route-popup',
  templateUrl: './route-popup.component.html',
  styleUrls: ['./route-popup.component.scss']
})
export class RoutePopupComponent implements OnInit {
  @Input('polylineInput') polylineData;
  @Input('tasksData') taskDetails: Array<ITaskDetail>;
  @ViewChild('geofenceMap') gmapElement;
  //map
  map: google.maps.Map;
  mapTheme;
  constructor(private commonService: CommonService) { }

  ngOnInit() {
    this.mapTheme = this.commonService.loginData.map_theme; //0-> white
    this.initializeMap();
  }
  /**
* Initialization of Map
* with certain properties
*/
  private initializeMap() {
    if(this.mapTheme) {
      var mapProp: google.maps.MapOptions = {
        center: new google.maps.LatLng(30.741482, 76.768066),
        zoom: 13,
        styles: <google.maps.MapTypeStyle[]>styles,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
    } else {
      var mapProp: google.maps.MapOptions = {
        center: new google.maps.LatLng(30.741482, 76.768066),
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
    }
   
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    this.setPolyline();
    this.drawJobMarkers();
  }

  setPolyline() {
    var decodedPoints = GoogleMapDecoding.decode(this.polylineData[0], 6);
    var newPolyline = new google.maps.Polyline({
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map: this.map,
      clickable: true,
      path: decodedPoints,
    });
    newPolyline.setMap(this.map);
    this.map.fitBounds(GoogleMapDecoding.bounds);
  }

  drawJobMarkers() {
    this.taskDetails.forEach((job, index) => {
      var icon = {
        url: constants.JobStatusIcon[job.job_type][job.job_status], // url
        scaledSize: new google.maps.Size(24, 36), // scaled size
        anchor: new google.maps.Point(12, 36) // anchor
    };
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(+job[constants.getJobKeyNameByJobType[job.job_type].lat], +job[constants.getJobKeyNameByJobType[job.job_type].lng]),
        icon: icon,
        clickable: true,
        map: this.map
      });

      var contentstring = '<div class="popup-contianer">' +
        '<div style="font-size: 13px;">' +
        '<div>#' + job.job_id + ' &nbsp;&nbsp;' +
        '<span style="font-size:13px;text-transform: uppercase;font-weight:bolder;">'+'<b>' + constants.JobStatus[job.job_status] +'</b>'+ '</span>' +
        '</div>' +
        '<div>' + job[constants.getJobKeyNameByJobType[job.job_type].address] + '</div>' +
        ' </div>' +
        ' </div>';
      var infowindow = new google.maps.InfoWindow({
        content: contentstring,
        maxWidth: 155
      });
      marker.setMap(this.map);
      marker.addListener('click', () => {
        infowindow.open(this.map, marker);
      });
    });
  }
}

