const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cartController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('customer'));
router.get('/', ctrl.getCart);
router.post('/', ctrl.addToCart);
router.put('/:cartItemId', ctrl.updateCartItem);
router.delete('/:cartItemId', ctrl.removeCartItem);
router.delete('/', ctrl.clearCart);

module.exports = router;
