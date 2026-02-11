const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConfig'); // Assuming you have your sequelize instance in a file named 'sequelize.js'
const VendorCategory = require('./vendorCategory'); // Import the VendorCategory model

const Vendor = sequelize.define('vendor', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  vendorCategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: VendorCategory, // This is a reference to another model
      key: 'id', // This is the column name of the referenced model
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
  shopName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    // allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  heading: {
    type: DataTypes.STRING,
  },
  averageRating: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isOfferAvalailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8), // Storing latitude with 8 decimal places for precision
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8), // Storing longitude with 8 decimal places for precision
    allowNull: false,
  },
  address: { // Added an address field for more complete vendor information
    type: DataTypes.STRING,
  },
  phone: { // Added a phone number field
    type: DataTypes.STRING,
  },
  whatsappNumber: { // Added a WhatsApp number field
    type: DataTypes.STRING,
  },
  timings: {
    type: DataTypes.STRING,
  },
  websiteLink: {
    type: DataTypes.STRING,
  },
  otherLink: {
    type: DataTypes.STRING,
  },
  email: { // Added an email field
    type: DataTypes.STRING,
    // unique: true,
    // validate: {
    //   isEmail: true,
    // },
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, { timestamps: true });

// Define association
Vendor.belongsTo(VendorCategory, { foreignKey: 'vendorCategoryId' });
VendorCategory.hasMany(Vendor, { foreignKey: 'vendorCategoryId' });


module.exports = Vendor;