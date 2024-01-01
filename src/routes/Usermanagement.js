const express = require('express');
const router = express.Router();

const {
    updateAuthCrons,
    signup,
    signin,
    otpAuth
} = require('../controllers/Usermanagement');

updateAuthCrons();

router.post('/sign_up', signup);
router.post('/sign_in', signin);
router.post('/confirm_otp', otpAuth);

module.exports =router;