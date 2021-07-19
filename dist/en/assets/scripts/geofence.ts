export var styles = [
  {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "saturation": 36
          },
          {
              "color": "#939393"
          },
          {
              "lightness": 40
          }
      ]
  },
  {
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "color": "#0a0e12"
          },
          {
              "lightness": 16
          }
      ]
  },
  {
      "featureType": "all",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#000000"
          },
          {
              "lightness": 20
          }
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "color": "#000000"
          },
          {
              "lightness": 17
          },
          {
              "weight": 1.2
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [
          {
              "color": "#2d3339"
          },
          {
              "lightness": 0
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
          {
              "color": "#2d3339"
          },
          {
              "lightness": 0
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "all",
      "stylers": [
          {
              "hue": "#ff0000"
          },
          {
              "visibility": "simplified"
          },
          {
              "saturation": "-100"
          },
          {
              "lightness": "-67"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "lightness": "25"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "lightness": "-43"
          },
          {
              "saturation": "-14"
          },
          {
              "gamma": "1.01"
          },
          {
              "hue": "#ff0000"
          },
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
          {
              "lightness": "0"
          },
          {
              "color": "#141c24"
          },
          {
              "hue": "#a4ff00"
          },
          {
              "saturation": "-100"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "hue": "#ff0f00"
          },
          {
              "saturation": "4"
          },
          {
              "lightness": "-64"
          }
      ]
  },
  {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [
          {
              "lightness": "0"
          },
          {
              "color": "#141c24"
          },
          {
              "visibility": "simplified"
          },
          {
              "gamma": "0.94"
          },
          {
              "hue": "#ff0000"
          },
          {
              "saturation": "-100"
          }
      ]
  },
  {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [
          {
              "color": "#000000"
          },
          {
              "lightness": 19
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
          {
              "color": "#0a0e12"
          },
          {
              "lightness": 0
          }
      ]
  }
];

export const activePolygonOption = {
  editable: true,
  draggable: false,
  strokeColor: '#3468fa',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#3468fa',
  fillOpacity: 0.4,
}