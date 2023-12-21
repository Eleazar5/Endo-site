const express = require('express');
const router = express.Router();

const {
    getwebhook,
    postwebhook
} = require('../controllers/Notifications');
router.get('/webhook', getwebhook);
router.post('/webhook', postwebhook);

module.exports =router;