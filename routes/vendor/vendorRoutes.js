const router = require('express').Router();
const vendorController = require('../../controllers/vendor/vendorController');
const { adminAuth, userAuth, vendorAuth, adminOrVendorAuth } = require('../../middlewares/auth');
const createUploader = require('../../middlewares/multer');


const uploadVendorImage = createUploader({
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



router.post('/add-vendor', adminAuth, uploadVendorImage.single('image'), vendorController.addVendor);
router.put('/update-vendor/:id', adminAuth, uploadVendorImage.single('image'), vendorController.updateVendor);
router.post('/generate-vendor-register-otp', vendorController.generateVendorRegisterOtp);
router.post('/verify-vendor-register-otp', uploadVendorImage.single('image'), vendorController.verifyVendorRegisterOtp);
router.post('/generate-forgot-vendor-password-otp', vendorController.generateForgotVendorPasswordOtp);
router.post('/verify-forgot-vendor-password-otp', vendorController.verifyForgotVendorPasswordOtp);
router.post('/vendor-login', vendorController.vendorLogin);
router.get('/get-vendor-by-id/:id', vendorController.getVendorById);
router.get('/get-all-vendors', vendorController.getAllVendors);
router.get('/get-nearby-vendors-by-category-id', vendorController.getNearByVendorsByCategoryId);
router.get('/get-vendor-details-by-id', userAuth, vendorController.getVendorInfoById);
router.post('/add-vendor-menu', adminOrVendorAuth, uploadVendorImage.single('image'), vendorController.addVendorMenu);


router.post('/add-vendor-gallery-image', adminOrVendorAuth, uploadVendorImage.single('image'), vendorController.addVendorGalleryImage);
router.get('/get-all-vendor-gallery-images-by-vendor-id/:vendorId', adminOrVendorAuth, vendorController.getAllVendorGalleryImagesByVendorId);
router.put('/update-vendor-gallery-image/:id', adminOrVendorAuth, uploadVendorImage.single('image'), vendorController.updateVendorGalleryImage);
router.delete('/delete-vendor-gallery-image/:id', adminOrVendorAuth, vendorController.deleteVendorGalleryImage);

router.get('/get-vendor-dashboard', vendorAuth, vendorController.getVendorDashboard);

module.exports = router;