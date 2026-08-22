const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/checkout', authenticate, authorize('customer'), ctrl.checkout);
router.get('/mine', authenticate, authorize('customer'), ctrl.myOrders);
router.get('/farmer/mine', authenticate, authorize('farmer'), ctrl.farmerOrders);
router.get('/:id/track', authenticate, ctrl.trackOrder);
router.put('/item/:orderItemId/status', authenticate, authorize('farmer', 'admin'), ctrl.updateOrderItemStatus);

module.exports = router;
