const axios = require('axios');

const { 
    VERIFY_TOKEN,
    WHATSAPP_TOKEN 
  }= process.env;

exports.whatsapppost_webhook = (req, res) => {
  // Parse the request body from the POST
  let body_params = req.body;
  console.log(JSON.stringify(body_params, null, 2));

  if (body_params.object === "page") {
    if (
      body_params.entry &&
      body_params.entry[0].changes &&
      body_params.entry[0].changes[0] &&
      body_params.entry[0].changes[0].value.messages &&
      body_params.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;;
      let from = req.body.entry[0].changes[0].value.messages[0].from;
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;
      
      axios({
        method: "POST",
        url:
          "https://graph.facebook.com/v16.0/" +
          phone_number_id +
          "/messages?access_token=" +
          WHATSAPP_TOKEN,
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
        console.log(err);
    });
    }
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
};

exports.whatsappget_webhook = (req, res) => {
  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
};