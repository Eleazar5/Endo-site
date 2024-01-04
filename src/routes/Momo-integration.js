const express = require('express');
const router = express.Router();

const {
    createUser,
    generateApiKey,
    generateAccessToken,
    requestToPay
} = require('../controllers/Momo-integration');

router.post('/create_momo_user', createUser, generateApiKey);
router.post('/request_to_pay', generateAccessToken, requestToPay);

module.exports =router;

