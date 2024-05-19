import L from 'leaflet';
import leaflet_mrkcls from 'leaflet.markercluster';
import style__leaflet from 'leaflet/dist/leaflet.css';
import style__markercluster from 'leaflet.markercluster/dist/MarkerCluster.css';
import style from './scss/main.scss';
import style__autocomplete from './scss/autocomplete.css';
import { fetchWeatherForecast, fetchMunicipality } from './api/api.js';
import { fetchCreative } from './api/industries';
import { fetchInterestingPoints, fetchActivities } from "./api/interestingPoints";
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

    this.shadow = this.attachShadow({ mode: "open" });

    // Bind functions to the current instance
    this.callForecastApiDrawMap = this.callForecastApiDrawMap.bind(this);
    this.callIndustriesApiDrawMap = this.callIndustriesApiDrawMap.bind(this);
    this.callInterestingPointsApiDrawMap = this.callInterestingPointsApiDrawMap.bind(this);
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

    if (firstButton) {
      console.log('First button found');
      firstButton.addEventListener("click", () => {
        console.log('First button clicked');
        this.callForecastApiDrawMap();
      });
    } else {
      console.log('First button not found');
    }

    if (secondButton) {
      console.log('Second button found');
      secondButton.addEventListener("click", () => {
        console.log('Second button clicked');
        this.callIndustriesApiDrawMap();
      });
    } else {
      console.log('Second button not found');
    }

    if (thirdButton) {
      console.log('Third button found');
      thirdButton.addEventListener("click", () => {
        console.log('Third button clicked');
        this.callInterestingPointsApiDrawMap();
      });
    } else {
      console.log('Third button not found');
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
            iconSize: L.point(25, 25), // Assicurati che le dimensioni siano visibili
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

      const interestingPointsAndActivityData =[...interestingPointsData.Items, ...activityData.Items];

      interestingPointsAndActivityData.forEach(point => {
        const pos = [
          point.GpsInfo[0].Latitude,
          point.GpsInfo[0].Longitude
        ];

        let icon = L.divIcon({
          html: '<div class="iconMarkerWebcam"></div>',
          iconSize: L.point(100, 100)
        });

        const popupbody = `<div class="webcampopuptext"><b>${point["Detail.it.Title"]}</b><br>Altitude: ${point.GpsInfo[0].Altitude}</div>`;
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
