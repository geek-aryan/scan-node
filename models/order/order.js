// models/Order.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConfig');
const User = require('../users/user');
const Vendor = require('../vendor/vendor');


const Order = sequelize.define('order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: User,
        key: 'id'
    }
  },
  vendorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: Vendor,
        key: 'id'
    }
  },


  subTotal: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },

  taxAmount: {
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 0,
    allowNull: false,
  },

  deliveryCharge: {
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 0,
    allowNull: false,
  },

  discountAmount: {
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 0,
    allowNull: false,
  },

  grandTotal: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },

  platformCommissionAmount: {
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 0,
    allowNull: false,
  },

  vendorPayableAmount: {
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 0,
    allowNull: false,
  },



  paymentStatus: {
    type: DataTypes.ENUM('PENDING','SUCCESS','FAILED', 'REFUNDED'),
    defaultValue: 'PENDING'
  },

  orderStatus: {
    type: DataTypes.ENUM(
      'CREATED',
      'CONFIRMED',
      'PREPARING',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED'
    ),
    defaultValue: 'CREATED'
  },
  razorpayOrderId: {
    type: DataTypes.STRING
  },

  razorpayPaymentId: {
    type: DataTypes.STRING
  },

  razorpaySignature: {
    type: DataTypes.STRING
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'RazorPay',
  }


}, { timestamps: true });

Order.belongsTo(User, {foreignKey: 'userId'});
Order.belongsTo(Vendor, {foreignKey: 'vendorId'});




module.exports = Order;