const VendorMenuItems = require("../../models/vendor/vendorMenu");
const Vendor = require("../../models/vendor/vendor");

const { errorResponse, successResponse, correctImagePath } = require("../../utils/responseUtils");

const getMenuItemsByCategory = async (req, res) => {
    try {
        const {category} = req.query;
        let whereClause = {};
        if(category){
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
        return successResponse({res, data: menuItems});
    } catch (error) {
        console.log(error);
        return errorResponse({res, error, status: 400});
    }
};

module.exports = {
    getMenuItemsByCategory,
};