const router = require('express').Router();
const vendorOfferController = require('../../controllers/vendor/vendorOfferController');
const { adminAuth, adminOrVendorAuth } = require('../../middlewares/auth');


router.post('/create-vendor-offer', adminOrVendorAuth, vendorOfferController.createVendorOffer);
router.put('/update-vendor-offer/:id', adminOrVendorAuth, vendorOfferController.updateVendorOffer);
router.get('/get-all-vendor-offers', adminOrVendorAuth, vendorOfferController.getAllVendorOffers);
router.get('/get-all-offers-by-vendor-id/:vendorId', vendorOfferController.getAllOffersByVendorId);
router.get('/get-vendor-offer-by-id/:id', vendorOfferController.getVendorOfferById);
router.post('/map-offer-to-vendors', adminOrVendorAuth, vendorOfferController.mapOfferToVendors);
router.get('/get-offers-by-offer-category', vendorOfferController.getOffersByOfferCategory);
router.get('/get-vendor-by-offer-id', vendorOfferController.getVendorsByOfferId);
router.get('/search-vendor-offers', vendorOfferController.searchVendorOffers);


module.exports = router;