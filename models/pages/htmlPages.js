const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConfig');

const HtmlPage = sequelize.define('html_page', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    pageType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    heading: {
        type: DataTypes.STRING,
    },
    content: { type: DataTypes.TEXT('long'), allowNull: false },
}, {
    tableName: 'html_pages',
    timestamps: true,   
});

module.exports = HtmlPage;