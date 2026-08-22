const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/product/:productId', ctrl.getProductReviews);
router.post('/', authenticate, authorize('customer'), ctrl.addReview);
router.delete('/:id', authenticate, ctrl.deleteReview);

module.exports = router;
