const connection = require('../helpers/dbConfig');

const newUser_data = (data, res) => {
    connection.query('INSERT INTO `tb_players` SET ?', data, function (err, results) {
        if (err) throw err;
        response = `END You have been registered as a ${data.position}`;
        setTimeout(() => {
          res.send(response);
          res.end();
        }, 1000);
      });
}
exports.ussd = (req, res) => {
    const { text, phoneNumber } = req.body;
    let response;
  
    switch (text) {
      case '':
        response = `CON Welcome to Alvare Stars
        1. Register
        2. Quit`;
        break;
      case '1':
        connection.query('SELECT * FROM tb_players WHERE tel = ? ', [phoneNumber], function (err, rows) {
          if (err) throw err;
          if (!rows.length) {
            response = `CON Choose your preferred position
              1. Goalkeeper
              2. Defender
              3. Midfielder
              4. Forward`;
          } else {
            response = `END The number is already registered`;
          }
          setTimeout(() => {
            console.log(text);
            res.send(response);
            res.end();
          }, 2000);
        });
        return; // Exit the function after initiating the query
      case '2':
        response = `END Thanks for visiting Alvare Stars`;
        break;
      case '1*1':
        response = `CON Enter your role
          1. Goalkeeper`;
        break;
      case '1*2':
        response = `CON Enter your role
          1. Left back
          2. Right back
          3. Center back`;
        break;
      case '1*3':
        response = `CON Enter your role
          1. Attacking midfielder
          2. Defending midfielder
          3. Central midfielder`
        break;
      case '1*4':
        response = `CON Enter your role
          1. Left winger
          2. Right winger
          3. Striker`
        break;
      case '1*1*1':
        var reg = {
          tel: phoneNumber,
          position: 'Goalkeeper',
          role: 'Goalkeeper',
        };
        newUser_data(reg, res);
        break;
      default:
        res.status(400).send('Bad request!');
        return;
    }
  
    setTimeout(() => {
      res.send(response);
      res.end();
    }, 2000);
  };
  