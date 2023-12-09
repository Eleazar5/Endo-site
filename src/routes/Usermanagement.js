const express = require('express');
const router = express.Router();

const {
    signup
} = require('../controllers/Usermanagement');
router.post('/sign_up', signup);

module.exports =router;