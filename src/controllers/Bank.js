const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const {
    bankenvironment,
    merchantcode
}= process.env;
let bankURL;
let tokenbankURL;

if(bankenvironment == "live"){
    bankURL = "https://api.finserve.africa/v3-apis/account-api/v3.0";
    tokenbankURL = "https://api.finserve.africa/authentication/api/v3"
}else{
    bankURL = "https://uat.finserve.africa/v3-apis/account-api/v3.0";
    tokenbankURL = "https://uat.finserve.africa/authentication/api/v3"
}
//Generating signature
const signature = (countryCode, accountId, date) => {
    const plainsignture = accountId + countryCode + date;
    const filePath = path.join(__dirname, '..', 'library/jenga', 'privatekey.pem');
    const privateKey = fs.readFileSync(filePath, 'utf8');

    // Sign the plaintext
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(plainsignture);
    const signature = sign.sign(privateKey, 'base64');

    return signature;
}

//get authentication token
exports.authToken = (req, res) => {
    const apikeyfilePath = path.join(__dirname, '..', 'library/jenga', 'publickey.pem');
    const api_key = fs.readFileSync(apikeyfilePath, 'utf8');
    const myapi_key = api_key
    .replace('-----BEGIN PUBLIC KEY-----', '') 
    .replace('-----END PUBLIC KEY-----', '')  
    .replace(/[\r\n]/g, '')                     
    .trim(); 

    const secret_key = "ce0NHpa7ZaxmOFkbEbULABpu412fS4NQa";  

    let data = {
        "merchantCode": merchantcode,
        "consumerSecret": secret_key
    };
    
    let config = {
        method: 'post',
        url: `${tokenbankURL}/authenticate/merchant`,
        headers: { 
            'Api-Key': myapi_key, 
            'Content-Type': 'application/json'
        },
        data : data
    };
    
    axios.request(config)
    .then((response) => {
        let bearer_token = response.data.accessToken
        req.token = bearer_token;
        next();
    })
    .catch((error) => {
        console.log(error);
    });
      
}

//get account balance
exports.accountBalance = (req, res) => {
    const access_token = req.token;
    const {
        countryCode,
        accountId,
        date
    } = req.body

    let data = {
        "countryCode": countryCode,
        "accountId": accountId,
        "date": date
      };
      
      let config = {
        method: 'post',
        url: `${bankURL}/accounts/accountBalance/query`,
        headers: { 
          'Authorization': `Bearer ${access_token}`, 
          'Content-Type': 'application/json', 
          'signature': signature(countryCode, accountId, date)
        },
        data : data
      };
      
      axios.request(config)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
      
}