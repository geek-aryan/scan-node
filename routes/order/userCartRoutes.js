const userCartController = require('../../controllers/order/userCartController');
const router = require('express').Router();
const { userAuth } = require('../../middlewares/auth');

router.post('/add-remove-cart-item', userAuth, userCartController.addRemoveUserCartItem);
router.get('/get-user-cart', userAuth, userCartController.getUserCart);
router.get('/get-user-checkout-cart', userAuth, userCartController.getUserCheckoutCart);

module.exports = router;