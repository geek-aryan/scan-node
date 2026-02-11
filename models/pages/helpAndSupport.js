const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConfig');

const HelpAndSupport = sequelize.define('help_and_support', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    heading: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    subHeading: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    question: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    answer: {
        type: DataTypes.TEXT('medium'),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        // allowNull: false,
    },
    whatsappNumber: { // Added a WhatsApp number field
        type: DataTypes.STRING,
    },
    // content: { type: DataTypes.TEXT('medium'), allowNull: false },
}, {
    tableName: 'help_and_support',
    timestamps: true,   
});

module.exports = HelpAndSupport;