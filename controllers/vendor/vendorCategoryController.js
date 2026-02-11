const VendorCategory = require('../../models/vendor/vendorCategory');
const { successResponse, errorResponse } = require('../../utils/responseUtils');


const addVendorCategory = async (req, res) => {
    try {
        const { name, imageAlt, hasSubcategory = false } = req.body;
        const image = req.file ? req.file.filename : null;
        if (!name || !image) {
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
        if (!name || !image) {
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
            attributes: ['id', 'name', 'image', 'hasSubcategory', 'status', 'sequenceNo', 'createdAt']
        });
        return successResponse({ res, data: subCategories, message: 'Vendor sub categories fetched successfully', status: 200 });
    } catch (error) {
        console.error('Error adding vendor category');
        return errorResponse({ res, error: 'Failed to add vendor category', status: 500 });
    }
}

const getVendorCategories = async (req, res) => {
    try {
        const categories = await VendorCategory.findAll({
            where: {
                parentCategoryId: null,
            },
            attributes: ['id', 'name', 'image', 'hasSubcategory', 'status', 'sequenceNo', 'createdAt']
        });
        return successResponse({ res, data: categories, message: 'Vendor categories fetched successfully', status: 200 });
    } catch (error) {
        console.error('Error fetching vendor categories:', error);
        return errorResponse({ res, error: 'Failed to fetch vendor categories', status: 500 });
    }
};

const updateVendorCategory = async (req, res) => {
    try {
        const { name, imageAlt, status, sequenceNo = 1000 } = req.body;
        const { id } = req.params;

        if (!name) {
            return errorResponse({ res, error: 'Name is required', status: 422 });
        }

        // Build update object dynamically
        const updateData = {
            name,
            imageAlt,
            status,
            sequenceNo
        };

        // Only update image if file exists
        if (req.file) {
            updateData.image = req.file.filename;
        }

        const updatedCategory = await VendorCategory.update(updateData, {
            where: { id }
        });

        return successResponse({
            res,
            data: updatedCategory,
            message: 'Vendor category updated successfully',
            status: 200
        });

    } catch (error) {
        console.error('Error updating vendor category:', error);
        return errorResponse({
            res,
            error: 'Failed to update vendor category',
            status: 500
        });
    }
};

const updateVendorSubCategory = async (req, res) => {
    try {
        const { name, imageAlt, status, sequenceNo = 1000 } = req.body;
        const { id } = req.params;

        if (!name) {
            return errorResponse({ res, error: 'Name is required', status: 422 });
        }

        // Build update object dynamically
        const updateData = {
            name,
            imageAlt,
            status,
            sequenceNo
        };

        // Only update image if file exists
        if (req.file) {
            updateData.image = req.file.filename;
        }

        const updatedCategory = await VendorCategory.update(updateData, {
            where: { id }
        });

        return successResponse({
            res,
            data: updatedCategory,
            message: 'Vendor category updated successfully',
            status: 200
        });

    } catch (error) {
        console.error('Error updating vendor category:', error);
        return errorResponse({
            res,
            error: 'Failed to update vendor category',
            status: 500
        });
    }
};

module.exports = {
    addVendorCategory,
    addVendorSubCategory,
    getVendorSubCategories,
    getVendorCategories,
    updateVendorCategory,
    updateVendorSubCategory
};