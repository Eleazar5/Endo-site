const datetime = require('node-datetime');
const axios = require('axios');
const mysql = require('mysql');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { 
    PASSKEY,
    SHORTCODE,
    CONSUMERKEY,
    CONSUMERSECRET,
    DB_HOST,
    DB_USER,
    DB_PASS,
    DB_NAME,
    initiatorPassword,
    initiatorName
}= process.env;

const connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME
  });

const environment = "live";
let mpesaURL;
let filePath;
const sitebaseURL = "https://3925-102-216-85-11.ngrok-free.app"

if(environment == "live"){
    mpesaURL = "https://api.safaricom.co.ke"
    filePath = path.join(__dirname, '..', 'library', 'ProductionCertificate.cer');
}else{
    mpesaURL = "https://sandbox.safaricom.co.ke"
    filePath = path.join(__dirname, '..', 'library', 'SandboxCertificate.cer');
}


console.log(filePath)

const publicKey = fs.readFileSync(filePath, 'utf8');

// const publicKey = `-----BEGIN CERTIFICATE-----
//   MIIGkzCCBXugAwIBAgIKXfBp5gAAAD+hNjANBgkqhkiG9w0BAQsFADBbMRMwEQYK
//   CZImiZPyLGQBGRYDbmV0MRkwFwYKCZImiZPyLGQBGRYJc2FmYXJpY29tMSkwJwYD
//   VQQDEyBTYWZhcmljb20gSW50ZXJuYWwgSXNzdWluZyBDQSAwMjAeFw0xNzA0MjUx
//   NjA3MjRaFw0xODAzMjExMzIwMTNaMIGNMQswCQYDVQQGEwJLRTEQMA4GA1UECBMH
//   TmFpcm9iaTEQMA4GA1UEBxMHTmFpcm9iaTEaMBgGA1UEChMRU2FmYXJpY29tIExp
//   bWl0ZWQxEzARBgNVBAsTClRlY2hub2xvZ3kxKTAnBgNVBAMTIGFwaWdlZS5hcGlj
//   YWxsZXIuc2FmYXJpY29tLmNvLmtlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
//   CgKCAQEAoknIb5Tm1hxOVdFsOejAs6veAai32Zv442BLuOGkFKUeCUM2s0K8XEsU
//   t6BP25rQGNlTCTEqfdtRrym6bt5k0fTDscf0yMCoYzaxTh1mejg8rPO6bD8MJB0c
//   FWRUeLEyWjMeEPsYVSJFv7T58IdAn7/RhkrpBl1dT7SmIZfNVkIlD35+Cxgab+u7
//   +c7dHh6mWguEEoE3NbV7Xjl60zbD/Buvmu6i9EYz+27jNVPI6pRXHvp+ajIzTSsi
//   eD8Ztz1eoC9mphErasAGpMbR1sba9bM6hjw4tyTWnJDz7RdQQmnsW1NfFdYdK0qD
//   RKUX7SG6rQkBqVhndFve4SDFRq6wvQIDAQABo4IDJDCCAyAwHQYDVR0OBBYEFG2w
//   ycrgEBPFzPUZVjh8KoJ3EpuyMB8GA1UdIwQYMBaAFOsy1E9+YJo6mCBjug1evuh5
//   TtUkMIIBOwYDVR0fBIIBMjCCAS4wggEqoIIBJqCCASKGgdZsZGFwOi8vL0NOPVNh
//   ZmFyaWNvbSUyMEludGVybmFsJTIwSXNzdWluZyUyMENBJTIwMDIsQ049U1ZEVDNJ
//   U1NDQTAxLENOPUNEUCxDTj1QdWJsaWMlMjBLZXklMjBTZXJ2aWNlcyxDTj1TZXJ2
//   aWNlcyxDTj1Db25maWd1cmF0aW9uLERDPXNhZmFyaWNvbSxEQz1uZXQ/Y2VydGlm
//   aWNhdGVSZXZvY2F0aW9uTGlzdD9iYXNlP29iamVjdENsYXNzPWNSTERpc3RyaWJ1
//   dGlvblBvaW50hkdodHRwOi8vY3JsLnNhZmFyaWNvbS5jby5rZS9TYWZhcmljb20l
//   MjBJbnRlcm5hbCUyMElzc3VpbmclMjBDQSUyMDAyLmNybDCCAQkGCCsGAQUFBwEB
//   BIH8MIH5MIHJBggrBgEFBQcwAoaBvGxkYXA6Ly8vQ049U2FmYXJpY29tJTIwSW50
//   ZXJuYWwlMjBJc3N1aW5nJTIwQ0ElMjAwMixDTj1BSUEsQ049UHVibGljJTIwS2V5
//   JTIwU2VydmljZXMsQ049U2VydmljZXMsQ049Q29uZmlndXJhdGlvbixEQz1zYWZh
//   cmljb20sREM9bmV0P2NBQ2VydGlmaWNhdGU/YmFzZT9vYmplY3RDbGFzcz1jZXJ0
//   aWZpY2F0aW9uQXV0aG9yaXR5MCsGCCsGAQUFBzABhh9odHRwOi8vY3JsLnNhZmFy
//   aWNvbS5jby5rZS9vY3NwMAsGA1UdDwQEAwIFoDA9BgkrBgEEAYI3FQcEMDAuBiYr
//   BgEEAYI3FQiHz4xWhMLEA4XphTaE3tENhqCICGeGwcdsg7m5awIBZAIBDDAdBgNV
//   HSUEFjAUBggrBgEFBQcDAgYIKwYBBQUHAwEwJwYJKwYBBAGCNxUKBBowGDAKBggr
//   BgEFBQcDAjAKBggrBgEFBQcDATANBgkqhkiG9w0BAQsFAAOCAQEAC/hWx7KTwSYr
//   x2SOyyHNLTRmCnCJmqxA/Q+IzpW1mGtw4Sb/8jdsoWrDiYLxoKGkgkvmQmB2J3zU
//   ngzJIM2EeU921vbjLqX9sLWStZbNC2Udk5HEecdpe1AN/ltIoE09ntglUNINyCmf
//   zChs2maF0Rd/y5hGnMM9bX9ub0sqrkzL3ihfmv4vkXNxYR8k246ZZ8tjQEVsKehE
//   dqAmj8WYkYdWIHQlkKFP9ba0RJv7aBKb8/KP+qZ5hJip0I5Ey6JJ3wlEWRWUYUKh
//   gYoPHrJ92ToadnFCCpOlLKWc0xVxANofy6fqreOVboPO0qTAYpoXakmgeRNLUiar
//   0ah6M/q/KA==
//   -----END CERTIFICATE-----
//   `
  
// Encrypting the initiator password
const securityCredential = (initiatorPassword) => {
    const buffer = Buffer.from(initiatorPassword);
    const encrypted = crypto.publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
    }, buffer);

    const securityCredential1 = encrypted.toString('base64');
    return securityCredential1;
}

//Getting the stk push password
const newPassword = () => {
    const dt = datetime.create();
    const formatted = dt.format("YmdHMS");

    const passString = SHORTCODE + PASSKEY + formatted;
    const base64EncodedPassword = Buffer.from(passString).toString('base64');
    return base64EncodedPassword;
}

//get authentication token
exports.tokenauth = (req, res, next) => {
    const url = `${mpesaURL}/oauth/v1/generate?grant_type=client_credentials`;
    const auth = 'Basic ' + Buffer.from(CONSUMERKEY + ':' + CONSUMERSECRET).toString('base64');
    const headers = {
        Authorization: auth
    }

    axios
    .get(url, {
        headers
    })
    .then((response) => {
        console.log(response.data);
        let data = response.data;
        let access_token = data.access_token
        req.token = access_token;
        next();
    })
    .catch((error) => console.log(error));
}

// stk push
exports.stkpush = (req, res) => {
    const token = req.token;
    const {
       phone,
       amount,
       account_no
    } = req.body;
    
    const timestamp = datetime.create().format("YmdHMS");
    const stkurl = `${mpesaURL}/mpesa/stkpush/v1/processrequest`;

    const headers = {
        Authorization: 'Bearer ' + token
    }
    let data = {
        BusinessShortCode: SHORTCODE,
        Password: newPassword(),
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: `${sitebaseURL}/transactions/callbackurl/${account_no}`,
        AccountReference: account_no,
        TransactionDesc: "Lipa na M-Pesa" 
    }
    axios
    .post(stkurl, data, { headers })
    .then(response => {
        res.send(response.data)
        console.log(data.CallBackURL)
    })
    .catch((error) => console.log(error))
}

//MPESA call back
exports.callbackurl = (req, res) => {
    const {company} = req.params;
    console.log(company)

    const callbackData = req.body.Body?.stkCallback;
    console.log(callbackData)
    
    const paid_amt = callbackData.CallbackMetadata.Item[0].Value;
    const trans_number = callbackData.CallbackMetadata.Item[1].Value;
    const trans_date1 = callbackData.CallbackMetadata.Item[3].Value;
    const paying_phone = callbackData.CallbackMetadata.Item[4].Value;
    const checkoutId = callbackData.CheckoutRequestID;

    const trans_date = trans_date1.toString();

    const year = trans_date.substr(0, 4);
    const month = trans_date.substr(4, 2);
    const day = trans_date.substr(6, 2);
    const hour = trans_date.substr(8, 2);
    const minute = trans_date.substr(10, 2);
    const second = trans_date.substr(12, 2);

    const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

    const inserttrans = 'INSERT INTO mpesa_transactions SET ?';
    var new_trans_data = {
        phone_number: paying_phone,
        transaction: trans_number,
        amount: paid_amt,
        date_created: formattedDate,
        account_no: company
    };
    console.log(new_trans_data)

    connection.query(inserttrans ,[new_trans_data], function (error, results, fields) {
    if (error) {
        res.status(500).send({ message: error.message });
    }
        res.status(200).send({
        message: `transaction added`
        });
    })
}

//REGISTER URL FOR C2B
exports.registerurl = (req, res) => {
    const token = req.token;
    const regurl = `${mpesaURL}/mpesa/c2b/v1/registerurl`;

    const headers = {
        Authorization: 'Bearer ' + token
    }

    let data = {
        ShortCode: SHORTCODE,
        ResponseType: "Complete",
        ConfirmationURL: `${sitebaseURL}/transactions/confirmation`,
        ValidationURL: `${sitebaseURL}/transactions/validation`, 
    }

    axios
    .post(regurl, data, { headers })
    .then(response => {
        res.send(response.data)
        console.log(response.data)
    })
    .catch((error) => console.log(error))
};

// C2B Simulate
exports.c2b_simulate = (req, res) => {
    const token = req.token;
    const url = `${mpesaURL}/mpesa/c2b/v2/simulate`;

    const headers = {
        Authorization: 'Bearer ' + token
    }

    let data = {
        ShortCode: SHORTCODE,
        CommandID: "CustomerPayBillOnline",
        Amount: 1,
        Msisdn: phone,
        BillRefNumber: "0000"
    }

    axios
    .post(url, data, { headers })
    .then(response => {
        res.send(response.data)
        console.log(response.data)
    })
    .catch((error) => console.log(error))
};

// Confirmation URL
exports.confirmation = (req, res) => {
    console.log("All transaction  will be send to this url");
    console.log(req.body);
};
  
// Validation URL
exports.validation = (req, res) => {
    console.log("Validating payment");
    console.log(req.body);
};

//B2C Transaction
exports.b2c_request = (req, res) => {
    const token = req.token;
    const regurl = `${mpesaURL}/mpesa/b2c/v1/paymentrequest`;

    const headers = {
        Authorization: 'Bearer ' + token
    }

    let data = {
        Initiator: initiatorName,
        SecurityCredential: securityCredential(initiatorPassword),
        CommandID: "PromotionPayment",
        Amount: "1",
        PartyA: "600996",
        PartyB: phone,
        Remarks: "Withdrawal",
        QueueTimeOutURL: `${sitebaseURL}/transactions/b2cqueue`,
        ResultURL: `${sitebaseURL}/transactions/b2cresult`,
        Occasion: "Withdrawal", 
    }

    axios
    .post(regurl, data, { headers })
    .then(response => {
        res.send(response.data)
        console.log(response.data)
    })
    .catch((error) => console.log(error))
};

exports.b2c_result_url = (req, res) => {
    console.log(JSON.stringify(req.body))
    res.send(JSON.stringify(req.body))
}

exports.b2c_timeout_url = (req, res) => {
    console.log(JSON.stringify(req.body))
    res.send("Transaction Failed")
}

// Get account_balance
exports.account_balance = (req, res) => {
    const token = req.token;
    const url = `${mpesaURL}/mpesa/accountbalance/v1/query`;

    const headers = {
        Authorization: 'Bearer ' + token
    }

    let data = {
        Initiator: initiatorName,
        SecurityCredential: securityCredential(initiatorPassword),
        CommandID: "AccountBalance",
        PartyA: SHORTCODE,
        IdentifierType: "4",
        Remarks: "bal",
        QueueTimeOutURL: `${sitebaseURL}/transactions/bal_timeout`,
        ResultURL: `${sitebaseURL}/transactions/bal_result`
    }

    axios
    .post(url, data, { headers })
    .then(response => {
        res.send(response.data)
        console.log(response.data)
    })
    .catch((error) => console.log(error))
};

exports.bal_result = (req, res) => {
    console.log(JSON.stringify(req.body))
    res.send(JSON.stringify(req.body))
}

exports.timeout_bal_result = (req, res) => {
    console.log(JSON.stringify(req.body))
    res.send("Transaction Failed")
}

// Get transaction status
exports.transaction_status = (req, res) => {
    const token = req.token;
    const url = `${mpesaURL}/mpesa/transactionstatus/v1/query`;

    const headers = { 
         Authorization: 'Bearer ' + token
    }

    let data = {
        Initiator: initiatorName,
        SecurityCredential: securityCredential(initiatorPassword),
        CommandID: "TransactionStatusQuery",
        TransactionID: "RL13XFQ6WB",
        PartyA: SHORTCODE,
        IdentifierType: "4",
        ResultURL: `${sitebaseURL}/transactions/status_result`,
        QueueTimeOutURL: `${sitebaseURL}/transactions/timeout_status_result`,
        Remarks: "OK",
        Occasion:"OK"
    }

    console.log(data)

    axios
    .post(url, data, { headers })
    .then(response => {
        res.send(response.data)
    })
    .catch((error) => {
        console.log(error)
        res.send(JSON.stringify(error.data))
    })
};

exports.transaction_status_result = (req, res) => {
    console.log(JSON.stringify(req.body))
    res.send(JSON.stringify(req.body))
}

exports.timeout_status_result = (req, res) => {
    console.log(JSON.stringify(req.body))
    res.send("Transaction Failed")
}

// Reverse transaction
exports.reverse_transaction = (req, res) => {
    const token = req.token;
    const url = `${mpesaURL}/mpesa/reversal/v1/request`;

    const headers = {
        Authorization: 'Bearer ' + token
    }

    let data = {
        Initiator: initiatorName,
        SecurityCredential: securityCredential(initiatorPassword),
        CommandID: "TransactionReversal",
        TransactionID: "NLJ11HAY8V",
        Amount: 100,
        ReceiverParty: SHORTCODE,
        RecieverIdentifierType:"11",
        ResultURL: `${sitebaseURL}/transactions/reverse_result_url`,
        QueueTimeOutURL: `${sitebaseURL}/transactions/reverse_result_url`,
        Remarks: "Ok",
        Occasion: "Ok"
    }

    axios
    .post(url, data, { headers })
    .then(response => {
        res.send(response.data)
        console.log(response.data)
    })
    .catch((error) => console.log(error))
};

exports.reverse_result_url = (req, res) => {
    console.log(JSON.stringify(req.body))
    res.send(JSON.stringify(req.body))
}

exports.timeout_result_url = (req, res) => {
    console.log(JSON.stringify(req.body))
    res.send("Transaction Failed")
}