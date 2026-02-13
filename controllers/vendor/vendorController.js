const Vendor = require('../../models/vendor/vendor');
const { successResponse, errorResponse } = require('../../utils/responseUtils');
const { fn, col, literal } = require('sequelize');
const VendorMenuItems = require('../../models/vendor/vendorMenu');
const VendorGallery = require('../../models/vendor/vendorGallery');
const VendorOfferMapping = require('../../models/vendor/vendorOfferMapping');
const VendorOffer = require('../../models/vendor/vendorOffer');
const UserCart = require('../../models/order/userCart');


const addVendor = async (req, res) => {
  try {
    console.log(req.body)
    const image = req.file ? req.file.filename : null;
    if (!image) {
      return errorResponse({ res, error: 'Image is required', status: 422 });
    }
    const newVendor = await Vendor.create({
      ...req.body,
      image
    });
    return successResponse({ res, data: newVendor, message: 'Vendor added successfully', status: 200 });
  } catch (error) {
    console.error('Error adding vendor:', error);
    return errorResponse({ res, error: 'Failed to add vendor', status: 500 });
  }
};

const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const image = req.file ? req.file.filename : null;
    if (image) {
      req.body.image = image;
    }
    const updatedVendor = await Vendor.update(
      { ...req.body },
      { where: { id } }
    );
    if (updatedVendor[0] === 0) {
      return errorResponse({ res, error: 'Vendor not found or no changes made', status: 404 });
    }
    return successResponse({ res, data: updatedVendor, message: 'Vendor updated successfully', status: 200 });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return errorResponse({ res, error: 'Failed to update vendor', status: 500 });
  }
};

const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findByPk(id, {
      attributes: [
        'id',
        'title',
        'shopName',
        'image',
        'isOfferAvalailable',
        'averageRating',
        'reviewCount',
        'description',
        'address',
        'phone',
        'whatsappNumber',
        'timings',
        'websiteLink',
        'otherLink'
      ]
    });
    if (!vendor) {
      return errorResponse({ res, error: 'Vendor not found', status: 404 });
    }
    return successResponse({ res, data: vendor, message: 'Vendor fetched successfully', status: 200 });
  } catch (error) {
    console.error('Error fetching vendor by ID:', error);
    return errorResponse({ res, error: 'Failed to fetch vendor by ID', status: 500 });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.findAll({
      attributes: [
        'id',
        'vendorCategoryId',
        'email',
        'title',
        'shopName',
        'image',
        'isOfferAvalailable',
        'averageRating',
        'reviewCount',
        'description',
        'address',
        'phone',
        'whatsappNumber',
        'timings',
        'websiteLink',
        'otherLink',
        'latitude',
        'longitude'
      ]
    });
    return successResponse({ res, data: vendors, message: 'Vendors fetched successfully', status: 200 });
  } catch (error) {
    console.error('Error fetching all vendors:', error);
    return errorResponse({ res, error: 'Failed to fetch all vendors', status: 500 });
  }
};

const getNearByVendorsByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.query;
    // if(!categoryId)return errorResponse({res, error: 'Category Id is required!', status: 422});
    const lat = Number(req.query.latitude);
    const lng = Number(req.query.longitude);

    const hasValidLocation =
      Number.isFinite(lat) && Number.isFinite(lng);
    let nearByVendors = [];
    let whereClause = {};
    if (categoryId) {
      whereClause.vendorCategoryId = categoryId;
    }

    if (hasValidLocation) {
      // 🌍 Vendors near the provided location
      nearByVendors = await Vendor.findAll({
        where: whereClause,
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
        where: whereClause,
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

    return successResponse({ res, data: { nearByVendors }, message: 'Nearby vendors fetched successfully', status: 200 });
  } catch (error) {
    console.error('Error fetching nearby vendors:', error);
    return errorResponse({ res, error: 'Failed to fetch nearby vendors' });
  }
};

const getVendorInfoById = async (req, res) => {
  try {
    const { id } = req.query;
    const lat = Number(req.query.latitude);
    const lng = Number(req.query.longitude);

    const hasValidLocation =
      Number.isFinite(lat) && Number.isFinite(lng);
    const vendorAttributes = [
      'id',
      'title',
      'shopName',
      'image',
      'isOfferAvalailable',
      'averageRating',
      'reviewCount',
      'description',
      'address',
      'phone',
      'whatsappNumber',
      'timings',
      'websiteLink',
      'otherLink',
      'latitude',
      'longitude'
    ];
    if (hasValidLocation) {
      vendorAttributes.push([
        literal("ST_Distance_Sphere(POINT(longitude, latitude), POINT(" + lng + ", " + lat + ")) / 1000"),
        'distance'
      ]);
    }
    const vendorInfo = await Vendor.findByPk(id, {
      attributes: vendorAttributes,
    });
    if (!vendorInfo) return errorResponse({ res, error: 'vendor not found!', status: 404 });


    const menuItems = await VendorMenuItems.findAll({
      where: { vendorId: id },
      attributes: [
        'id',
        'itemName',
        'itemDescription',
        'markedPrice',
        'sellingPrice',
        'discountPercentage',
        'discountValue',
        'image',
        'isAvailable',
        'category',
        'maxQuantity',
        'totalAvailable',
        [
          literal(`
            CASE
              WHEN discountPercentage IS NOT NULL AND discountPercentage > 0
                THEN sellingPrice - (sellingPrice * discountPercentage / 100)
              WHEN discountValue IS NOT NULL AND discountValue > 0
                THEN sellingPrice - discountValue
              ELSE sellingPrice
            END
          `),
          'finalPrice'
        ]
      ],
      order: [['sequenceNo', 'ASC']],
    });

    const galleryImages = await VendorGallery.findAll({
      where: { vendorId: id },
      attributes: ['id', 'image'],
      order: [['createdAt', 'DESC']],
    });
    const vendorOfferMapping = await VendorOfferMapping.findAll({
      where: { vendorId: id },
      attributes: ['id', 'offerId', 'vendorId'],
      include: [{
        model: VendorOffer,
        attributes: ['id', 'offerType', 'offerCategory', 'offerTitle', 'offerDescription', 'termAndCondition', 'offerValidityTill'],
      }, {
        model: Vendor,
        attributes: ['id', 'shopName'],
      }],
    });

    const menuItemsWithQuantity = await Promise.all(menuItems.map(async (item) => {
      const buyQuantity = await UserCart.findOne({
        where: {
          userId: req.user.id,
          menuItemId: item.id
        },
        attributes: ['quantity']
      });
      item.dataValues.buyQuantity = buyQuantity ? buyQuantity.quantity : 0;
      return item;
    }));

    vendorInfo.dataValues.menuItems = menuItemsWithQuantity;
    vendorInfo.dataValues.galleryImages = galleryImages;
    vendorInfo.dataValues.vendorOffers = vendorOfferMapping;
    return successResponse({ res, data: vendorInfo, message: 'Vendor info fetched successfully', status: 200 });
  } catch (error) {
    console.log(error);
    return errorResponse({ res, error, status: 400 });
  }
};

const addVendorMenu = async (req, res) => {
  try {
    const myBody = { ...req.body };
    const image = req.file ? req.file.filename : null;
    if (!image) {
      return errorResponse({ res, error: 'Image is required', status: 422 });
    }
    myBody.image = image;
    const vendorMenuItems = await VendorMenuItems.create({ ...myBody });
    return successResponse({ res, data: vendorMenuItems, message: 'Vendor menu added successfully', status: 200 });
  } catch (error) {
    console.log(error);
    return errorResponse({ res, error });
  }
};

const addVendorGalleryImage = async (req, res) => {
  try {
    const myBody = { ...req.body };
    const image = req.file ? req.file.filename : null;
    if (!image) {
      return errorResponse({ res, error: 'Image is required', status: 422 });
    }
    myBody.image = image;
    const vendorGalleryImage = await VendorGallery.create({ ...myBody });
    return successResponse({ res, data: vendorGalleryImage, message: 'Vendor gallery image added successfully', status: 200 });
  } catch (error) {
    console.log(error);
    return errorResponse({ res, error });
  }
};




module.exports = {
  addVendor,
  updateVendor,
  getVendorById,
  getAllVendors,
  getNearByVendorsByCategoryId,
  getVendorInfoById,
  addVendorMenu,
  addVendorGalleryImage
};