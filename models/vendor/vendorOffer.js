const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConfig');

const VendorOffer = sequelize.define('vendor_offer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  offerType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  offerCategory: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  offerTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  offerDescription: {
    type: DataTypes.TEXT,
  },
  termAndCondition: {
    type: DataTypes.TEXT,
  },
  offerValidityFrom: {
    type: DataTypes.DATE,
  },
  offerValidityTill: {  
    type: DataTypes.DATE,
    allowNull: false,
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
  

module.exports = VendorOffer;