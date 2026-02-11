const router = require('express').Router();

router.use('/admin', require('./users/adminRoutes'));
router.use('/building', require('./buildingRoutes'));
router.use('/user', require('./users/userRoutes'));
router.use('/vendor-category', require('./vendor/vendorCategoryRoutes'));
router.use('/page', require('./pageRoutes'));
router.use('/vendor', require('./vendor/vendorRoutes'));
router.use('/vendor-offer', require('./vendor/vendorOfferRoutes'));
router.use('/user-cart', require('./order/userCartRoutes'));
router.use('/vendor-menu-item', require('./vendor/vendorMenuItemRoutes'));

module.exports = router;