import axios from "axios";
import config from "./config";

  async function callGet(path, params) {
    console.log("INDUSTRY call = " + config.industriesAPI.API_BASE_URL + path);
    try {
      const response = await axios.get(config.industriesAPI.API_BASE_URL + path, {
        params: params
      });
      console.log('industry resonse = ' + response);
      return response.data;
    } catch (error) {
      console.error(error.response);
      throw error;
    }
  }

  export async function fetchCreative(source) {
    try {
      const response = await callGet("/flat/CreativeIndustry?select=sname,scoordinate,smetadata.email,smetadata.address,smetadata.website", {
        pagesize: 0,
        origin: config.industriesAPI.ORIGIN,
      });
      console.log('fetchCreative response = ' + response);
      console.log('fetchCreative ORIGIN = ' + origin + ' URL: ' + config.industriesAPI.API_BASE_URL);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

/*
export function callGet(path, params) {

  console.log("INDUSTRY call = " + config.API_BASE_URL + path);


  return axios
    .get(config.industriesAPI.API_BASE_URL + path, {
      params: params
    })
    .then(function(response) {
      console.log(response.config);
      console.log('INDUSTRY call params = ' + params);
      return response.data;
    })
    .catch(function(error) {
      console.log(error.response);
      throw error;
    });
}

export async function fetchCreative(source) {

    return callGet("/flat/CreativeIndustry?select=sname,scoordinate,smetadata.email,smetadata.address,smetadata.website", {
      pagesize: 0,
      origin: config.ORIGIN
    })
    .then(response => {
        this.creativeIndustries = response;
        console.log('creativeIndustries = response');
      })
      .catch(e => {
    console.log(e)
    throw e;
  });
}
*/
