const { Sequelize, fn, col, literal } = require('sequelize');
const Vendor = require('../models/vendor/vendor');
const VendorCategory = require('../models/vendor/vendorCategory');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const AboutUs = require('../models/pages/aboutUs');
const HelpAndSupport = require('../models/pages/helpAndSupport');
const HtmlPage = require('../models/pages/htmlPages');
const User = require('../models/users/user');


const getHomePageData = async (req, res) => {
  try {
    const lat = Number(req.query.latitude);
    const lng = Number(req.query.longitude);
    
    const hasValidLocation =
      Number.isFinite(lat) && Number.isFinite(lng);

    const categories = await VendorCategory.findAll({
      where: {
        parentCategoryId: null,
      },
      attributes: ['id', 'name', 'image', 'hasSubcategory'],
    });

    let nearByVendors;

    if (hasValidLocation) {
      // 📍 Location-aware vendors
      nearByVendors = await Vendor.findAll({
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
        limit: 10
      });
    } else {
      // 🌍 Fallback vendors
      nearByVendors = await Vendor.findAll({
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
        limit: 10
      });
    }

    const todaysFoodMenu = await Vendor.findAll({
      attributes: ['id', 'title', 'description', 'image', 'imageAlt', 'whatsappNumber'],
      where: { isOfferAvalailable: true },
      order: literal('RAND()'),
      limit: 10
    });

    const specialOfferImage =
      `${process.env.BACKEND_URL}/uploads/homePageSpecialOffer.png`;
    const specialOfferImages = [specialOfferImage, specialOfferImage, specialOfferImage];
    const userInfo = await User.findOne({ where: { id: req.user.id }, attributes: ['id', 'name', 'image', 'email', 'username'] });


    return successResponse({
      res,
      data: {
        categories,
        nearByVendors,
        todaysFoodMenu,
        specialOfferImages,
        userInfo,
        // locationProvided: hasValidLocation
      },
      message: 'Home page data fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching home page data:', error);
    return errorResponse({
      res,
      error: 'Failed to fetch home page data',
      status: 500
    });
  }
};

const addUpdateAboutUs = async (req, res) => {
  try {
    const { heading, content } = req.body;

    const alreadyAboutUs = await AboutUs.findOne();
    if(alreadyAboutUs){
      await alreadyAboutUs.update({ heading, content });
      return successResponse({res, message: 'updated successfully!'});
    }

    const newAboutUs = await AboutUs.create({
      heading,
      content
    });

    return successResponse({
      res,
      data: newAboutUs,
      message: 'About Us content added successfully',
      status: 200
    });
  } catch (error) {
    console.error('Error adding About Us content:', error);
    return errorResponse({
      res,
      error: 'Failed to add About Us content',
      status: 500
    });
  }
};

const getAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOne();
    if(!aboutUs)return errorResponse({res, error: 'About Us content not found', status: 404});
    return successResponse({ res, data: aboutUs.content, message: 'About Us content fetched successfully' });
  } catch (error) {
    console.log(error);
    return errorResponse({ res, error: 'Failed to fetch About Us content', status: 500 });
  }
};

const addUpdateHelpAndSupport = async (req, res) => {
  try {

    const helpAndSupportAlready = await HelpAndSupport.findOne();
    if(helpAndSupportAlready){
      await helpAndSupportAlready.update({ ...req.body });
      return successResponse({res, message: 'updated successfully!'});
    }

    const helpAndSupport = await HelpAndSupport.create({
      ...req.body,
    });

    return successResponse({
      res,
      data: helpAndSupport,
      message: 'About Us content added successfully',
      status: 200
    });
  } catch (error) {
    console.error('Error adding About Us content:', error);
    return errorResponse({
      res,
      error: 'Failed to add About Us content',
      status: 500
    });
  }
};

const getHelpAndSupport = async (req, res) => { 
  try {
    const helpAndSupport = await HelpAndSupport.findOne({attributes: ['id', 'heading', 'subHeading', 'question', 'answer', 'email', 'whatsappNumber']});
    if(!helpAndSupport)return errorResponse({res, error: 'Help and Support content not found', status: 404});
    return successResponse({ res, data: helpAndSupport, message: 'Help and Support content fetched successfully' });
  } catch (error) {
    console.log(error);
    return errorResponse({ res, error: 'Failed to fetch Help and Support content', status: 500 });
  }
};

const addUpdateHtmlPageContent = async (req, res) => {
  try {
      const { pageType, heading, content } = req.body;

      const alreadyPage = await HtmlPage.findOne({ where: { pageType } });
      if (alreadyPage) {
          await alreadyPage.update({ heading, content });
          return successResponse({ res, message: 'Page content updated successfully!' });
      }

      const newPage = await HtmlPage.create({
          pageType,
          heading,
          content
      });

      return successResponse({
          res,
          data: newPage,
          message: 'Page content added successfully',
          status: 200
      });
  } catch (error) {
    console.log(error);
    return errorResponse({ res, error: 'Failed to fetch Html page', status: 500 });
  }
};

const getHtmlPageContent = async (req, res) => {
  try {
      const { pageType } = req.query;
      const page = await HtmlPage.findOne({ where: { pageType } });
      if (!page) return errorResponse({ res, error: 'Page content not found', status: 404 });
      return successResponse({ res, data: page.content, message: 'Page content fetched successfully' });
  } catch (error) {
      console.log(error);
      return errorResponse({ res, error: 'Failed to fetch Page content', status: 500 });
  }
};

module.exports = {
    getHomePageData,
    addUpdateAboutUs,
    getAboutUs,
    addUpdateHelpAndSupport,
    getHelpAndSupport,
    addUpdateHtmlPageContent,
    getHtmlPageContent
};