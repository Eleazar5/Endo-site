const express = require('express');
const router = express.Router();

const {
    getwebhook
} = require('../controllers/Notifications');
router.post('/', getwebhook);

module.exports =router;