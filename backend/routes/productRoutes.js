const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', ctrl.listProducts);
router.get('/farmer/mine', authenticate, authorize('farmer'), ctrl.myProducts);
router.get('/:id', ctrl.getProduct);
router.post('/', authenticate, authorize('farmer'), ctrl.createProduct);
router.put('/:id', authenticate, authorize('farmer', 'admin'), ctrl.updateProduct);
router.delete('/:id', authenticate, authorize('farmer', 'admin'), ctrl.deleteProduct);

module.exports = router;
