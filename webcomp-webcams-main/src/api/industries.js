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
  try {     //l'endpoint l'ho messo vuoto perché non credo serva
    const response = await callGet("/", {
      pagesize: 0,
      origin: config.ORIGIN});
    const filteredData = response.data.filter(item => item.sactive);
    return filteredData.map(item => ({
      scoordinate: item.scoordinate,
      smetadata: {
        name: item.smetadata.name,
        address: item.smetadata.address,
        website: item.smetadata.website
      }
    }));
  } catch(e) {
    console.log(e)
    throw e;
  }
}
