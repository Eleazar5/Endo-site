const axios = require('axios');
const qs = require('qs');

//Get africa's talking balace
exports.getAfricaAccountBal = (req, res) => {
    const username = ""
    const _apiKey = ""
    let config = {
      method: 'get',
      url: `https://api.africastalking.com/version1/user?username=${username}`,
      headers: { 
        'Accept': 'application/json', 
        'Content-Type': 'application/x-www-form-urlencoded', 
        'apiKey': _apiKey
      }
    };

    axios.request(config)
    .then((response) => {
       res.send(response.data.UserData);
    })
    .catch((error) => {
      res.status(500).send({ error: 'Error in getting the balance' });
    })
  
}

exports.sendAfricaMessage = (req, res) => {
    const {
        phone,
        message
    } = req.body;

    let data = qs.stringify({
      'username': '',
      'from': '',
      'to': phone,
      'message': message 
    });
    
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.africastalking.com/version1/messaging',
      headers: { 
        'apikey': '', 
        'Content-Type': 'application/x-www-form-urlencoded', 
        'Accept': 'application/json'
      },
      data : data
    };
    
    console.log(config)
    axios.request(config)
    .then((response) => {
        res.send(response.data);
    })
    .catch((error) => {
        res.status(500).send({ error: 'Error in sending the message' });
    });
    
}