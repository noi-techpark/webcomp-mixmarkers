import axios from "axios";
import config from "./config";

export function callGet(path, params) {

  return axios
    .get(config.industries.API_BASE_URL + path, {
      params: params
    })
    .then(function(response) {
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
      })
      .catch(e => {
    console.log(e)
    throw e;
  });
}
