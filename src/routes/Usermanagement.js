const express = require('express');
const router = express.Router();

const {
    updateAuthCrons,
    signup,
    signin,
    resendOtp,
    otpAuth,
    getusers,
    getuserspagination,
    uploadFile
} = require('../controllers/Usermanagement');

const {
    authMiddleware
} = require('../validators/auth')

const {
    upload
} = require('../helpers/General')

updateAuthCrons();

router.post('/sign_up', signup);
router.post('/sign_in', signin);
router.post('/resend_otp', resendOtp);
router.post('/confirm_otp', otpAuth);
router.get('/users', authMiddleware, getusers);
router.get('/users_list', authMiddleware, getuserspagination);

router.post('/file_upload', upload, uploadFile);

module.exports =router;