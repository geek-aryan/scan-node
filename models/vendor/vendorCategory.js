const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConfig'); // Assuming you have your sequelize instance in a file named 'sequelize.js'

const VendorCategory = sequelize.define('vendor_category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
  parentCategoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  hasSubcategory: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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


module.exports = VendorCategory;