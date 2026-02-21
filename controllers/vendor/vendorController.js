const Vendor = require('../../models/vendor/vendor');
const { successResponse, errorResponse } = require('../../utils/responseUtils');
const { fn, col, literal, Op } = require('sequelize');
const VendorMenuItems = require('../../models/vendor/vendorMenu');
const VendorGallery = require('../../models/vendor/vendorGallery');
const VendorOfferMapping = require('../../models/vendor/vendorOfferMapping');
const VendorOffer = require('../../models/vendor/vendorOffer');
const UserCart = require('../../models/order/userCart');
const Otp = require('../../models/otps/otp');
const { OTP_TYPE, OTP_PAGE } = require('../../utils/enums/otpEnums');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


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

const vendorProfileUpdate = async (req, res) => {
  try {
    const { id } = req.user;
    const image = req.file ? req.file.filename : null;
    if (image) {
      req.body.image = image;
    }
    const updateVendor = await Vendor.update(
      { ...req.body },
      { where: { id } }
    );
    if (updateVendor[0] === 0) {
      return errorResponse({ res, error: 'Vendor not found or no changes made', status: 404 });
    }
    return successResponse({ res, data: updateVendor, message: 'Vendor updated successfully', status: 200 });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return errorResponse({ res, error: 'Failed to update vendor', status: 500 });
  }
};

const generateVendorRegisterOtp = async (req, res) => {
  try {
    const { phone, email, otpType } = req.body;
    const currentTime = new Date();
    let whereClause = {
      expiresAt: {
        [Op.gte]: currentTime,
      },
      isVerified: 0,
      otpType,
      forPage: OTP_PAGE.VENDOR_OTP_FOR_REGISTRATION,
    };
    if (otpType === OTP_TYPE.PHONE) {
      whereClause.phoneNumber = phone;
    } else if (otpType === OTP_TYPE.EMAIL) {
      whereClause.email = email;
    } else {
      return errorResponse({ res, error: 'Invalid OTP type!', status: 422 });
    }
    const alreadyOtps = await Otp.count({
      where: { ...whereClause }
    });
    if (alreadyOtps >= 5) {
      return errorResponse({ res, error: 'Otp Limit Reached!', status: 429 });
      // return res.status(400).json({ message: 'Otp Limit Reached!' });
    }
    // const otp = generateNDigitsOTP(6);
    const otp = '123456';
    const otpValidityMinutes = 10;
    let otpData = {};
    if (otpType === OTP_TYPE.PHONE) {
      otpData.phoneNumber = phone;
    } else if (otpType === OTP_TYPE.EMAIL) {
      otpData.email = email;
    }
    await Otp.create({
      ...otpData,
      otp: otp,
      otpType: otpType,
      forPage: OTP_PAGE.VENDOR_OTP_FOR_REGISTRATION,
      expiresAt: new Date(Date.now() + otpValidityMinutes * 60 * 1000)
    });

    return successResponse({ res, message: 'Otp sent successfully' });
    // return res.status(200).json({message: 'otp sent successfully'});

  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
    return errorResponse({ res, error, status: 400 });
  }
};

const verifyVendorRegisterOtp = async (req, res) => {
  try {
    const { phone, email, otp, otpType } = req.body;
    let whereClause = {
      otp,
      expiresAt: {
        [Op.gte]: new Date(),
      },
      isVerified: 0,
      otpType,
      forPage: OTP_PAGE.VENDOR_OTP_FOR_REGISTRATION,
    };
    let checkAlreadyVendor = {};

    if (otpType === OTP_TYPE.PHONE) {
      whereClause.phoneNumber = phone;
      checkAlreadyVendor.phone = phone;
    } else if (otpType === OTP_TYPE.EMAIL) {
      whereClause.email = email;
      checkAlreadyVendor.email = email;
    } else {
      return errorResponse({ res, error: 'Invalid OTP type!', status: 422 });
    }
    const alreadyVendor = await Vendor.findOne({
      where: checkAlreadyVendor
    });
    if (alreadyVendor) return errorResponse({ res, error: 'Vendor already exists with this phone number/email!', status: 409 });
    const verifyOtp = await Otp.findOne({
      where: whereClause
    });
    if (!verifyOtp) return errorResponse({ res, error: 'Invalid OTP', status: 400 });

    await verifyOtp.update({ isVerified: 1 });
    const image = req.file ? req.file.filename : "";
    const password = req.body.password ? req.body.password : null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      req.body.password = hashedPassword;
    }
    const vendor = await Vendor.create({
      phone: phone,
      email: email,
      image: image,
      ...req.body
    });
    const token = jwt.sign({ id: vendor.id, phone: vendor.phone, email: vendor.email, role: 'vendor' }, process.env.VENDOR_AUTH_SECRET_KEY, { expiresIn: '30d' });
    const extraObj = { token };
    const dataObj = { id: vendor.id, phone: vendor.phone, email: vendor.email, role: 'vendor' };


    return successResponse({ res, data: dataObj, extraObj, message: 'Vendor verified successfully' });
  } catch (error) {
    console.log(error);
    return errorResponse({ res, error, status: 400 });
  }
};

const generateForgotVendorPasswordOtp = async (req, res) => {
  try {
    const { phone, email, otpType } = req.body;
    let whereClause = {
      expiresAt: {
        [Op.gte]: new Date(),
      },
      isVerified: 0,
      otpType
    };
    if (otpType === OTP_TYPE.PHONE) {
      whereClause.phoneNumber = phone;
    } else if (otpType === OTP_TYPE.EMAIL) {
      whereClause.email = email;
    } else {
      return errorResponse({ res, error: 'Invalid OTP type!', status: 422 });
    }
    const alreadyVendor = await Vendor.findOne({
      where: otpType === OTP_TYPE.PHONE ? { phone: phone } : { email }
    });
    if (!alreadyVendor) return errorResponse({ res, error: 'Vendor not found with this phone number/email!', status: 404 });

    // const otp = generateNDigitsOTP(6);
    const otp = '123456';
    const otpValidityMinutes = 10;
    let otpData = {};
    if (otpType === OTP_TYPE.PHONE) {
      otpData.phoneNumber = phone;
    } else if (otpType === OTP_TYPE.EMAIL) {
      otpData.email = email;
    }
    await Otp.create({
      ...otpData,
      otp: otp,
      otpType: otpType,
      forPage: OTP_PAGE.VENDOR_FORGOT_PASSWORD,
      expiresAt: new Date(Date.now() + otpValidityMinutes * 60 * 1000)
    });

    return successResponse({ res, message: 'Otp sent successfully' });
  } catch (error) {
    console.log(error);
    return errorResponse({ res, error, status: 400 });
  }
};

const verifyForgotVendorPasswordOtp = async (req, res) => {
  try {
    const { phone, email, otp, otpType, newPassword } = req.body;
    let whereClause = {
      otp,
      expiresAt: {
        [Op.gte]: new Date(),
      },
      isVerified: 0,
      otpType,
      forPage: OTP_PAGE.VENDOR_FORGOT_PASSWORD,
    };
    let checkAlreadyVendor = {};

    if (otpType === OTP_TYPE.PHONE) {
      whereClause.phoneNumber = phone;
      checkAlreadyVendor.phone = phone;
    } else if (otpType === OTP_TYPE.EMAIL) {
      whereClause.email = email;
      checkAlreadyVendor.email = email;
    } else {
      return errorResponse({ res, error: 'Invalid OTP type!', status: 422 });
    }
    const alreadyVendor = await Vendor.findOne({
      where: checkAlreadyVendor,

    });
    if (!alreadyVendor) return errorResponse({ res, error: 'Vendor not found with this phone number/email!', status: 404 });

    const verifyOtp = await Otp.findOne({
      where: whereClause
    });
    if (!verifyOtp) return errorResponse({ res, error: 'Invalid OTP', status: 400 });

    await verifyOtp.update({ isVerified: 1 });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);


    await alreadyVendor.update({ password: hashedPassword });
    const token = jwt.sign({ id: alreadyVendor.id, phone: alreadyVendor.phone, email: alreadyVendor.email, role: 'vendor' }, process.env.VENDOR_AUTH_SECRET_KEY, { expiresIn: '30d' });
    const extraObj = { token };
    const dataObj = { id: alreadyVendor.id, phone: alreadyVendor.phone, email: alreadyVendor.email, role: 'vendor' };


    return successResponse({ res, data: dataObj, extraObj, message: 'Vendor password updated successfully' });
  } catch (error) {
    console.log(error);
    return errorResponse({ res, error, status: 400 });
  }
};

const vendorLogin = async (req, res) => {
  try {
    const { phone, password, email } = req.body;
    const whereClause = phone ? { phone } : email ? { email } : null;
    const vendor = await Vendor.findOne({ where: whereClause, });
    if (!vendor) {
      return errorResponse({ res, error: 'Vendor not found with this phone number/email!', status: 404 });
    }
    const isPasswordValid = await bcrypt.compare(password, vendor.password);
    if (!isPasswordValid) {
      return errorResponse({ res, error: 'Invalid password!', status: 401 });
    }
    const token = jwt.sign({ id: vendor.id, phone: vendor.phone, email: vendor.email, role: 'vendor' }, process.env.VENDOR_AUTH_SECRET_KEY, { expiresIn: '30d' });
    const extraObj = { token };
    const dataObj = { id: vendor.id, phone: vendor.phone, email: vendor.email, role: 'vendor', adminVerified: vendor.adminVerified };
    return successResponse({ res, data: dataObj, extraObj, message: 'Vendor logged in successfully' });
  } catch (error) {
    console.log(error);
    return errorResponse({ res, error, status: 400 });
  }
};

const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findByPk(id, {
      // attributes: [
      //   'id',
      //   'title',
      //   'shopName',
      //   'image',
      //   'isOfferAvalailable',
      //   'averageRating',
      //   'reviewCount',
      //   'description',
      //   'address',
      //   'phone',
      //   'whatsappNumber',
      //   'timings',
      //   'websiteLink',
      //   'otherLink'
      // ]
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
        'longitude',
        'status',
        'adminVerified',
        'isPaymentOnline'
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
          'status',
          'adminVerified',
          'isPaymentOnline',
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
          'reviewCount',
          'status',
          'adminVerified',
          'isPaymentOnline',
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
      'longitude',
      'status',
      'adminVerified',
      'isPaymentOnline',
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
        'status',
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
        attributes: ['id', 'offerType', 'offerCategory', 'offerTitle', 'offerDescription', 'termAndCondition', 'offerValidityTill', 'status'],
      }, {
        model: Vendor,
        attributes: ['id', 'shopName', 'status'],
      }],
    });
    const menuItemsWithQuantity = await Promise.all(menuItems.map(async (item) => {
      // console.log('menuItems', req.user, item);
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
    if (!req.body.vendorCategoryId) {
      const vendor = await Vendor.findByPk(req.body.vendorId);
      if (!vendor) return errorResponse({ res, error: 'Vendor not found!', status: 404 });
      myBody.vendorCategoryId = vendor.vendorCategoryId;
    }
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
    if (!myBody.vendorCategoryId) {
      const vendor = await Vendor.findByPk(req.body.vendorId);
      myBody.vendorCategoryId = vendor.vendorCategoryId;
    }
    myBody.image = image;
    const vendorGalleryImage = await VendorGallery.create({ ...myBody });
    return successResponse({ res, data: vendorGalleryImage, message: 'Vendor gallery image added successfully', status: 200 });
  } catch (error) {
    console.log(error);
    return errorResponse({ res, error });
  }
};

const getAllVendorGalleryImagesByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const galleryImages = await VendorGallery.findAll({
      where: { vendorId },
      attributes: ['id', 'image', 'vendorId'],
      order: [['createdAt', 'DESC']],
    });
    return successResponse({ res, data: galleryImages, message: 'Vendor gallery images fetched successfully', status: 200 });
  } catch (error) {
    console.log(error);
    return errorResponse({ res, error });
  }
};


const updateVendorGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = req.file ? req.file.filename : null;
    if (image) {
      req.body.image = image;
    }
    const galleryImage = await VendorGallery.findByPk(id);
    if (!galleryImage) return errorResponse({ res, error: 'Gallery image not found!', status: 404 });
    await galleryImage.update(req.body);
    return successResponse({ res, data: galleryImage, message: 'Vendor gallery image updated successfully', status: 200 });
  } catch (error) {
    console.log(error);
    return errorResponse({ res, error });
  }
};

const deleteVendorGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const galleryImage = await VendorGallery.findByPk(id);
    if (!galleryImage) return errorResponse({ res, error: 'Gallery image not found!', status: 404 });
    await galleryImage.destroy();
    return successResponse({ res, message: 'Vendor gallery image deleted successfully', status: 200 });
  } catch (error) {
    console.log(error);
    return errorResponse({ res, error });
  }
};

const getVendorDashboard = async (req, res) => {
  try {
    const { id } = req.user;
    const totalOrders = 10;
    const totalEarnings = 1000;
    const totalMenuItems = await VendorMenuItems.count({
      where: {
        vendorId: id
      }
    });
    const totalGalleryImages = await VendorGallery.count({
      where: {
        vendorId: id
      }
    });
    const averageRatings = 4.2;
    const dataObj = {
      totalOrders,
      totalEarnings,
      totalMenuItems,
      totalGalleryImages,
      averageRatings
    };
    return successResponse({ res, data: dataObj, message: 'Vendor dashboard fetched successfully', status: 200 });

  } catch (error) {
    console.log(error);
    // res.status(400).json(error);
    return errorResponse({ res, error, status: 400 });
  }
};




module.exports = {
  addVendor,
  updateVendor,
  vendorProfileUpdate,
  generateForgotVendorPasswordOtp,
  verifyForgotVendorPasswordOtp,
  vendorLogin,
  generateVendorRegisterOtp,
  verifyVendorRegisterOtp,
  getVendorById,
  getAllVendors,
  getNearByVendorsByCategoryId,
  getVendorInfoById,
  addVendorMenu,


  addVendorGalleryImage,
  getAllVendorGalleryImagesByVendorId,
  updateVendorGalleryImage,
  deleteVendorGalleryImage,


  getVendorDashboard
};