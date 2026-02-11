const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConfig');
const VendorCategory = require('./vendorCategory');
const Vendor = require('./vendor');

const VendorGallery = sequelize.define('vendor_gallery', {
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
  image: {
    type: DataTypes.STRING,
    allowNull: false,
    get(){
        const imageUrl = this.getDataValue('image');
        return imageUrl ? `${process.env.BACKEND_URL}/uploads/${imageUrl}` : null;
    }
  },
  imageAlt: {
    type: DataTypes.STRING,
  },
  text: {
    type: DataTypes.STRING,
  },
  sequenceNo: {
    type: DataTypes.INTEGER,
    // allowNull: false,
    defaultValue: 10000,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, { timestamps: true });

VendorGallery.belongsTo(VendorCategory, { foreignKey: 'vendorCategoryId' });
VendorGallery.belongsTo(Vendor, { foreignKey: 'vendorId' });

module.exports = VendorGallery;