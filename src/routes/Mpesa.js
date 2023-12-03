const express = require('express');
const router = express.Router();

const {
    tokenauth,
    stkpush,
    registerurl,
    c2b_simulate,
    confirmation,
    validation,
    callbackurl,

    b2c_request,
    b2c_timeout_url,
    b2c_result_url,

    account_balance,
    bal_result,
    timeout_bal_result,

    transaction_status,
    transaction_status_result,
    timeout_status_result,

    reverse_transaction,
    reverse_result_url,
    timeout_result_url
} = require('../controllers/Mpesa');
router.post('/token', tokenauth, stkpush);
router.post('/callbackurl/:company', callbackurl);
router.post('/registerurl', tokenauth, registerurl);
router.post('/c2b_simulate', tokenauth, c2b_simulate);
router.get('/confirmation', confirmation);
router.get('/validation', validation);

router.post('/b2c_request', tokenauth, b2c_request);
router.post('/b2cqueue', b2c_timeout_url);
router.post('/b2cresult', b2c_result_url);

router.post('/account_balance', tokenauth, account_balance);
router.post('/bal_result', bal_result);
router.post('/bal_timeout', timeout_bal_result);

router.post('/transaction_status', tokenauth, transaction_status);
router.post('/status_result', transaction_status_result);
router.post('/timeout_result', timeout_status_result);

router.post('/reverse_transaction', tokenauth, reverse_transaction);
router.post('/reverse_result_url', reverse_result_url);
router.post('/timeout_result_url', timeout_result_url);

module.exports =router;

