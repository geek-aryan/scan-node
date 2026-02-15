const router = require('express').Router();
const vendorMenuItemController = require('../../controllers/vendor/vendorMenuItemController');
const { adminAuth, adminOrVendorAuth } = require('../../middlewares/auth');

router.get('/menu-items-by-category', vendorMenuItemController.getMenuItemsByCategory);
router.get('/menu-items-by-vendor', vendorMenuItemController.getMenuItemsByVendor);
router.put('/update-menu-item/:id', adminOrVendorAuth, vendorMenuItemController.updateMenuItem);

module.exports = router;