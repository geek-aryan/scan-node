const sequelize = require('../../config/dbConfig');
const Order = require('../../models/order/order');
const OrderItem = require('../../models/order/orderItem');
const UserCart = require('../../models/order/userCart');
const User = require('../../models/users/user');
const Vendor = require('../../models/vendor/vendor');
const VendorMenuItems = require('../../models/vendor/vendorMenu');
const { successResponse, errorResponse } = require('../../utils/responseUtils');


const createOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const userId = req.user.id;
        const vendorId = Number(req.body.vendorId);

        if (!vendorId) {
            return errorResponse({ res, error: 'VendorId is required' });
        }

        // 1️⃣ Fetch cart items
        const cartItems = await UserCart.findAll({
            where: { userId, vendorId },
            include: [{ model: VendorMenuItems }],
            transaction
        });

        if (!cartItems.length) {
            await transaction.rollback();
            return errorResponse({ res, error: 'Cart is empty' });
        }

        // 2️⃣ Calculate financials (backend authoritative)
        let subTotal = 0;
        let discountAmount = 0;

        const orderItemsData = [];

        for (const cartItem of cartItems) {

            const item = cartItem.vendor_menu_item;
            const quantity = cartItem.quantity;

            const sellingPrice = Number(item.sellingPrice);

            // Calculate final price
            let finalPrice = sellingPrice;

            if (item.discountPercentage > 0) {
                finalPrice = sellingPrice -
                    (sellingPrice * Number(item.discountPercentage) / 100);
            } else if (item.discountValue > 0) {
                finalPrice = sellingPrice - Number(item.discountValue);
            }

            subTotal += sellingPrice * quantity;
            discountAmount += (sellingPrice - finalPrice) * quantity;

            orderItemsData.push({
                vendorId,
                menuItemId: item.id,
                itemName: item.itemName,
                priceAtPurchase: finalPrice,
                quantity,
                totalPrice: finalPrice * quantity
            });
        }

        const taxAmount = subTotal*0.18;        // Replace later with dynamic tax
        const deliveryCharge = 30;  // Replace later with dynamic delivery

        const grandTotal =
            subTotal +
            taxAmount +
            deliveryCharge -
            discountAmount;

        // 3️⃣ Commission Calculation (Example 10%)
        const commissionRate = 0.10;
        const platformCommissionAmount = grandTotal * commissionRate;
        const vendorPayableAmount = grandTotal - platformCommissionAmount;

        // 4️⃣ Create Order
        const order = await Order.create({
            userId,
            vendorId,
            subTotal,
            taxAmount,
            deliveryCharge,
            discountAmount,
            grandTotal,
            platformCommissionAmount,
            vendorPayableAmount,
            paymentStatus: 'SUCCESS',
            orderStatus: 'DELIVERED'
        }, { transaction });

        // 5️⃣ Attach orderId to items
        orderItemsData.forEach(item => {
            item.orderId = order.id;
        });

        // 6️⃣ Bulk create order items
        await OrderItem.bulkCreate(orderItemsData, { transaction });

        // 7️⃣ Clear cart
        await UserCart.destroy({
            where: { userId, vendorId },
            transaction
        });

        await transaction.commit();

        return successResponse({
            res,
            data: order,
            message: 'Order created successfully'
        });

    } catch (error) {
        await transaction.rollback();
        console.log(error);
        return errorResponse({ res, error });
    }
};

const createOfflineOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const userId = req.user.id;
        const vendorId = Number(req.body.vendorId);

        if (!vendorId) {
            return errorResponse({ res, error: 'VendorId is required' });
        }

        // 1️⃣ Fetch cart items
        const cartItems = await UserCart.findAll({
            where: { userId, vendorId },
            include: [{ model: VendorMenuItems }],
            transaction
        });

        if (!cartItems.length) {
            await transaction.rollback();
            return errorResponse({ res, error: 'Cart is empty' });
        }

        // 2️⃣ Calculate financials (backend authoritative)
        let subTotal = 0;
        let discountAmount = 0;

        const orderItemsData = [];

        for (const cartItem of cartItems) {

            const item = cartItem.vendor_menu_item;
            const quantity = cartItem.quantity;

            const sellingPrice = Number(item.sellingPrice);

            // Calculate final price
            let finalPrice = sellingPrice;

            if (item.discountPercentage > 0) {
                finalPrice = sellingPrice - (sellingPrice * Number(item.discountPercentage) / 100);
            } else if (item.discountValue > 0) {
                finalPrice = sellingPrice - Number(item.discountValue);
            }

            subTotal += sellingPrice * quantity;
            discountAmount += (sellingPrice - finalPrice) * quantity;

            orderItemsData.push({
                vendorId,
                menuItemId: item.id,
                itemName: item.itemName,
                priceAtPurchase: finalPrice,
                quantity,
                totalPrice: finalPrice * quantity
            });

        }

        const taxAmount = subTotal*0.18;       // Replace later with dynamic tax
        const deliveryCharge = 30;  // Replace later with dynamic delivery

        const grandTotal =
            subTotal +
            taxAmount +
            deliveryCharge -
            discountAmount;

        // 3️⃣ Commission Calculation (Example 10%)
        const commissionRate = 0.10;
        const platformCommissionAmount = grandTotal * commissionRate;
        const vendorPayableAmount = grandTotal - platformCommissionAmount;

        // 4️⃣ Create Order
        const order = await Order.create({
            userId,
            vendorId,
            subTotal,
            taxAmount,
            deliveryCharge,
            discountAmount,
            grandTotal,
            platformCommissionAmount,
            vendorPayableAmount,
            paymentStatus: 'SUCCESS',
            orderStatus: 'DELIVERED',
            paymentMethod: 'COD'
        }, { transaction });

        // 5️⃣ Attach orderId to items
        orderItemsData.forEach(item => {
            item.orderId = order.id;
        });

        // 6️⃣ Bulk create order items
        await OrderItem.bulkCreate(orderItemsData, { transaction });

        // 7️⃣ Clear cart
        await UserCart.destroy({
            where: { userId, vendorId },
            transaction
        });

        await transaction.commit();

        return successResponse({
            res,
            data: order,
            message: 'Order created successfully'
        });

    } catch (error) {
        await transaction.rollback();
        console.log(error);
        return errorResponse({ res, error });
    }
};

const getUserOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.findAll({
            where: { userId },
            include: [
                {
                    model: OrderItem,
                    attributes: [
                        'id',
                        'vendorId',
                        'menuItemId',
                        'itemName',
                        'priceAtPurchase',
                        'quantity',
                        'totalPrice'
                    ]
                },
                {
                    model: Vendor,
                    attributes: ['id', 'shopName', 'email', 'phone', 'image'] // adjust according to your model
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return successResponse({
            res,
            data: orders,
            message: 'Order history fetched successfully'
        });

    } catch (error) {
        console.log(error);
        return errorResponse({ res, error });
    }
};

const getAllOrdersByPaymentStatus = async (req, res) => {
    try {
        const paymentStatus = req.query.paymentStatus;
        const orders = await Order.findAll({
            where: { paymentStatus },
            include: [
                {
                    model: OrderItem,
                    attributes: [
                        'id',
                        'vendorId',
                        'menuItemId',
                        'itemName',
                        'priceAtPurchase',
                        'quantity',
                        'totalPrice'
                    ]
                },
                {
                    model: User,
                    attributes: ['id', 'name', 'image', 'username', 'email',  'mobile']
                },
                {
                    model: Vendor,
                    attributes: ['id', 'shopName', 'email', 'phone', 'image']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return successResponse({
            res,
            data: orders,
            message: 'Orders fetched successfully'
        });

    } catch (error) {
        console.log(error);
        return errorResponse({ res, error });
    }
};

const getAllOrdersForVendorByPaymentStatus = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const paymentStatus = req.query.paymentStatus;
        const orders = await Order.findAll({
            where: { paymentStatus, vendorId },
            include: [
                {
                    model: OrderItem,
                    attributes: [
                        'id',
                        'vendorId',
                        'menuItemId',
                        'itemName',
                        'priceAtPurchase',
                        'quantity',
                        'totalPrice'
                    ]
                },
                {
                    model: User,
                    attributes: ['id', 'name', 'image', 'username', 'email',  'mobile']
                },
                {
                    model: Vendor,
                    attributes: ['id', 'shopName', 'email', 'phone', 'image']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return successResponse({
            res,
            data: orders,
            message: 'Orders fetched successfully'
        });

    } catch (error) {
        console.log(error);
        return errorResponse({ res, error });
    }
};


const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.orderId;
         const order = await Order.findByPk(orderId, {
            include: [
                {
                    model: OrderItem,
                    attributes: [
                        'id',
                        'vendorId',
                        'menuItemId',
                        'itemName',
                        'priceAtPurchase',
                        'quantity',
                        'totalPrice'
                    ]
                },
                {
                    model: User,
                    attributes: ['id', 'name', 'image', 'username', 'email',  'mobile']
                },
                {
                    model: Vendor,
                    attributes: ['id', 'shopName', 'email', 'phone', 'image']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        return successResponse({res, data: order, message: 'Order fetched successfully'});
    } catch (error) {
        console.log(error);
        return errorResponse({res, error});
    }
};



module.exports = {
    createOrder,
    createOfflineOrder,
    getUserOrderHistory,
    getAllOrdersByPaymentStatus,
    getAllOrdersForVendorByPaymentStatus,
    getOrderById
}


