// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from "axios";
import config from "./config";

export function callGet(path, params) {
  console.log("MUNICIPALITY call = " + config.API_BASE_URL + path);

	console.log(params);
	return axios
		.get(config.turismAPI.API_BASE_URL + path, {
			params: params
		})
		.then(function(response) {
			console.log("call response = ");
			//console.log(response.data);
			console.log(response.config);
      console.log("MUNICIPALITY call params = " + params);
			return response.data;

		})
		.catch(function(error) {
			console.log(error.response);
			throw error;
		});
}

export async function fetchWebcams(source) {
	return callGet("/WebcamInfo", {
            pagesize: 0,
		    source: source != null ? source.toString() : '',
			origin: config.ORIGIN
		})
		.then(response => {
			this.webcams = response.Items;
      console.log('webcams = response' + this.webcams);
		})
		.catch(e => {
			console.log(e)
			throw e;
		});
}

export async function fetchWeatherForecast(source) {
	return callGet("/Weather/Forecast", {
            pagesize: 0,
			origin: config.ORIGIN
		})
		.then(response => {
			this.weather = response;
      console.log('weather = response');
		})
		.catch(e => {
			console.log(e)
			throw e;
		});
}

export async function fetchDistricts(fields) {
    return callGet("/District", {
        origin: config.ORIGIN,
        fields: fields
    })
    .then(response => {
        this.districts = response;
      console.log('district = response');
    })
    .catch(e => {
        console.log(e)
        throw e;
    });
}

export async function fetchMunicipality(fields) {
    return callGet("/Municipality", {
        origin: config.turismAPI.ORIGIN,
        fields: fields
    })
    .then(response => {
        this.municipalities = response;
      console.log('municipalities = response');
    })
    .catch(e => {
        console.log(e)
        throw e;
    });
}
