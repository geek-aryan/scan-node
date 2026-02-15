const router = require('express').Router();
const orderController = require('../../controllers/order/orderController');
const { userAuth, adminAuth } = require('../../middlewares/auth');


router.post('/create-order', userAuth, orderController.createOrder);
router.get('/get-user-order-history', userAuth, orderController.getUserOrderHistory);
router.get('/get-all-orders-by-payment-status', adminAuth, orderController.getAllOrdersByPaymentStatus);
router.get('/get-all-orders-for-vendor-by-payment-status', vendorAuth, orderController.getAllOrdersForVendorByPaymentStatus);
router.get('/get-order-by-id');

module.exports = router;

