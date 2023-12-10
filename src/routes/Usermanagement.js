const express = require('express');
const router = express.Router();

const {
    updateLogintrials,
    signup,
    signin,
    otpAuth
} = require('../controllers/Usermanagement');

updateLogintrials();

router.post('/sign_up', signup);
router.post('/sign_in', signin);
router.post('/confirm_otp', otpAuth);

module.exports =router;