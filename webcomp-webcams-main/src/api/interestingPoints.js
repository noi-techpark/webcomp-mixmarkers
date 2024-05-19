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
