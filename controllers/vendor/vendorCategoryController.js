const VendorCategory = require('../../models/vendor/vendorCategory');
const { successResponse, errorResponse } = require('../../utils/responseUtils');


const addVendorCategory = async (req, res) => {
    try {
        const { name, imageAlt, hasSubcategory } = req.body;
        const image = req.file ? req.file.filename : null;
        if(!name || !image) {
            return errorResponse({ res, error: 'Name and image are required', status: 422 });
        }

        const newCategory = await VendorCategory.create({
            name,
            image,
            imageAlt,
            hasSubcategory
        });

        return successResponse({ res, data: newCategory, message: 'Vendor category added successfully', status: 200 });
    } catch (error) {
        console.error('Error adding vendor category:', error);
        return errorResponse({ res, error: 'Failed to add vendor category', status: 500 });
    }
};

const addVendorSubCategory = async (req, res) => {
     try {
        const { name, imageAlt, parentCategoryId } = req.body;
        const image = req.file ? req.file.filename : null;
        if(!name || !image) {
            return errorResponse({ res, error: 'Name and image are required', status: 422 });
        }

        const newCategory = await VendorCategory.create({
            name,
            image,
            hasSubcategory: true,
            parentCategoryId: parentCategoryId,
            imageAlt
        });

        return successResponse({ res, data: newCategory, message: 'Vendor category added successfully', status: 200 });
    } catch (error) {
        console.error('Error adding vendor category:', error);
        return errorResponse({ res, error: 'Failed to add vendor category', status: 500 });
    }
};

const getVendorSubCategories = async (req, res) => {
    try {
        const { parentCategoryId } = req.query;
        const subCategories = await VendorCategory.findAll({
            where: {
                parentCategoryId,
            },
            attributes: ['id', 'name', 'image']
        });
        return successResponse({ res, data: subCategories, message: 'Vendor sub categories fetched successfully', status: 200 });
        } catch (error) {
        console.error('Error adding vendor category');
        return errorResponse({res, error: 'Failed to add vendor category', status: 500 });
    }
}

module.exports = {
    addVendorCategory,
    addVendorSubCategory,
    getVendorSubCategories
};