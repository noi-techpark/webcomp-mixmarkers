// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import L, { latLng } from 'leaflet';
import leaflet_mrkcls from 'leaflet.markercluster';
import style__leaflet from 'leaflet/dist/leaflet.css';
import style__markercluster from 'leaflet.markercluster/dist/MarkerCluster.css';
import style from './scss/main.scss';
import style__autocomplete from './scss/autocomplete.css';
import { fetchWeatherForecast, fetchMunicipality } from './api/api.js';
import {fetchCreative} from './api/industries';
import { autocomplete } from './custom/autocomplete.js'

//delete L.Icon.Default.prototype._getIconUrl;

class OpendatahubWeatherForecast extends HTMLElement {
  constructor() {
    super();

    this.map_center = [46.7728692, 10.7916716];
    this.map_zoom = 10;

    if (this.centermap != null) {
      var centerlatlong = this.centermap.split(',')
      /* Map configuration */
      this.map_center = [centerlatlong[0], centerlatlong[1]];
    }
    if (this.map_zoom != null) {
      this.map_zoom = this.zoommap;
    }
    //this.map_layer = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png";
    this.map_layer = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    this.map_attribution = '<a target="_blank" href="https://opendatahub.com">OpenDataHub.com</a> | &copy; <a target="_blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a target="_blank" href="https://carto.com/attribution">CARTO</a>';

    /* Requests */
    this.fetchWeatherForecast = fetchWeatherForecast.bind(this);
    this.fetchMunicipality = fetchMunicipality.bind(this);
    this.autocomplete = autocomplete.bind(this);
    this.fetchCreative = fetchCreative.bind();

    // We need an encapsulation of our component to not
    // interfer with the host, nor be vulnerable to outside
    // changes --> Solution = SHADOW DOM
    this.shadow = this.attachShadow(
      {mode: "open"}    // Set mode to "open", to have access to
      // the shadow dom from inside this component
    );
  }

  // Attributes we care about getting values from
  // Static, because all OpendatahubWebcams instances have the same
  //   observed attribute names
  static get observedAttributes() {
    return ['centermap', 'zoom', 'source'];
  }

  // Override from HTMLElement
  // Do not use setters here, because you might end up with an endless loop
  attributeChangedCallback(propName, oldValue, newValue) {
    console.log(`Changing "${propName}" from "${oldValue}" to "${newValue}"`);
    if (propName === "centermap" || propName === "zoommap" || propName === "source") {
      this.render();
    }
  }

  // We should better use such getters and setters and not
  // internal variables for that to avoid the risk of an
  // endless loop and to have attributes in the html tag and
  // Javascript properties always in-sync.
  get centermap() {
    return this.getAttribute("centermap");
  }

  set centermap(newCentermap) {
    this.setAttribute("centermap", newTitle)
  }

  get zoommap() {
    return this.getAttribute("zoommap");
  }

  set zoommap(newZoommap) {
    this.setAttribute("zoommap", newZoommap)
  }

  get source() {
    return this.getAttribute("source");
  }

  set source(newSource) {
    this.setAttribute("source", newSource)
  }

  // Triggers when the element is added to the document *and*
  // becomes part of the page itself (not just a child of a detached DOM)
  connectedCallback() {
    this.render();

    this.initializeMap();
    this.callForecastApiDrawMap();
    this.callIndustriesApiDrawMap();
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

  async callIndustriesApiDrawMap() {
    await this.fetchCreative('scoordinate,smetadata.email,sname,smetadata.address,smetadata.website'); // Chiamata API per ottenere le informazioni sulle industrie creative

    let array = []; // Array per memorizzare i marcatori delle industrie creative

    this.creativeIndustries.map(creative => {

      const pos = [
        creative["scoordinate"].Latitude,
        creative["scoordinate"].Longitude
      ];

      let icon = L.divIcon({
        html: '<div class="iconMarkerMap"></div>',
        iconSize: L.point(100, 100)
      });

      const myIndustries = this.creativeIndustries;

      let result = myIndustries.find(o => o['AddressInfo'] === creative['smetadata.email']);

      const industriesInformation = result.IndustriesInformation;
      let industriesDatails = '';
      // let industriesPic = '';

      industriesInformation.forEach(myCreative => {
        industriesDatails += myCreative['Date'] + ": " + myCreative['WeatherDesc'] + ", ";
        console.log(myCreative['Date'] + ": " + myCreative['WeatherDesc'] + "............");
      });

      //modificare class. ho lasciato webcampopup come prova
      const popupbody = '<div class="webcampopup"> + industriesDatails</div>';
      let popup = L.popup().setContent(popupbody);

      var gifElement = document.createElement('img');

      // specify popup options
      var customOptions =
        {
          'minWidth': '300',
          'maxWidth': '350',
          'border-radius': '0.75em',
          'padding': '0px'
        }

      let marker = L.marker(pos, {
        icon: icon,
      }).bindPopup(popup, customOptions);


      array.push(marker);
    });

    this.visibleStations = array.length;
    let columns_layer = L.layerGroup(array, {});

    /** Prepare the cluster group for station markers */
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
    /** Add maker layer in the cluster group */
    this.layer_columns.addLayer(columns_layer);
    /** Add the cluster group to the map */
    this.map.addLayer(this.layer_columns);
  }

  //ho lasciato le cose di webcam e di forecast
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


  async callForecastApiDrawMap() {
    await this.fetchWeatherForecast();
    await this.fetchMunicipality('Detail.it.Title,GpsPoints.position,IstatNumber');

    let columns_layer_array = [];

    this.municipalities.map(municipality => {

      const pos = [
        municipality["GpsPoints.position"].Latitude,
        municipality["GpsPoints.position"].Longitude
      ];

      let icon = L.divIcon({
        //html: '<div class="marker">' + webcamhtml + '</div>',
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

      //const webcamhtml = '<img class="webcampreview" src="' + imageurl + '" title="' + webcamname + '">'

      const popupbody = '<div class="webcampopup">' + weatherforecastpic + '</div><div class="webcampopuptext"><div><b>' + weatherforecasttext + '</b></div></div>';
      let popup = L.popup().setContent(popupbody);


      var gifElement = document.createElement('img');

      // specify popup options
      var customOptions =
        {
          'minWidth': '300',
          'maxWidth': '350',
          'border-radius': '0.75em',
          'padding': '0px'
        }

      let marker = L.marker(pos, {
        icon: icon,
      }).bindPopup(popup, customOptions);

      columns_layer_array.push(marker);
    });


    this.visibleStations = columns_layer_array.length;
    let columns_layer = L.layerGroup(columns_layer_array, {});

    /** Prepare the cluster group for station markers */
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
    /** Add maker layer in the cluster group*/
    this.layer_columns.addLayer(columns_layer);
    /** Add the cluster group to the map*/
    this.map.addLayer(this.layer_columns);

    // this.map.on('popupopen', function(e) {
    //     var px = map.project(e.target._popup._latlng); // find the pixel location on the map where the popup anchor is
    //     px.y -= e.target._popup._container.clientHeight/2; // find the height of the popup container, divide by 2, subtract from the Y axis of marker location
    //     map.panTo(map.unproject(px),{animate: true}); // pan to new center
    // });


    render()
    {
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
}

  customElements.define('webcomp-weatherforecast', OpendatahubWeatherForecast);





















/*










  async callIndustriesApiDrawMap(){
    await this.fetchCreative(); // Chiamata API per ottenere le informazioni sulle industrie creative

    let markersArray = []; // Array per memorizzare i marcatori delle industrie creative

    this.creativeIndustries.forEach(industry => {
      const pos = [industry.latitude, industry.longitude]; // Posizione della singola industria
      const icon = L.divIcon({
        html: '<div class="industry-marker"></div>', // HTML per l'icona del marcatori
        iconSize: L.point(100, 100) // Dimensioni dell'icona del marcatori
      });

      // Costruzione del contenuto del popup
      const popupContent = `
            <div class="industry-popup">
                <h3>${industry.name}</h3>
                <p>${industry.description}</p>
            </div>
        `;

      const popup = L.popup().setContent(popupContent); // Creazione del popup

      // Creazione del marcatori per l'industria creativa
      const marker = L.marker(pos, {
        icon: icon // Icona del marcatori
      }).bindPopup(popup); // Collegamento del popup al marcatori

      markersArray.push(marker); // Aggiunta del marcatori all'array
    });

    // Creazione di un layer group per i marcatori delle industrie creative
    this.industriesLayerGroup = L.layerGroup(markersArray);

    // Rimozione del layer group precedente (Weather Forecast) dalla mappa, se presente
    if (this.weatherForecastLayerGroup) {
      this.map.removeLayer(this.weatherForecastLayerGroup);
    }

    // Aggiunta del layer group delle industrie creative alla mappa
    this.industriesLayerGroup.addTo(this.map);
  }

 */

/*
forecastdaily.map(myforecst => {
    //console.log(myforecst['Date']);
    //console.log(myforecst['WeatherDesc']);
    weatherforecasttext += myforecst['Date'] + ": " + myforecst['WeatherDesc'] + ",";
    weatherforecastpic += myforecst['WeatherImgUrl'];
});
forecastdaily.forEach(myforecst => {
    weatherforecasttext += myforecst['Date'] + ": " + myforecst['WeatherDesc'] + ",";
    //weatherforecastpic += '<a href="' + myforecst['WeatherImgUrl'] + '">Link to Image</a>';
});
*/
/*
}

// Register our first Custom Element named <webcomp-webcams>
customElements.define('webcomp-weatherforecast', OpendatahubWeatherForecast);


*/
