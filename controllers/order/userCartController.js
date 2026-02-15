const UserCart = require('../../models/order/userCart');
const Vendor = require('../../models/vendor/vendor');
const VendorMenuItems = require('../../models/vendor/vendorMenu');
const { errorResponse, successResponse, correctImagePath } = require("../../utils/responseUtils");
const { literal } = require('sequelize');


const addRemoveUserCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const menuItemId = req.body.menuItemId;
        const menuItem = await VendorMenuItems.findByPk(menuItemId);
        if(!menuItem)return res.status(404).json({message: 'menu item not found!'});
        const vendorId = menuItem.vendorId;
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
        } else await UserCart.create({ userId, vendorId, menuItemId });
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

const getUserCartV2 = async (req, res) => {
    try {
        const userId = req.user.id;

        const userCart = await UserCart.findAll({
            where: { userId },
            include: [
                {
                    model: VendorMenuItems,
                    attributes: [
                        'id',
                        'vendorId',   // IMPORTANT
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
                },
                {
                    model: Vendor,
                    attributes: ['id', 'shopName', 'phone', 'email', 'image']
                }
            ],
            attributes: ['id', 'vendorId', 'menuItemId', 'quantity'],
        });

        // ✅ Group by vendorId
        const grouped = {};

        userCart.forEach(cartItem => {
            const item = cartItem.vendor_menu_item;
            const vendorId = cartItem.vendor_menu_item.vendorId;
            const vendor = cartItem.vendor;
            const finalPrice = Number(item.get('finalPrice'));
            const sellingPrice = Number(item.sellingPrice);
            const quantity = cartItem.quantity;

            if (!grouped[vendorId]) {
                grouped[vendorId] = {
                    vendorId,
                    vendor,
                    subTotal: 0,
                    taxAndFees: 50,
                    offerAndDiscount: 0,
                    delivery: 30,
                    items: []
                };
            }
            grouped[vendorId].subTotal += sellingPrice * quantity;
            grouped[vendorId].offerAndDiscount +=
                (sellingPrice - finalPrice) * quantity;

            grouped[vendorId].items.push({
                cartId: cartItem.id,
                quantity: cartItem.quantity,
                ...cartItem.vendor_menu_item.toJSON()
            });
        });

        Object.values(grouped).forEach(vendorCart => {
            vendorCart.grandTotal =
                vendorCart.subTotal +
                vendorCart.taxAndFees +
                vendorCart.delivery -
                vendorCart.offerAndDiscount;
        });

        const finalData = Object.values(grouped);

        return successResponse({
            res,
            data: finalData,
            message: 'cart fetched successfully!'
        });

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
            // console.log('my item', cartItem);
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


const getUserCartByVendorId = async (req, res) => {
    try {
        const userId = req.user.id;
        const vendorId = Number(req.params.vendorId);

        const userCart = await UserCart.findAll({
            where: { userId, vendorId },
            include: [
                {
                    model: VendorMenuItems,
                    attributes: [
                        'id',
                        'vendorId',
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
                },
                {
                    model: Vendor,
                    attributes: ['id', 'shopName', 'phone', 'email', 'image']
                }
            ],
            attributes: ['id', 'vendorId', 'menuItemId', 'quantity'],
        });

        if (!userCart.length) {
            return successResponse({
                res,
                data: null,
                message: 'Cart is empty for this vendor'
            });
        }

        const cartSummary = {
            vendorId,
            vendor: userCart[0].vendor,
            subTotal: 0,
            taxAndFees: 50,
            offerAndDiscount: 0,
            delivery: 30,
            items: []
        };

        userCart.forEach(cartItem => {
            const item = cartItem.vendor_menu_item;
            const quantity = cartItem.quantity;
            // const vendor = cartItem.vendor;

            const finalPrice = Number(item.get('finalPrice'));
            const sellingPrice = Number(item.sellingPrice);

            cartSummary.subTotal += sellingPrice * quantity;
            cartSummary.offerAndDiscount +=
                (sellingPrice - finalPrice) * quantity;

            cartSummary.items.push({
                cartId: cartItem.id,
                quantity,
                ...item.toJSON()
            });
        });

        cartSummary.grandTotal =
            cartSummary.subTotal +
            cartSummary.taxAndFees +
            cartSummary.delivery -
            cartSummary.offerAndDiscount;

        return successResponse({
            res,
            data: cartSummary,
            message: 'cart fetched successfully!'
        });

    } catch (error) {
        console.log(error);
        return errorResponse({ res, error });
    }
};

module.exports = {
    addRemoveUserCartItem,
    getUserCart,
    getUserCartV2,
    getUserCheckoutCart,
    getUserCartByVendorId,

}