const express = require('express');
const cors = require('cors')
const app = express();
var bodyParser = require('body-parser');
require('dotenv').config();
const port = process.env.PORT;

app.use(cors({
  // origin: 'http://localhost:3000',
  origin: 'https://nimble-yeot-0421ef.netlify.app',
  optionsSuccessStatus: 200
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const mpesaroute = require('./routes/mpesaRoutes');
app.use(mpesaroute)

app.listen(port || 3003, () => {
    console.log(`The app is running in port ${port}`);
})