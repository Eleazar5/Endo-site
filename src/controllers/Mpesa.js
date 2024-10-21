const datetime = require('node-datetime');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
// const connection = require('../helpers/dbConfig');

const {
    appendToLogFileNewUsers,
} = require('../helpers/General');

const { 
    PASSKEY,
    SHORTCODE,
    CONSUMERKEY,
    CONSUMERSECRET,
    initiatorPassword,
    initiatorName,
    environment,
    sitebaseURL
}= process.env;

let mpesaURL;
let filePath;

if(environment == "live"){
    mpesaURL = "https://api.safaricom.co.ke"
    filePath = path.join(__dirname, '..', 'library', 'ProductionCertificate.cer');
}else{
    mpesaURL = "https://sandbox.safaricom.co.ke"
    filePath = path.join(__dirname, '..', 'library', 'SandboxCertificate.cer');
}

const publicKey = fs.readFileSync(filePath, 'utf8');
  
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
    })
    .catch((error) => console.log(error))
}

//MPESA call back
exports.callbackurl = (req, res) => {
    const {company} = req.params;
    console.log(req.body)
    const callbackData = req.body.Body?.stkCallback;
    console.log(callbackData)
    
    const paid_amt = callbackData?.CallbackMetadata.Item[0].Value;
    const trans_number = callbackData?.CallbackMetadata.Item[1].Value;
    const trans_date1 = callbackData?.CallbackMetadata.Item[3].Value;
    const paying_phone = callbackData?.CallbackMetadata.Item[4].Value;
    const checkoutId = callbackData?.CheckoutRequestID;

    const trans_date = trans_date1.toString();

    const year = trans_date.substr(0, 4);
    const month = trans_date.substr(4, 2);
    const day = trans_date.substr(6, 2);
    const hour = trans_date.substr(8, 2);
    const minute = trans_date.substr(10, 2);
    const second = trans_date.substr(12, 2);

    const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

    // const inserttrans = 'INSERT INTO tb_mpesa_transactions SET ?';
    // var new_trans_data = {
    //     phone_number: paying_phone,
    //     transaction: trans_number,
    //     amount: paid_amt,
    //     date_created: formattedDate,
    //     account_no: company
    // };
    // console.log(new_trans_data)

    // connection.query(inserttrans ,[new_trans_data], function (error, results, fields) {
    // if (error) {
    //     res.status(500).send({ message: error.message });
    // }
    //     res.status(200).send({
    //     message: `transaction added`
    //     });
    // })
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

// Confirmation URL
exports.confirmation = (req, res) => {
    const confirmationData = req.body;

    const TransactionType = confirmationData.TransactionType;
    const TransID = confirmationData.TransID;
    const TransTime = confirmationData.TransTime
    const TransAmount = confirmationData.TransAmount
    const BusinessShortCode = confirmationData.BusinessShortCode;
    const BillRefNumber = confirmationData.BillRefNumber;
    const InvoiceNumber = confirmationData.InvoiceNumber
    const OrgAccountBalance = confirmationData.OrgAccountBalance;
    const ThirdPartyTransID = confirmationData.ThirdPartyTransID;
    const MSISDN = confirmationData.MSISDN;
    const FirstName = confirmationData.FirstName;

    res.send(TransID);
};
  
// Validation URL
exports.validation = (req, res) => {
    const resObject = {
        ResultDesc:"Confirmation Service request accepted successfully",
        ResultCode:"0"
    };
    res.send(resObject);
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
    const { 
        trans_ref, 
        shortcode, 
        initiator_name, 
        initiator_pass 
    } = req.body;
    const url = `${mpesaURL}/mpesa/transactionstatus/v1/query`;

    const headers = { 
         Authorization: 'Bearer ' + token
    }

    let data = {
        Initiator: initiator_name,
        SecurityCredential: securityCredential(initiator_pass),
        CommandID: "TransactionStatusQuery",
        TransactionID: trans_ref,
        PartyA: shortcode,
        IdentifierType: "4",
        ResultURL: `${sitebaseURL}/transactions/status_result`,
        QueueTimeOutURL: `${sitebaseURL}/transactions/timeout_result`,
        Remarks: "OK",
        Occasion:"OK"
    }

    axios
    .post(url, data, { headers })
    .then(response => {
        console.log(response.data)
        res.send(response.data)
    })
    .catch((error) => {
        console.log(error)
        res.send(JSON.stringify(error.data))
    })
};

exports.transaction_status_result = (req, res) => {
    const resultData = req.body?.Result?.ResultParameters;
    appendToLogFileNewUsers(JSON.stringify(req.body.Result.ResultParameters))
    console.log(JSON.stringify(req.body))

    // const phone = resultData.ResultParameter[0].Value;
    // const parts = phone.split(' - ');
    // const phoneNumber = parts[0];

    // const trans_number = resultData.ResultParameter[12].Value;
    // const amount = resultData.ResultParameter[10].Value;
    // const trans_date1 = resultData.ResultParameter[9].Value;

    // const trans_date = trans_date1.toString();

    // const year = trans_date.substr(0, 4);
    // const month = trans_date.substr(4, 2);
    // const day = trans_date.substr(6, 2);
    // const hour = trans_date.substr(8, 2);
    // const minute = trans_date.substr(10, 2);
    // const second = trans_date.substr(12, 2);

    // const transaction_date = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

    // const updateQuery = `
    //     UPDATE transactions_records
    //     SET phone = ?,
    //         amount = ?,
    //         transaction_date = ?
    //     WHERE transaction_id = ?
    // `;

    // const updatedData = {
    //     phone: phoneNumber,
    //     amount: amount,
    //     transaction_date: transaction_date
    // };

    // connection.query(updateQuery, [updatedData.phone, updatedData.amount, updatedData.transaction_date, trans_number], (error, results) => {
    //     if (error) {
    //         console.error(error);
    //     } else {
    //         console.log('Data updated successfully:', results);
    //     }
    // });
}

exports.timeout_status_result = (req, res) => {
    console.log(JSON.stringify(req.body))
    appendToLogFileNewUsers(JSON.stringify(req.body.Result.ResultParameters))
    res.send("Transaction Time out")
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