import axios from "axios";
import config from "./config";

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

export async function fetchCreative(source) {
  try {
    const response = await callGet("/flat/CreativeIndustry?select=sname,scoordinate,smetadata.email,smetadata.address,smetadata.website", {
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
