const express = require('express');
const router = express.Router();

const {
    authToken,
    accountBalance
} = require('../controllers/Airtel');
router.post('/account_balance', authToken, accountBalance);

module.exports =router;

