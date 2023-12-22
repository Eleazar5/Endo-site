const express = require('express');
const cors = require('cors')
const app = express();
var bodyParser = require('body-parser');

require('dotenv').config();
const { 
  SERVER_PORT,
  SERVER_HOST 
}= process.env;

app.use(cors({
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const mpesaroute = require('./src/routes/Mpesa');
const notificationroute = require('./src/routes/Notifications');
const usermanagement = require('./src/routes/Usermanagement');
const generaldataroute = require('./src/routes/General_Data');
const ussdroute = require('./src/routes/Ussd');

app.use('/transactions', mpesaroute)
app.use('/notifications', notificationroute)
app.use('/auth', usermanagement)
app.use('/api', generaldataroute)
app.use('/ussdapi', ussdroute)

app.listen({ port: SERVER_PORT, host: SERVER_HOST }, err => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`server listening on ${SERVER_HOST}:${SERVER_PORT}`);
})