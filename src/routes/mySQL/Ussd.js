const express = require('express');
const router = express.Router();

const {
    ussd
} = require('../../controllers/mySQL/Ussd');
router.post('/ussd', ussd);

module.exports =router;