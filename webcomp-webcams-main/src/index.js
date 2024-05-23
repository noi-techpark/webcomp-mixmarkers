// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import L from 'leaflet';
import leaflet_mrkcls from 'leaflet.markercluster';
import style__leaflet from 'leaflet/dist/leaflet.css';
import style__markercluster from 'leaflet.markercluster/dist/MarkerCluster.css';
import style from './scss/main.scss';
import style__autocomplete from './scss/autocomplete.css';
import { fetchWeatherForecast, fetchMunicipality, fetchInterestingPoints, fetchActivities, fetchGastronomy } from './api/ApiTourism.js';
import { fetchCreative, fetchParking } from './api/ApiMobility';
import { autocomplete } from './custom/autocomplete.js';
import config from "./api/config";

/*
* This OpendatahubWeatherForecast() class handles the recover and the visualization of the weather forecast, creative industries,
* points of interest, gastronomy, and parking.
* This class contains methods to call the APIs (Mobility & Tourism), elaborate the recived data, and update the map
* with the pertinent information.
*/
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

    // the Bind function avoid the possible lost of data
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
    this.setupButtonHandlers();
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
        this.removeMarkerFromMap();
        this.callForecastApiDrawMap();
      });
    } if (secondButton) {
      secondButton.addEventListener("click", () => {
        console.log('Second button clicked');
        this.removeMarkerFromMap();
        this.callIndustriesApiDrawMap();
      });
    } if (thirdButton) {
      thirdButton.addEventListener("click", () => {
        console.log('Third button clicked');
        this.removeMarkerFromMap();
        this.callInterestingPointsApiDrawMap();
      });
    } if (fourthButton) {
      fourthButton.addEventListener("click", () => {
        console.log('Fourth Button clicked');
        this.removeMarkerFromMap();
        this.callGastronomiesApiDrawMap();
      });
    } if (fifthButton) {
      fifthButton.addEventListener("click", () => {
        console.log('Fifth Button clicked');
        this.removeMarkerFromMap();
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
  }

  async callForecastApiDrawMap() {
    console.log('Forecast method has been called');

    await this.fetchWeatherForecast();
    await this.fetchMunicipality('Detail.it.Title,GpsPoints.position,IstatNumber');

    let columns_layer_array = [];

    this.municipalities.forEach(municipality => {
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

      if (result) {
        const forecastdaily = result.ForeCastDaily.slice(0, 3); // Prendi solo i primi 3 giorni
        let weatherforecastpic = '';

        forecastdaily.forEach(myforecast => {
          weatherforecastpic += `<div class="weather-forecast-item">
                                 <img class="weather-image" src="${myforecast['WeatherImgUrl']}">
                                 <div class="weather-text"><b>${myforecast['Date'].substring(0, 10)}<br>${myforecast['WeatherDesc']}</b></div>
                               </div>`;
        });

        const popupbody = `<div class="weather-forecast-container">${weatherforecastpic}</div>`;
        let popup = L.popup().setContent(popupbody);

        let marker = L.marker(pos, {
          icon: icon,
        }).bindPopup(popup);

        columns_layer_array.push(marker);
      }
    });

    this.generateALayerForTheMarkers(columns_layer_array);
  }


  async callIndustriesApiDrawMap() {    //CREATIVE INDUSTRY
    console.log('Industries method has been called');

    try {
      const industriesData = await this.fetchCreative('scoordinate,smetadata,sname');

      if (!industriesData || !industriesData.data) {
        console.error('No industries data found');
        return;
      }

      let arrayMarker = [];

      industriesData.data.forEach(creative => {

        if (creative["scoordinate"] && !isNaN(creative["scoordinate"].x) && !isNaN(creative["scoordinate"].y)) {
          const pos = [
            parseFloat(creative["scoordinate"].y),
            parseFloat(creative["scoordinate"].x)
          ];

          let icon = L.divIcon({
            html: '<div class="iconMarkerWebcam"></div>',
            iconSize: L.point(100, 100)
          });

          const popupbody = `<div class="webcampopuptext"><b>${creative["sname"]}</b><br><br>
                                    ${creative["smetadata"].address}<br><br>Website: <a href="${creative["smetadata"].website}" target="_blank">${creative["smetadata"].website}</a><br>
                                    Contact: ${creative["smetadata"].contacts}</div>`;

          let popup = L.popup().setContent(popupbody);

          let marker = L.marker(pos, {
            icon: icon,
          }).bindPopup(popup);

          arrayMarker.push(marker);
        } else {
          console.error('Invalid coordinates for creative:', creative);
        }
      });
      console.log('Num of created markers: ', arrayMarker.length);

      if (arrayMarker.length > 0) {
        this.generateALayerForTheMarkers(arrayMarker);
      } else {
        console.error('No valid markers to add to the map');
      }
    } catch (error) {
      console.error('Error in processing Industries data:', error);
    }
  }

  async callInterestingPointsApiDrawMap() {
    console.log('InterestPoints&Activity method has been called');

    try {
      // Combined fetchInterestingPoints and fetchActivities, so it executes both calls simultaneously
      const [interestingPointsData, activityData] = await Promise.all([
        this.fetchInterestingPoints('Detail.it,GpsInfo'),
        this.fetchActivities('Detail.it,GpsInfo')
      ]);

      if (!interestingPointsData || !interestingPointsData.Items || interestingPointsData.Items.length === 0) {
        console.error('No interesting Points found');
      }

      if (!activityData || !activityData.Items || activityData.Items.length === 0) {
        console.error('No activity found');
      }

      if ((!interestingPointsData || !interestingPointsData.Items || interestingPointsData.Items.length === 0) &&
        (!activityData || !activityData.Items || activityData.Items.length === 0)) {
        console.error('No Interesting Points or Activities found');
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

        let imageUrl = '';

        const popupbody = `<div class="webcampopuptext">
                          <b>${point["Detail.it"].Title}</b><br>
                          <img class="interest-point-image" src="${imageUrl}" alt="${point["Detail.it"].Title}">
                          <br>Altitude: ${point.GpsInfo[0].Altitude} ${point.GpsInfo[0].AltitudeUnitofMeasure}
                          <br>${point["Detail.it"].BaseText}
                        </div>`;
        let popup = L.popup().setContent(popupbody);

        let marker = L.marker(pos, {
          icon: icon,
        }).bindPopup(popup);

        arrayPoints.push(marker);
      });

      console.log('Num of created markers: ', arrayPoints.length);
      this.generateALayerForTheMarkers(arrayPoints);
    } catch (error) {
      console.error('Error in processing Interesting Points & Activity data:', error);
    }
  }


  async callGastronomiesApiDrawMap(){   // GASTRONOMY
    console.log('Gastronomy method has been called');

    try {
      const gastronomyData = await this.fetchGastronomy('Detail.it,GpsInfo,ContactInfos.it');

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
          let popupbody = `<div class="webcampopuptext"><b>${refreshmentPoint["Detail.it"].Title}</b><br>`;

          if (refreshmentPoint.GpsInfo[0].Altitude){
            if (refreshmentPoint.GpsInfo[0].Altitude !== 0) { // Se l'Altitudine è 0, non viene mostrata nel popup
              popupbody += `<br>Altitude: ${refreshmentPoint.GpsInfo[0].Altitude} ${refreshmentPoint.GpsInfo[0].AltitudeUnitofMeasure}`;
            }
          }

          if (refreshmentPoint["ContactInfos.it"].Url !== null) { // Verifica se l'URL non è null o undefined
            popupbody += `<br>Website: <a href="${refreshmentPoint["ContactInfos.it"].Url}" target="_blank">${refreshmentPoint["ContactInfos.it"].Url}</a>`;
          }

          popupbody += `</div>`;

          let popup = L.popup().setContent(popupbody);

          let marker = L.marker(pos, {
            icon: icon,
          }).bindPopup(popup);

          gastronomyArray.push(marker);
        } else {
          console.error('No Refreshment points found');
        }
      });
      console.log('Num of created markers: ', gastronomyArray.length);

      this.generateALayerForTheMarkers(gastronomyArray);
    } catch (e) {
      console.error('Error in porcessing gastronomy data:', e);
    }
  }

  /*
  callParkingDrawMap() recovers the parking's data using the fetchParking function,
  displays the markers on the map, with a popup containing the
  parking info: address and capacity's data.
  */
  async callParkingApiDrawMap() {   // PARKING SPACES
    console.log('Parking method has been called');

    try {
      //recovers parking's data
      const parkingData = await this.fetchParking('scoordinate, mvalue, smetadata');

      if (!parkingData || !parkingData.data) {
        console.error('No Gastronomy data found');
        return;
      }

      let parkingArray = [];

      //Iterates the parking data to create the markers
      parkingData.data.forEach(parked => {

        if (parked["scoordinate"] && !isNaN(parked["scoordinate"].x) && !isNaN(parked["scoordinate"].y)) {
          const pos = [
            parseFloat(parked["scoordinate"].y),
            parseFloat(parked["scoordinate"].x)
          ];

          let icon = L.divIcon({
            html: '<div class="iconMarkerWebcam"></div>',
            iconSize: L.point(100, 100)
          });

          //Defines the popup content
          const popupbody = `<div class="webcampopuptext"><b>${parked["smetadata"].standard_name}<br></b>
                                    Free Spots: <b>${parked["mvalue"]}</b> / ${parked["smetadata"].capacity}<br><br>
                                    ${parked["smetadata"].mainaddress}, ${parked["smetadata"].municipality}</div>`;
          let popup = L.popup().setContent(popupbody);

          let marker = L.marker(pos, {
            icon: icon,
          }).bindPopup(popup);

          parkingArray.push(marker);
        } else {
          console.error('Invalid coordinates for parking');
        }
      });
      console.log('Num of created markers: ', parkingArray.length);

      if (parkingArray.length > 0) {
        //calls the markers creator
        this.generateALayerForTheMarkers(parkingArray);
      } else {
        console.error('No valid markers to add to the map');
      }
    } catch (error) {
      console.error('Error processing parking data', error);
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

  //remove existing markers
  removeMarkerFromMap() {
    if (this.lcolumns) {
      this.map.removeLayer(this.lcolumns);
      this.lcolumns.clearLayers();
    }
    if (this.layer_columns) {
      this.map.removeLayer(this.layer_columns);
      this.layer_columns.clearLayers();
    }
    console.log('existing markers has been removed');
  }

  //Generates a layer on the map for the markers
  generateALayerForTheMarkers(arrayPoints) {
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
  }
}

customElements.define('webcomp-weatherforecast', OpendatahubWeatherForecast);
