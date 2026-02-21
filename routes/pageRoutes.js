const router = require('express').Router();

const pageController = require('../controllers/pageController');
const { userAuth, adminAuth } = require('../middlewares/auth');

const createUploader = require('../middlewares/multer');

const uploadAnnouncementImage = createUploader({
  fieldRules: {
    image: {
      extensions: ['.jpg', '.jpeg', '.png', '.webp'],
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSize: 5 * 1024 * 1024 // 5MB
    }
  },
  limits: {
    fileSize: 40 * 1024 * 1024 // 50MB (adjust if needed)
  }
});

router.get('/home', userAuth, pageController.getHomePageData);
router.post('/add-update-about-us', adminAuth, pageController.addUpdateAboutUs);
router.get('/about-us', pageController.getAboutUs);
router.post('/add-update-help-support', adminAuth, pageController.addUpdateHelpAndSupport);
router.get('/help-support', pageController.getHelpAndSupport);
router.post('/add-update-html-page', adminAuth, pageController.addUpdateHtmlPageContent);
router.get('/get-html-page', pageController.getHtmlPageContent);
router.post('/add-announcement', adminAuth, uploadAnnouncementImage.single('image'), pageController.addAnnouncement);
router.put('/update-announcement/:id', adminAuth, uploadAnnouncementImage.single('image'), pageController.updateAnnouncement);
router.get('/get-all-announcements', adminAuth, pageController.getAllAnnouncements);
router.delete('/delete-announcement/:id', adminAuth, pageController.deleteAnnouncement);
router.get('/get-announcement-by-id/:id', adminAuth, pageController.getAnnouncementById);
router.get('/get-valid-announcements', pageController.getValidAnnouncements);


module.exports = router;