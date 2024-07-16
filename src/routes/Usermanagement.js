const express = require('express');
const router = express.Router();

const {
    updateAuthCrons,
    signup,
    signin,
    login,
    resendOtp,
    otpAuth,
    getusers,
    getuserspagination,
    uploadFile,
    uploadAndConvertFile
} = require('../controllers/Usermanagement');

const {
    authMiddleware,
    tokenVerify
} = require('../validators/auth')

const {
    upload
} = require('../helpers/General')

updateAuthCrons();

router.post('/sign_up', signup);
router.post('/sign_in', signin);
router.post('/login', login);
router.post('/resend_otp', resendOtp);
router.post('/confirm_otp', otpAuth);
router.get('/users', authMiddleware, getusers);
router.get('/user', getusers);
router.post('/authenticated', tokenVerify);
router.get('/users_list', authMiddleware, getuserspagination);

router.post('/file_upload', upload, uploadFile);
router.post('/file_upload_base64convert', upload, uploadAndConvertFile);

module.exports =router;