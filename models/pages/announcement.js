const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConfig');

const Announcement = sequelize.define('announcement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  description: {
    type: DataTypes.TEXT('medium'),
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    get(){
        const imageUrl = this.getDataValue('image');
        return imageUrl ? `${process.env.BACKEND_URL}/uploads/${imageUrl}` : null;
    }
    // allowNull: false,
  },
  imageAlt: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  shownFrom: {
    type: DataTypes.DATE,
    allowNull: false
  },
  shownTill: {
    type: DataTypes.DATE,
    allowNull: false
  },

},{
    timestamps: true,
});

module.exports = Announcement;