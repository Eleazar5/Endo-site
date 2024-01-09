const express = require('express');
const router = express.Router();

const {
    getAfricaAccountBal,
    sendAfricaMessage
} = require('../controllers/Messages');

const {
    authMiddleware
} = require('../validators/auth')

router.get('/africa_bal', authMiddleware, getAfricaAccountBal);
router.post('/send_sms', authMiddleware, sendAfricaMessage);

module.exports =router;

