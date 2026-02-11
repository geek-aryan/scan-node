const router = require('express').Router();
const vendorOfferController = require('../../controllers/vendor/vendorOfferController');
const { adminAuth } = require('../../middlewares/auth');


router.post('/create-vendor-offer', adminAuth, vendorOfferController.createVendorOffer);
router.post('/map-offer-to-vendors', adminAuth, vendorOfferController.mapOfferToVendors);
router.get('/get-offers-by-offer-category', vendorOfferController.getOffersByOfferCategory);
router.get('/get-vendor-by-offer-id', vendorOfferController.getVendorsByOfferId);
router.get('/search-vendor-offers', vendorOfferController.searchVendorOffers);


module.exports = router;