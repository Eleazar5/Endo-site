const token = process.env.WHATSAPP_TOKEN;
const verify_token = process.env.VERIFY_TOKEN;

// Validation URL
exports.getNotification = (req, res) => {
    const resObject = {
        ResultDesc:"Confirmation Service request accepted successfully",
        ResultCode:"0"
    };
    res.send(resObject);
};

// Accepts POST requests at /webhook endpoint
exports.postwebhook = (req, res) => {
  // Parse the request body from the POST
  let body_params = req.body;

  // Check the Incoming webhook message
  //const myData = JSON.stringify(body_params.entry[0].changes[0], null, 2)
  console.log(JSON.stringify(body_params, null, 2));

  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (body_params.object === "page") {
    if (
      body_params.entry &&
      body_params.entry[0].changes &&
      body_params.entry[0].changes[0] &&
      body_params.entry[0].changes[0].value.messages &&
      body_params.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;;
      let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
      
      axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v16.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: { body: msg_body },
        },
        headers: { 
          "Content-Type": "application/json" 
        },
      })
      .then(res => {
        res.status(200).send(JSON.stringify(body_params, null, 2));
      })
      .catch(err => {
        //console.log(err);
    });
    }
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
};

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests 
exports.getwebhook = (req, res) => {
  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
};