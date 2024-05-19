import axios from "axios";
import config from "./config";

async function callGet(path, params) {
  console.log("INDUSTRY call = " + config.industriesAPI.API_BASE_URL + path);
  console.log(params);
  try {
    const response = await axios.get(config.industriesAPI.API_BASE_URL + path, {
      params: params
    });
    console.log('industry response = ', response);
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
    console.log('fetchCreative response = ', response);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
