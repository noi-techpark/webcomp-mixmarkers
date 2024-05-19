import axios from "axios";
import config from "./config";

export function callGet(path, params) {
  console.log("INTERESTING POINTS call = " + config.interestPointsAPI.API_BASE_URL + path);

  console.log(params);
  return axios
    .get(config.interestPointsAPI.API_BASE_URL + path, {
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
      origin: config.interestPointsAPI.ORIGIN,
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
      origin: config.interestPointsAPI.ORIGIN,
      fields: fields
    });
    console.log('activities response = ', response);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}



/*
import axios from "axios";
import config from "./config";

async function callGet(path, params) {
  console.log("InterestingPOINTS call = " + config.interestPointsAPI.API_BASE_URL + path);
  console.log(params);
  try {
    const response = await axios.get(config.interestPointsAPI.API_BASE_URL + path, {
      params: params
    });
    console.log('interestingPoints response = ', response);
    return response.data;
  } catch (error) {
    console.error(error.response);
    throw error;
  }
}

export async function fetchInterestingPoints(source) {
  try {
    const response = await callGet("/ODHActivityPoi?tagfilter=poi&active=true&fields=Detail.it.Title,GpsInfo", {
      pagesize: 0,
      origin: config.interestPointsAPI.ORIGIN,
    });
    console.log('points response = ', response);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

*/
