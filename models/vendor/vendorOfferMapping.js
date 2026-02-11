const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConfig');
const Vendor = require('./vendor');
const VendorOffer = require('./vendorOffer');

const VendorOfferMapping = sequelize.define('vendor_offer_mapping', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  vendorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Vendor,
      key: 'id',
    },
  },
  offerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: VendorOffer,
      key: 'id',
    },
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
},{
    timestamps: true,
});

VendorOfferMapping.belongsTo(Vendor, { foreignKey: 'vendorId' });
VendorOfferMapping.belongsTo(VendorOffer, { foreignKey: 'offerId' });

Vendor.hasMany(VendorOfferMapping, { foreignKey: 'vendorId' });
VendorOffer.hasMany(VendorOfferMapping, { foreignKey: 'offerId' });

module.exports = VendorOfferMapping;
  
