const router = require('express').Router();
const vendorCategoryController = require('../../controllers/vendor/vendorCategoryController');
const { adminAuth } = require('../../middlewares/auth');

const createUploader = require('../../middlewares/multer');


const uploadVendorCategoryImage = createUploader({
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




router.post('/add-vendor-category', adminAuth, uploadVendorCategoryImage.single('image'), vendorCategoryController.addVendorCategory);
router.post('/add-vendor-sub-category', adminAuth, uploadVendorCategoryImage.single('image'), vendorCategoryController.addVendorSubCategory);
router.get('/get-vendor-sub-categories', vendorCategoryController.getVendorSubCategories);
router.get('/get-vendor-categories', vendorCategoryController.getVendorCategories);
router.put('/update-vendor-category/:id', adminAuth, uploadVendorCategoryImage.single('image'), vendorCategoryController.updateVendorCategory);


module.exports = router;