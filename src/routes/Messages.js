const express = require('express');
const router = express.Router();

const {
    getAfricaAccountBal
} = require('../controllers/Messages');

router.get('/africa_bal', getAfricaAccountBal);

module.exports =router;

