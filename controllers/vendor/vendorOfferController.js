const { literal, Op } = require('sequelize');
const Vendor = require('../../models/vendor/vendor');
const VendorOffer = require('../../models/vendor/vendorOffer');
const VendorOfferMapping = require('../../models/vendor/vendorOfferMapping');
const { errorResponse, successResponse } = require('../../utils/responseUtils');

const createVendorOffer = async (req, res) => {
    try {
        const myBody = req.body;
        const newOffer = await VendorOffer.create(myBody);
        return successResponse({ res, data: newOffer, message: 'Vendor Offer created successfully' });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error, status: 400 });
    }
};

const updateVendorOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await VendorOffer.findByPk(id);
        if (!offer) {
            return errorResponse({ res, message: 'Offer not found!', status: 404 });
        }
        await offer.update(req.body);
        return successResponse({ res, data: offer, message: 'Vendor Offer updated successfully' });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error, status: 400 });
    }
};

const getVendorOfferById = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await VendorOffer.findByPk(id);
        if (!offer) {
            return errorResponse({ res, message: 'Offer not found!', status: 404 });
        }
        return successResponse({ res, data: offer, message: 'Vendor Offer fetched successfully' });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error, status: 400 });
    }
};

const mapOfferToVendors = async (req, res) => {
    try {
        const { offerId, vendorIds } = req.body;
        const offer = await VendorOffer.findByPk(offerId);
        if (!offer) {
            return errorResponse({ res, message: 'Offer not found!', status: 404 });
        }
        const mappings = [];
        for (const vendorId of vendorIds) {
            const vendor = await Vendor.findByPk(vendorId);
            if (vendor) {
                const mapping = await VendorOfferMapping.create({
                    vendorId,
                    offerId
                });
                mappings.push(mapping);
            }
        }
        return successResponse({ res, data: mappings, message: 'Offer mapped to vendors successfully' });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error, status: 400 });
    }
};

const getOffersByOfferCategory = async (req, res) => {
    try {
        const { offerCategory } = req.query;
        let whereClause = {};
        if (offerCategory) {
            whereClause.offerCategory = offerCategory;
        }
        const offers = await VendorOffer.findAll({
            where: whereClause,
            // attributes: ['id', 'offerType', 'offerCategory', 'offerTitle', 'offerDescription', 'termAndCondition', 'offerValidityTill'],
            // order: [['sequenceNo', 'ASC']],
        });
        const offerIds = offers.map(offer => offer.id);
        const mappings = await VendorOfferMapping.findAll({
            where: {
                offerId: offerIds,
                status: true,
            },
            attributes: ['id', 'vendorId', 'offerId'],
            include: [{
                model: Vendor,
                attributes: ['id', 'shopName'],
            }, {
                model: VendorOffer,
                attributes: ['id', 'offerType', 'offerCategory', 'offerTitle', 'offerDescription', 'termAndCondition', 'offerValidityTill'],
            }],
        });
        return successResponse({ res, data: mappings, message: 'Offers fetched successfully' });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error, status: 400 });
    }
};

const getVendorsByOfferId = async (req, res) => {
    try {
        const { offerId } = req.query;
        const mappings = await VendorOfferMapping.findAll({
            where: {
                offerId,
                status: true,
            },
            attributes: ['id', 'vendorId', 'offerId'],
            // include: [{
            //     model: Vendor,
            //     attributes: ['id', 'shopName'],
            // }],
        });
        const vendorIds = mappings.map(mapping => mapping.vendorId);
        const lat = Number(req.query.latitude);
        const lng = Number(req.query.longitude);

        const hasValidLocation =
            Number.isFinite(lat) && Number.isFinite(lng);
        let nearByVendors = [];

        if (hasValidLocation) {
            // 🌍 Vendors near the provided location
            nearByVendors = await Vendor.findAll({
                where: {
                    id: vendorIds,
                },
                attributes: [
                    'id',
                    'title',
                    'shopName',
                    'image',
                    'isOfferAvalailable',
                    'averageRating',
                    'reviewCount',
                    [
                        literal("ST_Distance_Sphere(POINT(longitude, latitude), POINT(" + lng + ", " + lat + ")) / 1000"),
                        'distance'
                    ]
                ],
                order: [[literal('distance'), 'ASC']],
                // limit: 10
            });
        } else {
            // 🌍 Fallback vendors
            nearByVendors = await Vendor.findAll({
                where: {
                    id: vendorIds,
                },
                attributes: [
                    'id',
                    'title',
                    'shopName',
                    'image',
                    'isOfferAvalailable',
                    'averageRating',
                    'reviewCount'
                ],
                order: [['averageRating', 'DESC']],
                // limit: 10
            });
        }
        return successResponse({ res, data: nearByVendors, message: 'Vendors fetched successfully' });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error, status: 400 });
    }
};

const searchVendorOffers = async (req, res) => {
    try {
        const word = req.query.word;
        const nowDate = new Date();
        const offers = await VendorOffer.findAll({
            where: {
                [Op.or]: [{
                    offerType: {
                        [Op.like]: `%${word}%`
                    }
                }, {
                    offerCategory: {
                        [Op.like]: `%${word}%`
                    }
                }, {
                    offerTitle: {
                        [Op.like]: `%${word}%`
                    }
                }, {
                    offerDescription: {
                        [Op.like]: `%${word}%`
                    }
                }, {
                    termAndCondition: {
                        [Op.like]: `%${word}%`
                    }
                }],
                offerValidityTill: {
                    [Op.gte]: nowDate
                },
                status: true,
            },
            attributes: ['id'],
        });
        const vendors = await Vendor.findAll({
            where: {
                shopName: {
                    [Op.like]: `%${word}%`
                }
            }
        });
        const vendorIds = vendors.map(vendor => vendor.id);

        const offerIds = offers.map(offer => offer.id);
        const mappings = await VendorOfferMapping.findAll({
            where: {
                [Op.or]: [
                    {
                        vendorId: vendorIds,
                    },
                    {
                        offerId: offerIds,
                    }
                ]
                // status: true,
            },
            attributes: ['id', 'vendorId', 'offerId'],
            include: [{
                model: Vendor,
                attributes: ['id', 'shopName'],
            }, {
                model: VendorOffer,
                attributes: ['id', 'offerType', 'offerCategory', 'offerTitle', 'offerDescription', 'termAndCondition', 'offerValidityTill'],
            }],
        });
        return successResponse({ res, data: mappings, message: 'Offers fetched successfully' });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error, status: 400 });
    }
};



module.exports = {
    createVendorOffer,
    updateVendorOffer,
    getVendorOfferById,
    mapOfferToVendors,
    getOffersByOfferCategory,
    getVendorsByOfferId,
    searchVendorOffers
};