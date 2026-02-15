const userCartController = require('../../controllers/order/userCartController');
const router = require('express').Router();
const { userAuth } = require('../../middlewares/auth');

router.post('/add-remove-cart-item', userAuth, userCartController.addRemoveUserCartItem);
router.get('/get-user-cart', userAuth, userCartController.getUserCart);
router.get('/get-user-cart-v2', userAuth, userCartController.getUserCartV2);
router.get('/get-user-cart-by-vendor-id/:vendorId', userAuth, userCartController.getUserCartByVendorId)
router.get('/get-user-checkout-cart', userAuth, userCartController.getUserCheckoutCart);

module.exports = router;