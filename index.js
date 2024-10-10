const express = require('express');
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const {swaggerDocs} = require('./src/utils/swagger');
const path = require('path');

require('dotenv').config();
const { 
  SERVER_PORT,
  SERVER_HOST,
  DBTYPE
}= process.env;

// const corsOptions = {
//   origin: ['http://localhost:4200', 'http://localhost:8100'],
//   optionsSuccessStatus: 200
// };

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(session({
  secret: 'block_density',
  resave: false,
  saveUninitialized: false
}))

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, 'src/library/images');
app.use('/images', express.static(uploadDir));

const mpesaroute = require('./src/routes/Mpesa');
const momoroute = require('./src/routes/Momo-integration');
const messages = require('./src/routes/Messages');
const notificationroute = require('./src/routes/Notifications');
const generaldataroute = require('./src/routes/General_Data');
const equitybankroute = require('./src/routes/Bank');
const airtelmoneyroute = require('./src/routes/Airtel');

let usermanagement;
let ruwenzoriroute;
let ussdroute;
let whatsapproute;

switch(DBTYPE) {
  case 'ormpostgres':
    usermanagement = require('./src/routes/mySQL/Usermanagement');
    ruwenzoriroute = require('./src/routes/mySQL/Ruwenzori');
    ussdroute = require('./src/routes/mySQL/Ussd');
    whatsapproute = require('./src/routes/mySQL/Whatsapp');
    break;
  case 'ormmongo':
    usermanagement = require('./src/routes/mySQL/Usermanagement');
    ruwenzoriroute = require('./src/routes/mySQL/Ruwenzori');
    ussdroute = require('./src/routes/mySQL/Ussd');
    whatsapproute = require('./src/routes/mySQL/Whatsapp');
    break;
  case 'ormsql':
    usermanagement = require('./src/helpers/orm/routes/Usermanagement');
    ruwenzoriroute = require('./src/routes/mySQL/Ruwenzori');
    ussdroute = require('./src/routes/mySQL/Ussd');
    whatsapproute = require('./src/routes/mySQL/Whatsapp');
    break;
  default:
    usermanagement = require('./src/routes/mySQL/Usermanagement');
    ruwenzoriroute = require('./src/routes/mySQL/Ruwenzori');
    ussdroute = require('./src/routes/mySQL/Ussd');
    whatsapproute = require('./src/routes/mySQL/Whatsapp');
}

app.use('/transactions', mpesaroute);
app.use('/momo', momoroute);
app.use('/message', messages);
app.use('/auth', usermanagement);
app.use('/api', generaldataroute);
app.use('/ussdapi', ussdroute);
app.use('/notifications', notificationroute);
app.use('/whatsapp', whatsapproute);
app.use('/equitybank', equitybankroute);
app.use('/airtelmoney', airtelmoneyroute);
app.use('/ruwenzori', ruwenzoriroute);

app.listen({ port: SERVER_PORT, host: SERVER_HOST }, err => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`server listening on ${SERVER_HOST}:${SERVER_PORT}`);
  swaggerDocs(app, SERVER_PORT);
})