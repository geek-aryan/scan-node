const VendorMenuItems = require("../../models/vendor/vendorMenu");
const Vendor = require("../../models/vendor/vendor");

const { errorResponse, successResponse, correctImagePath } = require("../../utils/responseUtils");

const getMenuItemsByCategory = async (req, res) => {
    try {
        const { category } = req.query;
        let whereClause = {};
        if (category) {
            whereClause.category = category;
        }
        const menuItems = await VendorMenuItems.findAll({
            where: {
                ...whereClause
            },
            attributes: ['id', 'vendorId', 'itemName', 'itemDescription', 'markedPrice', 'sellingPrice', 'discountValue', 'discountPercentage', 'image', 'isAvailable', 'category'],
            include: [
                {
                    model: Vendor,
                    attributes: ['id', 'shopName', 'whatsappNumber']
                }
            ]
        });
        return successResponse({ res, data: menuItems });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error, status: 400 });
    }
};
const getMenuItemsByVendor = async (req, res) => {
    try {
        const { vendorId } = req.query;
        let whereClause = {};
        if (vendorId) {
            whereClause.vendorId = vendorId;
        }
        const menuItems = await VendorMenuItems.findAll({
            where: {
                ...whereClause
            },
            attributes: ['id', 'vendorId', 'itemName', 'itemDescription', 'markedPrice', 'sellingPrice', 'discountValue', 'discountPercentage', 'image', 'isAvailable', 'category'],
        });
        return successResponse({ res, data: menuItems });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error, status: 400 });
    }
};

const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const image = req.file ? req.file.filename : null;
        if (image) {
            req.body.image = image;
        }
        const menuItem = await VendorMenuItems.findByPk(id);
        if (!menuItem) return errorResponse({ res, error: 'Menu item not found!', status: 404 });
        await menuItem.update(req.body);
        return successResponse({ res, data: menuItem, message: 'Menu item updated successfully' });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error, status: 400 });
    }
};



module.exports = {
    getMenuItemsByCategory,
    getMenuItemsByVendor,
    updateMenuItem,

};