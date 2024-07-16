const express = require('express');
const router = express.Router();

const {
    worldCountries,
    checkServerAlive,
    generatePDFandExportBase64
} = require('../controllers/General_Data');
const {
    upload,
    generateNewPDF
} = require('../helpers/General')

const {
    isAuth
} = require('../validators/auth')
router.get('/countries', worldCountries);
router.get('/serverstatus', checkServerAlive);
router.get('/generatepdf', upload, generatePDFandExportBase64);

module.exports =router;

