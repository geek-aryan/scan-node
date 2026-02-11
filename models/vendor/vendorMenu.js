const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConfig');
const VendorCategory = require('./vendorCategory');
const Vendor = require('./vendor');

const VendorMenuItems = sequelize.define('vendor_menu_item', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  vendorCategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: VendorCategory,
      key: 'id',
    },
  },
  vendorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Vendor,
      key: 'id',
    },
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Lunch'
  },
  itemName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  itemDescription: {
    type: DataTypes.TEXT,
  },
  markedPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  sellingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
  },
  discountPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.0,
  },
  image: {
    type: DataTypes.STRING,
    get(){
        const imageUrl = this.getDataValue('image');
        return imageUrl ? `${process.env.BACKEND_URL}/uploads/${imageUrl}` : null;
    }
  },
  imageAlt: {
    type: DataTypes.STRING,
  },
  sequenceNo: {
    type: DataTypes.INTEGER,
    // allowNull: false,
    defaultValue: 10000,
  },
  maxQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 20,
  },
  totalAvailable: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1000,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, { timestamps: true });


VendorMenuItems.belongsTo(VendorCategory, { foreignKey: 'vendorCategoryId' });
VendorMenuItems.belongsTo(Vendor, { foreignKey: 'vendorId' });


module.exports = VendorMenuItems;