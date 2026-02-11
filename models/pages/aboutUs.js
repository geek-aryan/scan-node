const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConfig');

const AboutUs = sequelize.define('about_us', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    heading: {
        type: DataTypes.STRING,
    },
    content: { type: DataTypes.TEXT('long'), allowNull: false },
}, {
    tableName: 'about_us',
    timestamps: true,   
});

module.exports = AboutUs;