const express = require('express');
const router = express.Router();

const {
    worldCountries
} = require('../controllers/General_Data');
router.get('/countries', worldCountries);

module.exports =router;

