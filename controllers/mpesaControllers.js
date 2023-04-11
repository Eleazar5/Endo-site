const datetime = require('node-datetime');
const axios = require('axios');
const nodeMailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // comes with node

const passkey = 'c4ebfa8d77e1f5bfc03e2f77d1ea73cfc569cec7bef17b946ebbbba6800623f4';
const shortcode = 174379;
const consumerkey = 'skRN5WATuivVdxAnOOJG2pik6GRQi6kY';
const consumersecret = 'ZqUGPOGAIQVVTJCL';

const initiatorPassword = 'Hellopass';
const phone = 254706083697;

const newPassword = () => {
    const dt = datetime.create();
    const formatted = dt.format("YmdHMS");

    const passString = shortcode + passkey + formatted;
    const base64EncodedPassword = Buffer.from(passString).toString('base64');
    return base64EncodedPassword;
}

// encrypt API operator password
const encryptedPassword = () => {
    //read your cert to a buffer
    const certFile = fs.readFileSync(path.join(__dirname, '../SandboxCertificate.cer'));

    //create X509Certificate from the buffer
    const cert = new crypto.X509Certificate(certFile);

    //extract public key from X509Certificate
    const publicKey = cert.publicKey
    // console.log(publicKey.export({ format: 'pem', type: 'spki' }))

  
    //create arrayBufferView from the password
    const encoder = new TextEncoder();
    const arrayBuffer = encoder.encode(initiatorPassword).buffer;
    const arrayBufferView = new Uint8Array(arrayBuffer);

  // encrypt your password
    securityCredential = crypto.publicEncrypt(publicKey, arrayBufferView).toString('base64');
    console.log(securityCredential);
    return securityCredential;
}

// define transport for email
const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    // secure: true,  //true for 465 port
    auth: {
      user: "eleazarsimba3000@gmail.com",
      pass: "rsqapjsnjgbzhjdp"
    }
  });

//general route
exports.home = (req, res) => {
    const code = "ckrz4842";
    const codeLink = `https://portaltest.mawingunetworks.com/Customer?access_code=${code}`;
    const message = `Your SMS is <a href= ${codeLink} >${code}</a>`
    res.send(message);    
 };

//get authentication token
exports.tokenauth = (req, res, next) => {
    const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    const auth = 'Basic ' + Buffer.from(consumerkey + ':' + consumersecret).toString('base64');
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
    // const amount = req.body.amount;
    // const phone = req.body.phone;
    const amount = 4;
    
    const timestamp = datetime.create().format("YmdHMS");
    const stkurl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const headers = {
        Authorization: 'Bearer ' + token
    }
    let data = {
        BusinessShortCode: shortcode,
        Password: newPassword(),
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        // CallBackURL: "http://example.com/confirmation",
        CallBackURL: "https://nimble-yeot-0421ef.netlify.app/",
        AccountReference: "Eleazar store",
        TransactionDesc: "Lipa na M-Pesa" 
    }
    // var amount = 10;
    axios
    .post(stkurl, data, { headers })
    .then(response => {
        res.send(response.data)
        console.log(response.data.CheckoutRequestID)
    })
    .catch((error) => console.log(error))
}

// Transaction status
exports.transactionstatus = (req, res) => {
    const token = req.token;    
    const stkurl = 'https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query';

    const headers = {
        Authorization: 'Bearer ' + token
    }
    let data = {
        Initiator: "testapi",
        SecurityCredential: encryptedPassword(),
        CommandID: "TransactionStatusQuery",
        TransactionID: "OEI2AK4Q16",
        PartyA: shortcode,  // Organization/MSISDN receiving the transaction
        IdentifierType: 4,  // 1 – MSISDN 2 – Till Number 4 – Organization shortcode
        ResultURL: "https://mydomain.com/TransactionStatus/result/",
        QueueTimeOutURL: "https://mydomain.com/TransactionStatus/queue/",
        Remarks: "ok",
        Occassion: "ok", 
    }
    // var amount = 10;
    axios
    .post(stkurl, data, { headers })
    .then(response => {
        res.send(response.data)
        console.log(response.data)
    })
    .catch((error) => console.log(error))
}

//REGISTER URL FOR C2B
exports.registerurl = (req, res) => {
    const token = req.token;
    const regurl = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl";

    const headers = {
        Authorization: 'Bearer ' + token
    }

    let data = {
        ShortCode: shortcode,
        ResponseType: "Complete",
        ConfirmationURL: "http://example.com/confirmation",
        ValidationURL: "http://example.com/validation", 
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
    const url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v2/simulate";

    const headers = {
        Authorization: 'Bearer ' + token
    }

    let data = {
        ShortCode: shortcode,
        CommandID: "CustomerPayBillOnline",
        Amount: 1,
        Msisdn: phone,
        BillRefNumber: 0000
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
    const regurl = "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest";

    const headers = {
        Authorization: 'Bearer ' + token
    }

    let data = {
        InitiatorName: "testapi",
        SecurityCredential: encryptedPassword(),
        CommandID: "PromotionPayment",
        Amount: "1",
        PartyA: "600996",
        PartyB: phone,
        Remarks: "Withdrawal",
        QueueTimeOutURL: "https://mydomain.com/b2c/queue",
        ResultURL: "https://mydomain.com/b2c/result",
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

// Get account_balance
exports.account_balance = (req, res) => {
    const token = req.token;
    const url = "https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query";

    const headers = {
        Authorization: 'Bearer ' + token
    }

    let data = {
        InitiatorName: "testapi",
        SecurityCredential: encryptedPassword(),
        CommandID: "AccountBalance",
        PartyA: shortcode,
        IdentifierType: "4",
        Remarks: "bal",
        QueueTimeOutURL: "http://197.248.86.122:801/bal_timeout",
        ResultURL: "http://197.248.86.122:801/bal_result" 
    }

    axios
    .post(url, data, { headers })
    .then(response => {
        res.send(response.data)
        console.log(response.data)
    })
    .catch((error) => console.log(error))
};

// Reverse transaction
exports.reverse_transaction = (req, res) => {
    const token = req.token;
    const url = "https://sandbox.safaricom.co.ke/mpesa/reversal/v1/request";

    const headers = {
        Authorization: 'Bearer ' + token
    }

    let data = {
        InitiatorName: "testapi",
        SecurityCredential: encryptedPassword(),
        CommandID: "TransactionReversal",
        TransactionID: "NLJ11HAY8V",
        Amount: 100,
        ReceiverParty: shortcode,
        RecieverIdentifierType:"11",
        ResultURL: "http://197.248.86.122:801/reverse_result_url",
        QueueTimeOutURL: "http://197.248.86.122:801/reverse_timeout_url",
        Remarks: "Wrong Num",
        Occasion: "sent wrongly"
    }

    axios
    .post(url, data, { headers })
    .then(response => {
        res.send(response.data)
        console.log(response.data)
    })
    .catch((error) => console.log(error))
};