import axios from "axios";
import config from "./config";

export function callGet(path, params) {
  console.log("TURISM API call = " + config.turismAPI.API_BASE_URL + path);

  console.log(params);
  return axios
    .get(config.turismAPI.API_BASE_URL + path, {
      params: params
    })
    .then(function(response) {
      console.log("location response = ");
      console.log("API response = ", response.data);
      console.log(response.config);
      console.log("POINTS call params = " + params);
      return response.data;

    })
    .catch(function(error) {
      console.log(error.response);
      throw error;
    });
}

export async function fetchInterestingPoints(fields) {
  try {
    const response = await callGet("/ODHActivityPoi?tagfilter=poi&active=true&fields=Detail.it.Title,GpsInfo", {
      origin: config.turismAPI.ORIGIN,
      fields: fields
    });
    console.log('interesting response = ', response);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function fetchActivities(fields) {
  try {
    const response = await callGet("/ODHActivityPoi?tagfilter=activity&active=true&fields=Detail.it.Title,GpsInfo", {
      origin: config.turismAPI.ORIGIN,
      fields: fields
    });
    console.log('activities response = ', response);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function fetchGastronomy(fields) {
  try {
    const response = await callGet("/ODHActivityPoi?tagfilter=gastronomy&active=true&fields=Detail.it.Title,GpsInfo", {
      pagesize: 0,
      origin: config.turismAPI.ORIGIN,
      fields: fields
    });
    console.log('gastronomy response = ', response);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
