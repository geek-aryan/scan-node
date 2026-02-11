const router = require('express').Router();

const userController = require('../../controllers/users/userController');
const { userAuth } = require('../../middlewares/auth');


const createUploader = require('../../middlewares/multer');


const uploadUserProfileImage = createUploader({
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



router.post('/generate-mobile-register-otp', userController.generateMobileRegisterOtp);
router.post('/verify-user-with-mobile-otp', userController.verifyUserWithMobileOtp);
router.put('/update-user-profile', userAuth,  userController.updateUserProfile);
router.get('/get-profile-status', userAuth, userController.checkUserProfileRegistered);
router.post('/social-login', userController.socialLogin);
router.get('/user-profile', userAuth, userController.getUserProfile);
router.post('/upload-photo', userAuth, uploadUserProfileImage.single('image'), userController.uploadPhoto);
router.post('/add-update-user-address-by-category', userAuth, userController.addUpdateUserAddressByAddressCategory);
router.get('/user-address-by-category', userAuth, userController.getUserAddressByAddressCategory);
router.delete('/delete-user-account', userAuth, userController.deleteUserAccount);

module.exports = router;