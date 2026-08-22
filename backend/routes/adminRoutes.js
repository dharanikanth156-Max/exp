const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));
router.get('/farmers', ctrl.listFarmers);
router.put('/farmers/:id/approve', ctrl.approveFarmer);
router.put('/users/:id/suspend', ctrl.setUserActive);
router.get('/customers', ctrl.listCustomers);
router.get('/products', ctrl.listAllProducts);
router.get('/orders', ctrl.listAllOrders);
router.get('/sales', ctrl.salesSummary);

module.exports = router;
