const router = require('express').Router();
const vendorMenuItemController = require('../../controllers/vendor/vendorMenuItemController');

router.get('/menu-items-by-category', vendorMenuItemController.getMenuItemsByCategory);

module.exports = router;