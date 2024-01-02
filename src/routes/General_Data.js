const express = require('express');
const router = express.Router();

const {
    worldCountries
} = require('../controllers/General_Data');

const {
    isAuth
} = require('../validators/auth')
router.get('/countries', isAuth, worldCountries);

module.exports =router;

