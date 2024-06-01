// https://developers.airtel.africa/documentation/authorization/1.0
const axios = require("axios");

const { airtelclient_id, airtelclient_secret, airtel_environment } =
  process.env;
let airtelURL;

if (airtel_environment == "live") {
  airtelURL = "https://openapi.airtel.africa";
} else {
  airtelURL = "https://openapiuat.airtel.africa";
}

//get authentication token
exports.authToken = (req, res) => {
  let data = {
    client_id: airtelclient_id,
    client_secret: airtelclient_secret,
    grant_type: "client_credentials",
  };

  let config = {
    method: "post",
    url: `${airtelURL}/auth/oauth2/token`,
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      let accessToken = response.data.access_token;
      req.token = accessToken;
      next();
    })
    .catch((error) => {
      console.log(error);
    });
};

//get account balance
exports.accountBalance = (req, res) => {
  const access_token = req.token;
  let headers = {
    Accept: "*/*",
    "X-Country": "KE",
    "X-Currency": "KES",
    Authorization: `Bearer ${access_token}`,
  };

  let config = {
    method: "get",
    url: `${airtelURL}/standard/v1/users/balance`,
    headers: headers,
    data: {},
  };

  axios
    .request(config)
    .then((response) => {
      console.log(response.data);
      res.send(response);
    })
    .catch((error) => {
      console.log(error);
      res.send(error.response);
    });
};
