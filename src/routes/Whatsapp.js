const express = require('express');
const router = express.Router();

const {
    whatsapppost_webhook,
    whatsappget_webhook
} = require('../controllers/Whatsapp');
// router.post('/webhook', whatsapppost_webhook);
// router.get('/webhook', whatsappget_webhook);

module.exports =router;