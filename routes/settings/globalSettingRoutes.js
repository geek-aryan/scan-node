const router = require('express').Router();
const globalSettingsController = require('../../controllers/settings/globalSettingController');
const { adminAuth } = require('../../middlewares/auth');

router.get('/get-global-settings', adminAuth, globalSettingsController.getGlobalSettings);
router.post('/add-update-global-settings', adminAuth, globalSettingsController.addUpdateGlobalSettings);

module.exports = router;

//