const express = require('express');
const router = express.Router();

const {
    newCustomer,
    getCustomerspagination,
    updateCustomer,
    newVendor,
    getVendorspagination,
    updateVendor,
    newSale,
    getSalespagination,
    updateSale,
    newProduct,
    getProductspagination,
    updateProduct,
    getDashboardData
} = require('../controllers/Ruwenzori');

router.post('/new_customer', newCustomer);
router.get('/customers', getCustomerspagination);
router.put('/update_customer/:id', updateCustomer);
router.post('/new_vendor', newVendor);
router.get('/vendors', getVendorspagination);
router.put('/update_vendor/:id', updateVendor);
router.post('/new_sale', newSale);
router.get('/sales', getSalespagination);
router.put('/update_sale/:id', updateSale);
router.post('/new_product', newProduct);
router.get('/products', getProductspagination);
router.put('/update_product/:id', updateProduct);
router.get('/count_stats', getDashboardData);

module.exports =router;