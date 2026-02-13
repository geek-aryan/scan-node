const router = require('express').Router();
const vendorMenuItemController = require('../../controllers/vendor/vendorMenuItemController');
const { adminAuth } = require('../../middlewares/auth');

router.get('/menu-items-by-category', vendorMenuItemController.getMenuItemsByCategory);
router.put('/update-menu-item/:id', adminAuth, vendorMenuItemController.updateMenuItem);

module.exports = router;