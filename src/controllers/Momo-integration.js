const {
    appendToLogFile
} = require('../helpers/General');

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
uuidv4();

const {
    momo_X_Reference_id,
    momo_Target_Env,
    momo_Ocp_Apim_Subscription_Key,
    momo_apikey
} = process.env

// Create api user
exports.createUser = (req, res, next) => {
    const url = `https://sandbox.momodeveloper.mtn.com/v1_0/apiuser`;
    const refId = uuidv4()
    const headers = { 
        'Ocp-Apim-Subscription-Key': momo_Ocp_Apim_Subscription_Key,
        'X-Reference-id': refId
    }

    let data = {
        "providerCallbackHost": "https://webhook.site/b73b821f-bb46-4d45-bc9c-9060135de8af"
    }

    axios
    .post(url, data, { headers })
    .then(response => {
        req.refID = refId;
        next();
    })
    .catch((error) => {
        console.log(error)
        res.send(JSON.stringify(error.data))
    })
};

//Generate api key
exports.generateApiKey = (req, res) => {
    const refId = req.refID;
    const url = `https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${refId}/apikey`;

    const headers = { 
        'Ocp-Apim-Subscription-Key': momo_Ocp_Apim_Subscription_Key
    }

    let data = {}

    axios
    .post(url, data, { headers })
    .then(response => {        
        const apikey = response.data.apiKey;
        appendToLogFile(`Userid ${refId} with apikey ${apikey} has been created.`)

        const resObject = {
            UserId: refId,
            ApiKey: apikey
        };
        res.send(resObject)
    })
    .catch((error) => {
        console.log(error)
        res.send(JSON.stringify(error.data))
    })
};

//Getting basic auth
const userAuthBasic = () => {
    const base64EncodedPassword = Buffer.from(`${momo_X_Reference_id}:${momo_apikey}`).toString('base64');
    return base64EncodedPassword;
}

//Generate access token
exports.generateAccessToken = (req, res, next) => {
    const url = `https://sandbox.momodeveloper.mtn.com/collection/token/`;
    const headers = { 
        'Ocp-Apim-Subscription-Key': momo_Ocp_Apim_Subscription_Key,
        'Authorization': 'Basic ' + userAuthBasic()
    }

    let data = {}

    axios
    .post(url, data, { headers })
    .then(response => {
        let access_token = response.data.access_token
        req.token = access_token;
        next();
    })
    .catch((error) => {
        console.log(error)
        res.send(JSON.stringify(error))
    })
};

//Request to pay
exports.requestToPay = (req, res) => {
    const token = req.token;
    const url = `https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay`;
    const headers = { 
        'X-Reference-id': momo_X_Reference_id,
        'X-Target-Environment': momo_Target_Env,
        'Ocp-Apim-Subscription-Key': momo_Ocp_Apim_Subscription_Key,
        'Authorization': 'Bearer ' + token
    }

    let data = {
        "amount": "5",
        "currency": "EUR",
        "externalId": "36434616",
        "payer": {
            "partyIdType": "MSISDN",
            "partyId": "0706083697"
        },
        "payerMessage": "Payment for a loan",
        "payeeNote": "Paid"
    }

    axios
    .post(url, data, { headers })
    .then(response => {
        res.send(response.data)
    })
    .catch((error) => {
        console.log(error)
        res.send(JSON.stringify(error))
    })
};