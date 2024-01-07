const express = require('express');
const router = express.Router();

const {
    updateAuthCrons,
    signup,
    signin,
    otpAuth,
    getusers,
    getuserspagination
} = require('../controllers/Usermanagement');

const {
    authMiddleware
} = require('../validators/auth')

updateAuthCrons();

router.post('/sign_up', signup);
router.post('/sign_in', signin);

router.post('/confirm_otp', otpAuth);
router.get('/users', authMiddleware, getusers);
router.get('/users_list', authMiddleware, getuserspagination);

module.exports =router;