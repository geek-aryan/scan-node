const UserCart = require('../../models/order/userCart');
const VendorMenuItems = require('../../models/vendor/vendorMenu');
const { errorResponse, successResponse, correctImagePath } = require("../../utils/responseUtils");
const { literal } = require('sequelize');


const addRemoveUserCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const menuItemId = req.body.menuItemId;
        const actionValue = req.body.actionValue;
        const alreadyItem = await UserCart.findOne({
            where: {
                userId: userId,
                menuItemId,
            }
        });
        if (alreadyItem) {
            if (alreadyItem.quantity + actionValue <= 0) {
                await alreadyItem.destroy();
            } else {
                alreadyItem.quantity += actionValue;
                await alreadyItem.save();
            }
        } else await UserCart.create({ userId, menuItemId });
        const userCart = await UserCart.findAll({
            where: {
                userId,
            },
            include: [{
                model: VendorMenuItems,
                attributes: ['id', 'itemName', 'itemDescription', 'markedPrice', 'sellingPrice', 'discountPercentage', 'image'],
            }],
            attributes: ['id', 'menuItemId', 'quantity'],
        });
        return successResponse({ res, data: userCart, message: 'cart updated successfully!' });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error })
    }
};

const getUserCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const userCart = await UserCart.findAll({
            where: { userId },
            include: [
                {
                    model: VendorMenuItems,
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
                                WHEN vendor_menu_item.discountPercentage IS NOT NULL 
                                    AND vendor_menu_item.discountPercentage > 0
                                    THEN vendor_menu_item.sellingPrice 
                                        - (vendor_menu_item.sellingPrice * vendor_menu_item.discountPercentage / 100)
                                WHEN vendor_menu_item.discountValue IS NOT NULL 
                                    AND vendor_menu_item.discountValue > 0
                                    THEN vendor_menu_item.sellingPrice - vendor_menu_item.discountValue
                                ELSE vendor_menu_item.sellingPrice
                                END
                            `),
                            'finalPrice'
                        ]
                    ],
                }
            ],
            attributes: ['id', 'menuItemId', 'quantity'],
        });

        return successResponse({ res, data: userCart, message: 'cart fetched successfully!' });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error })
    }
};

const getUserCheckoutCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const userCart = await UserCart.findAll({
            where: { userId },
            include: [
                {
                    model: VendorMenuItems,
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
                                WHEN vendor_menu_item.discountPercentage IS NOT NULL 
                                    AND vendor_menu_item.discountPercentage > 0
                                    THEN vendor_menu_item.sellingPrice 
                                        - (vendor_menu_item.sellingPrice * vendor_menu_item.discountPercentage / 100)
                                WHEN vendor_menu_item.discountValue IS NOT NULL 
                                    AND vendor_menu_item.discountValue > 0
                                    THEN vendor_menu_item.sellingPrice - vendor_menu_item.discountValue
                                ELSE vendor_menu_item.sellingPrice
                                END
                            `),
                            'finalPrice'
                        ]
                    ],
                }
            ],
            attributes: ['id', 'menuItemId', 'quantity'],
        });
        const cartSummaryBase = {
            subTotal: 0,
            taxAndFees: 50,
            offerAndDiscount: 0,
            delivery: 30,
        };
        const cartSummary = userCart.reduce((summary, cartItem) => {
            const item = cartItem.vendor_menu_item;
            const quantity = cartItem.quantity;
            console.log('my item', cartItem);
            const finalPrice = Number(item.get('finalPrice'));
            const sellingPrice = Number(item.sellingPrice);

            summary.subTotal += sellingPrice * quantity;
            summary.offerAndDiscount +=
                (sellingPrice - finalPrice) * quantity;

            return summary;
        }, { ...cartSummaryBase });

        cartSummary.grandTotal =
            cartSummary.subTotal +
            cartSummary.taxAndFees +
            cartSummary.delivery - cartSummary.offerAndDiscount;

        return successResponse({ res, data: {userCart, cartSummary}, message: 'cart fetched successfully!' });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error })
    }
};

module.exports = {
    addRemoveUserCartItem,
    getUserCart,
    getUserCheckoutCart
}