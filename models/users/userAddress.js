const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConfig');
const User = require('./user');
const Building = require('../building');

const UserAddress = sequelize.define('user_address', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    addressCategory: {
        type: DataTypes.STRING,
        defaultValue: 'HOME',
        // allowNull: false,
    },
    state: {
        type: DataTypes.STRING,
    },
    city: {
        type: DataTypes.STRING,
    },
    street: {
        type: DataTypes.STRING,
    },
    country: {
        type: DataTypes.STRING,
    },
    postCode: {
        type: DataTypes.STRING,
    },
    buildingId: {
        type: DataTypes.INTEGER,
        references: {
            model: Building,
            key: 'id'
        }
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8), // Storing latitude with 8 decimal places for precision
        // allowNull: false,
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8), // Storing longitude with 8 decimal places for precision
        // allowNull: false,
    },

}, {
    timestamps: true
});

module.exports = UserAddress;
