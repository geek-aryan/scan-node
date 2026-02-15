const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConfig');
const Vendor = require('../vendor/vendor');
const VendorMenuItems = require('../vendor/vendorMenu');
const Order = require('./order');


const OrderItem = sequelize.define('order_item', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: Order,
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

  menuItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: VendorMenuItems,
        key: 'id'
    }
  },

  itemName: {   // snapshot
    type: DataTypes.STRING,
    allowNull: false
  },

  priceAtPurchase: { // this is per item price
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },

  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  totalPrice: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  }

}, { timestamps: true });

module.exports = OrderItem;