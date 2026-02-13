const router = require('express').Router();
const vendorController = require('../../controllers/vendor/vendorController');
const { adminAuth, userAuth } = require('../../middlewares/auth');
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
router.get('/get-vendor-by-id/:id', userAuth, vendorController.getVendorById);
router.get('/get-all-vendors', vendorController.getAllVendors);
router.get('/get-nearby-vendors-by-category-id', vendorController.getNearByVendorsByCategoryId);
router.get('/get-vendor-details-by-id', userAuth, vendorController.getVendorInfoById);
router.post('/add-vendor-menu', adminAuth, uploadVendorImage.single('image'), vendorController.addVendorMenu);
router.post('/add-vendor-gallery-image', adminAuth, uploadVendorImage.single('image'), vendorController.addVendorGalleryImage);

module.exports = router;