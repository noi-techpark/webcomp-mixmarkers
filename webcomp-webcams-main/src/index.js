// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import L from 'leaflet';
import leaflet_mrkcls from 'leaflet.markercluster';
import style__leaflet from 'leaflet/dist/leaflet.css';
import style__markercluster from 'leaflet.markercluster/dist/MarkerCluster.css';
import style from './scss/main.scss';
import style__autocomplete from './scss/autocomplete.css';
import { fetchWeatherForecast, fetchMunicipality, fetchInterestingPoints, fetchActivities, fetchGastronomy } from './api/ApiTurism.js';
import { fetchCreative, fetchParking } from './api/ApiMobility';
import { autocomplete } from './custom/autocomplete.js';
import config from "./api/config";

class OpendatahubWeatherForecast extends HTMLElement {
  constructor() {
    super();

    this.map_center = [46.7728692, 10.7916716];
    this.map_zoom = 10;

    if (this.centermap != null) {
      var centerlatlong = this.centermap.split(',');
      this.map_center = [centerlatlong[0], centerlatlong[1]];
    }
    if (this.map_zoom != null) {
      this.map_zoom = this.zoommap;
    }

    this.map_layer = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    this.map_attribution = '<a target="_blank" href="https://opendatahub.com">OpenDataHub.com</a> | &copy; <a target="_blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a target="_blank" href="https://carto.com/attribution">CARTO</a>';

    this.fetchWeatherForecast = fetchWeatherForecast.bind(this);
    this.fetchMunicipality = fetchMunicipality.bind(this);
    this.autocomplete = autocomplete.bind(this);
    this.fetchCreative = fetchCreative.bind(this);
    this.fetchInterestingPoints = fetchInterestingPoints.bind(this);
    this.fetchActivities = fetchActivities.bind(this);
    this.fetchGastronomy = fetchGastronomy.bind(this);
    this.fetchParking = fetchParking.bind(this);

    this.shadow = this.attachShadow({ mode: "open" });

    // Bind functions to the current instance
    this.callForecastApiDrawMap = this.callForecastApiDrawMap.bind(this);
    this.callIndustriesApiDrawMap = this.callIndustriesApiDrawMap.bind(this);
    this.callInterestingPointsApiDrawMap = this.callInterestingPointsApiDrawMap.bind(this);
    this.callGastronomiesApiDrawMap = this.callGastronomiesApiDrawMap.bind(this);
    this.callParkingApiDrawMap = this.callParkingApiDrawMap.bind(this);
  }

  static get observedAttributes() {
    return ['centermap', 'zoom', 'source'];
  }

  attributeChangedCallback(propName, oldValue, newValue) {
    if (propName === "centermap" || propName === "zoommap" || propName === "source") {
      this.render();
    }
  }

  get centermap() {
    return this.getAttribute("centermap");
  }

  set centermap(newCentermap) {
    this.setAttribute("centermap", newCentermap);
  }

  get zoommap() {
    return this.getAttribute("zoommap");
  }

  set zoommap(newZoommap) {
    this.setAttribute("zoommap", newZoommap);
  }

  get source() {
    return this.getAttribute("source");
  }

  set source(newSource) {
    this.setAttribute("source", newSource);
  }

  connectedCallback() {
    this.render();
    this.initializeMap();
    this.setupButtonHandlers(); // Setup button handlers when component is added to the DOM
  }

  setupButtonHandlers() {
    const firstButton = document.getElementById("firstButton");
    const secondButton = document.getElementById("secondButton");
    const thirdButton = document.getElementById("thirdButton");
    const fourthButton = document.getElementById("fourthButton");
    const fifthButton = document.getElementById("fifthButton");

    if (firstButton) {
      firstButton.addEventListener("click", () => {
        console.log('First button clicked');
        this.callForecastApiDrawMap();
      });
    } if (secondButton) {
      secondButton.addEventListener("click", () => {
        console.log('Second button clicked');
        this.callIndustriesApiDrawMap();
      });
    } if (thirdButton) {
      thirdButton.addEventListener("click", () => {
        console.log('Third button clicked');
        this.callInterestingPointsApiDrawMap();
      });
    } if (fourthButton) {
      fourthButton.addEventListener("click", () => {
        console.log('Fourth Button clicked');
        this.callGastronomiesApiDrawMap();
      });
    } if (fifthButton) {
      fifthButton.addEventListener("click", () => {
        console.log('Fifth Button clicked');
        this.callParkingApiDrawMap();
      });
    }
  }

  async initializeMap() {
    let root = this.shadowRoot;
    let mapref = root.getElementById('map');

    this.map = L.map(mapref, {
      zoomControl: false
    }).setView(this.map_center, this.map_zoom);

    L.tileLayer(this.map_layer, {
      attribution: this.map_attribution
    }).addTo(this.map);

    console.log('Map initialized with center:', this.map_center, 'and zoom:', this.map_zoom);
  }


  async callForecastApiDrawMap() {
    if (this.lcolumns) {
      this.map.removeLayer(this.lcolumns);
    }
    console.log('Forecast method has been called');
    await this.fetchWeatherForecast();
    await this.fetchMunicipality('Detail.it.Title,GpsPoints.position,IstatNumber');

    let columns_layer_array = [];

    this.municipalities.map(municipality => {
      const pos = [
        municipality["GpsPoints.position"].Latitude,
        municipality["GpsPoints.position"].Longitude
      ];

      let icon = L.divIcon({
        html: '<div class="iconMarkerWebcam"></div>',
        iconSize: L.point(100, 100)
      });

      const myweatherforecast = this.weather;
      let result = myweatherforecast.find(o => o['MunicipalityIstatCode'] === municipality['IstatNumber']);

      const forecastdaily = result.ForeCastDaily;
      let weatherforecasttext = '';
      let weatherforecastpic = '';

      forecastdaily.forEach(myforecst => {
        weatherforecasttext += myforecst['Date'] + ": " + myforecst['WeatherDesc'] + ",";
        weatherforecastpic += '<img class="weather-image" src="' + myforecst['WeatherImgUrl'] + '">';
      });

      const popupbody = '<div class="webcampopup">' + weatherforecastpic + '</div><div class="webcampopuptext"><div><b>' + weatherforecasttext + '</b></div></div>';
      let popup = L.popup().setContent(popupbody);

      let marker = L.marker(pos, {
        icon: icon,
      }).bindPopup(popup);

      columns_layer_array.push(marker);
    });

    this.visibleStations = columns_layer_array.length;
    let columns_layer = L.layerGroup(columns_layer_array);

    this.layer_columns = new L.MarkerClusterGroup({
      showCoverageOnHover: false,
      chunkedLoading: true,
      iconCreateFunction: function (cluster) {
        return L.divIcon({
          html: '<div class="marker_cluster__marker">' + cluster.getChildCount() + '</div>',
          iconSize: L.point(100, 100)
        });
      }
    });

    this.layer_columns.addLayer(columns_layer);
    this.map.addLayer(this.layer_columns);
  }

  async callIndustriesApiDrawMap() {
    if (this.layer_columns) {
      this.map.removeLayer(this.layer_columns);
    }
    console.log('Industries method has been called');

    try {
      const industriesData = await this.fetchCreative('scoordinate,smetadata.email,sname,smetadata.address,smetadata.website');
      console.log('Industries data fetched:', industriesData);

      if (!industriesData || !industriesData.data) {
        console.error('No industries data found');
        return;
      }

      let arrayMarker = [];

      industriesData.data.forEach(creative => {
        console.log('Processing creative:', creative);

        if (creative["scoordinate"] && !isNaN(creative["scoordinate"].x) && !isNaN(creative["scoordinate"].y)) {
          const pos = [
            parseFloat(creative["scoordinate"].y),
            parseFloat(creative["scoordinate"].x)
          ];

          let icon = L.divIcon({
            html: '<div class="iconMarkerMap"></div>',
            iconSize: L.point(25, 25),
            className: 'iconMarkerMap'
          });

          const popupbody = '<div class="webcampopup">' + creative['sname'] + '</div>';
          let popup = L.popup().setContent(popupbody);

          let marker = L.marker(pos, {
            icon: icon,
          }).bindPopup(popup);

          arrayMarker.push(marker);
          console.log('Marker created at position:', pos);
        } else {
          console.error('Invalid coordinates for creative:', creative);
        }
      });

      console.log('Total markers created:', arrayMarker.length);

      if (arrayMarker.length > 0) {
        let clayer = L.layerGroup(arrayMarker);

        if (!this.lcolumns) {
          this.lcolumns = new L.MarkerClusterGroup({
            showCoverageOnHover: false,
            chunkedLoading: true,
            iconCreateFunction: function (cluster) {
              return L.divIcon({
                html: '<div class="marker_cluster__marker">' + cluster.getChildCount() + '</div>',
                iconSize: L.point(40, 40)
              });
            }
          });
        } else {
          this.lcolumns.clearLayers(); // it deletes the markers
        }

        this.lcolumns.addLayer(clayer);
        this.map.addLayer(this.lcolumns);

        console.log('Markers added to the map');
      } else {
        console.error('No valid markers to add to the map');
      }
    } catch (error) {
      console.error('Error fetching or processing industries data:', error);
    }
  }

  async callInterestingPointsApiDrawMap() {
    if (this.lcolumns) {
      this.map.removeLayer(this.lcolumns);
    }
    if (this.layer_columns) {
      this.map.removeLayer(this.layer_columns);
    }
    console.log('Points method has been called');

    try {
      //I combined fetchInterestingPoints and fetchActivities, so it executes both call simultaneously
      const [interestingPointsData, activityData] = await Promise.all([
        this.fetchInterestingPoints('Detail.it.Title,GpsInfo'),
        this.fetchActivities('Detail.it.Title,GpsInfo')
      ]);
      console.log('Points data fetched:', interestingPointsData);
      console.log('Activity data fetched:', activityData);

      if (!interestingPointsData || !interestingPointsData.Items || interestingPointsData.Items.length === 0) {
        console.error('No interesting Points data found');
      }

      if (!activityData || !activityData.Items || activityData.Items.length === 0) {
        console.error('No activity data found');
      }

      if ((!interestingPointsData || !interestingPointsData.Items || interestingPointsData.Items.length === 0) &&
        (!activityData || !activityData.Items || activityData.Items.length === 0)) {
        console.error('No interesting Points or activity data found');
        return;
      }

      let arrayPoints = [];

      const interestingPointsAndActivityData = [...interestingPointsData.Items, ...activityData.Items];

      interestingPointsAndActivityData.forEach(point => {
        const pos = [
          point.GpsInfo[0].Latitude,
          point.GpsInfo[0].Longitude
        ];

        let icon = L.divIcon({
          html: '<div class="iconMarkerWebcam"></div>',
          iconSize: L.point(100, 100)
        });

        const popupbody = `<div class="webcampopuptext"><b>${point["Detail.it.Title"]}</b><br>Altitude: ${point.GpsInfo[0].Altitude} ${point.GpsInfo[0].AltitudeUnitofMeasure}</div>`;
        let popup = L.popup().setContent(popupbody);

        let marker = L.marker(pos, {
          icon: icon,
        }).bindPopup(popup);

        arrayPoints.push(marker);
      });

      this.lcolumns = new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        chunkedLoading: true,
        iconCreateFunction: function (cluster) {
          return L.divIcon({
            html: '<div class="marker_cluster__marker">' + cluster.getChildCount() + '</div>',
            iconSize: L.point(100, 100)
          });
        }
      });

      this.lcolumns.addLayers(arrayPoints);
      this.map.addLayer(this.lcolumns);

      console.log('Markers added to the map');
    } catch (error) {
      console.error('Error fetching or processing interesting Points data:', error);
    }
  }

  async callGastronomiesApiDrawMap(){
    if (this.lcolumns) {
      this.map.removeLayer(this.lcolumns);
    }
    if (this.layer_columns) {
      this.map.removeLayer(this.layer_columns);
    }
    console.log('Gastronomy method has been called');

    try {
      const gastronomyData = await this.fetchGastronomy('Detail.it.Title,GpsInfo');
      console.log('Gastronomy data fetched:', gastronomyData);

      if (!gastronomyData || !gastronomyData.Items || gastronomyData.Items.length === 0) {
        console.error('No gastronomy data found');
        return;
      }

      let gastronomyArray = [];

      gastronomyData.Items.forEach(refreshmentPoint => {
        if (refreshmentPoint.GpsInfo && refreshmentPoint.GpsInfo.length > 0) {
          const pos = [
            refreshmentPoint.GpsInfo[0].Latitude,
            refreshmentPoint.GpsInfo[0].Longitude
          ];

          let icon = L.divIcon({
            html: '<div class="iconMarkerWebcam"></div>',
            iconSize: L.point(100, 100)
          });

          let popupbody = `<div class="webcampopuptext"><b>${refreshmentPoint["Detail.it.Title"]}</b><br>`;

          if (refreshmentPoint.GpsInfo[0].Altitude !== 0) { // if the Altitude is 0, it has not been shown in the popup
            popupbody += `Altitude: ${refreshmentPoint.GpsInfo[0].Altitude} ${refreshmentPoint.GpsInfo[0].AltitudeUnitofMeasure}`;
          }

          popupbody += `</div>`;

          let popup = L.popup().setContent(popupbody);

          let marker = L.marker(pos, {
            icon: icon,
          }).bindPopup(popup);

          gastronomyArray.push(marker);
        } else {
          console.error('No GpsInfo found for refreshment point:', refreshmentPoint);
        }
      });

      this.lcolumns = new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        chunkedLoading: true,
        iconCreateFunction: function (cluster) {
          return L.divIcon({
            html: '<div class="marker_cluster__marker">' + cluster.getChildCount() + '</div>',
            iconSize: L.point(100, 100)
          });
        }
      });

      this.lcolumns.addLayers(gastronomyArray);
      this.map.addLayer(this.lcolumns);
    } catch (e) {
      console.error('Error fetching gastronomy data:', e);
    }
  }


  async callParkingApiDrawMap() {
    if (this.layer_columns) {
      this.map.removeLayer(this.layer_columns);
    }
    console.log('Parking method has been called');

    try {

      const parkingData = await this.fetchParking('scoordinate, mvalue, smetadata');
      console.log('Parking data fetched:', parkingData);

      if (!parkingData || !parkingData.data) {
        console.error('No industries data found');
        return;
      }

      let parkingArray = [];

      parkingData.data.forEach(parked => {
        console.log('Processing creative:', parked);

        if (parked["scoordinate"] && !isNaN(parked["scoordinate"].x) && !isNaN(parked["scoordinate"].y)) {
          const pos = [
            parseFloat(parked["scoordinate"].y),
            parseFloat(parked["scoordinate"].x)
          ];

          let icon = L.divIcon({
            html: '<div class="iconMarkerMap"></div>',
            iconSize: L.point(25, 25),
            className: 'iconMarkerMap'
          });

          const popupbody = `<div class="webcampopuptext"><b>${parked["smetadata"].standard_name}<br></b>
                                    Free Spots: <b>${parked["mvalue"]}</b> / ${parked["smetadata"].capacity}<br><br>
                                    ${parked["smetadata"].mainaddress}, ${parked["smetadata"].municipality}</div>`;
          let popup = L.popup().setContent(popupbody);

          let marker = L.marker(pos, {
            icon: icon,
          }).bindPopup(popup);

          parkingArray.push(marker);
          console.log('Marker created at position:', pos);
        } else {
          console.error('Invalid coordinates for creative:', parked);
        }
      });

      console.log('Total markers created:', parkingArray.length);

      if (parkingArray.length > 0) {
        let clayer = L.layerGroup(parkingArray);

        if (!this.lcolumns) {
          this.lcolumns = new L.MarkerClusterGroup({
            showCoverageOnHover: false,
            chunkedLoading: true,
            iconCreateFunction: function (cluster) {
              return L.divIcon({
                html: '<div class="marker_cluster__marker">' + cluster.getChildCount() + '</div>',
                iconSize: L.point(40, 40)
              });
            }
          });
        } else {
          this.lcolumns.clearLayers(); // it deletes the markers
        }

        this.lcolumns.addLayer(clayer);
        this.map.addLayer(this.lcolumns);

        console.log('Markers added to the map');
      } else {
        console.error('No valid markers to add to the map');
      }
    } catch (error) {
      console.error('Error fetching or processing parking data:', error);
    }
  }


  render() {
    this.shadow.innerHTML = `
      <style>
        ${style__markercluster}
        ${style__leaflet}
        ${style__autocomplete}
        ${style}
      </style>
      <div id="webcomponents-map">
        <div class="autocomplete" style="width:300px;"><input id="searchInput" type="text" name="myMunicipality" placeholder="Municipality"></div>
        <input id="searchHidden" type="hidden">
        <div id="map" class="map"></div>
      </div>
    `;
  }
}

customElements.define('webcomp-weatherforecast', OpendatahubWeatherForecast);
