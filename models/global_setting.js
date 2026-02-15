const { DataTypes } = require('sequelize');
const sequelize = require('./../config/dbConfig');

const GlobalSetting = sequelize.define('global_setting', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    vendorRadius: {
        type: DataTypes.INTEGER,
        defaultValue: 1000
    },
},{
    timestamps: true,
});

module.exports = GlobalSetting;

