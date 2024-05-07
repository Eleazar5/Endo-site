const express = require('express');
const router = express.Router();

const {
    accountBalance,
    authToken
} = require('../controllers/Bank');
router.post('/account_balance', authToken, accountBalance);

module.exports =router;

