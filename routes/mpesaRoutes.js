const express = require('express');
const router = express.Router();

const {
    home,
    tokenauth,
    stkpush,
    transactionstatus,
    registerurl,
    c2b_simulate,
    confirmation,
    validation,
    b2c_request,
    account_balance,
    reverse_transaction
} = require('../controllers/mpesaControllers');
router.get('/', home);
router.post('/token', tokenauth, stkpush);
router.post('/transactionstatus', tokenauth, transactionstatus);
router.post('/registerurl', tokenauth, registerurl);
router.post('/c2b_simulate', tokenauth, c2b_simulate);
router.get('/confirmation', confirmation);
router.get('/validation', validation);
router.post('/b2c_request', tokenauth, b2c_request);
router.post('/account_balance', tokenauth, account_balance);
router.post('/reverse_transaction', tokenauth, reverse_transaction);

module.exports =router;

