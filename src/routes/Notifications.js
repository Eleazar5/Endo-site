const express = require('express');
const router = express.Router();

const {
    getNotification
} = require('../controllers/Notifications');
router.get('/', getNotification);

module.exports =router;