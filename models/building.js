const { DataTypes } = require('sequelize');
const sequelize = require('./../config/dbConfig');


const Building = sequelize.define('building', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true
    },
    address: {
        type: DataTypes.STRING,
    },
    city: {
        type: DataTypes.STRING,
    },
    state: {
        type: DataTypes.STRING,
    },
    zipCode: {
        type: DataTypes.STRING,
    },
    country: {
        type: DataTypes.STRING,
    },
    sequenceNo: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        defaultValue: 10000,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
});

module.exports = Building;
