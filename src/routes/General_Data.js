const express = require('express');
const router = express.Router();

const {
    worldCountries
} = require('../controllers/General_Data');

const {
    isAuth
} = require('../controllers/Usermanagement')
router.get('/countries', isAuth, worldCountries);

module.exports =router;

