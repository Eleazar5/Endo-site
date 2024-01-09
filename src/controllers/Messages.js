const axios = require('axios');
//Get africa's talking balace
exports.getAfricaAccountBal = (req, reply, fastify) => {
    const username = "CFT"
    const _apiKey = "0274ce4aa073c1ff12ed3a387c50493f381ce55fbf90609b34310c4ebbf30a2b"
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
       reply.send(response.data.UserData);
    })
    .catch((error) => {
      reply.status(500).send({ error: 'Error in getting the balance' });
    })
  
}