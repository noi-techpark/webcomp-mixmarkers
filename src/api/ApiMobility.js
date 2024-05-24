// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from "axios";
import config from "./config";

/*
 *  callGet performs a GET request to the path with the given parameters.
 *  path => path of the API endpoint
 *  params => API request needs the parameters
 */
async function callGet(path, params) {
  console.log("Mobility path = " + config.mobilityAPI.API_BASE_URL + path);
  try {
    const response = await axios.get(config.mobilityAPI.API_BASE_URL + path, {
      params: params
    });
    console.log('industry = response');
    return response.data;
  } catch (error) {
    console.error(error.response);
    throw error;
  }
}

//fetchCreative function fetches creative industries' information from the API
export async function fetchCreative(source) {
  try {
    const response = await callGet("/flat/CreativeIndustry", {
      pagesize: 0,
      origin: config.mobilityAPI.ORIGIN,
    });
    console.log('creativeIndustry = response');
    return response;
  } catch (e) {
    console.error(e);
    throw error;
  }
}

//fetchParking function fetches parking slot information from the API
export async function fetchParking(source) {
  try{
  const response = await callGet("/flat/ParkingStation/free/latest", {
    origin: config.mobilityAPI.ORIGIN,
    pagesize: 0
  });
  console.log('parking = response');
  return response;
  } catch(e) {
      console.error(e);
      throw e;
  }
}
