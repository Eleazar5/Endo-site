const express = require('express');
const router = express.Router();

const {
    ussd
} = require('../controllers/Ussd');
router.post('/ussd', ussd);

module.exports =router;