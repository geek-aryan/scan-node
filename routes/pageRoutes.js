const router = require('express').Router();

const pageController = require('../controllers/pageController');
const { userAuth, adminAuth } = require('../middlewares/auth');

router.get('/home', userAuth, pageController.getHomePageData);
router.post('/add-update-about-us', adminAuth, pageController.addUpdateAboutUs);
router.get('/about-us', pageController.getAboutUs);
router.post('/add-update-help-support', adminAuth, pageController.addUpdateHelpAndSupport);
router.get('/help-support', pageController.getHelpAndSupport);
router.post('/add-update-html-page', adminAuth, pageController.addUpdateHtmlPageContent);
router.get('/get-html-page', pageController.getHtmlPageContent);

module.exports = router;