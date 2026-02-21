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


OrderItem.belongsTo(Order, {foreignKey: 'orderId'});
OrderItem.belongsTo(Vendor, {foreignKey: 'vendorId'});
OrderItem.belongsTo(VendorMenuItems, {foreignKey: 'menuItemId'});

Order.hasMany(OrderItem, {foreignKey: 'orderId'});
Vendor.hasMany(OrderItem, {foreignKey: 'vendorId'});
VendorMenuItems.hasMany(OrderItem, {foreignKey: 'menuItemId'});


module.exports = OrderItem;