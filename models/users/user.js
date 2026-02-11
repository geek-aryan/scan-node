const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConfig');
const Building = require('../building');
const bcrypt = require('bcryptjs');

// console.log(DataTypes);
const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
    name: {
        type: DataTypes.STRING,
    },
    username: {
        type: DataTypes.STRING,
        // allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        // allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        // unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: true,
        // unique: true
    },
    address: {
        type: DataTypes.STRING,
    },
    buildingId: {
        type: DataTypes.INTEGER,
        references: {
            model: Building,
            key: 'id'
        },
    },
    state: {
        type: DataTypes.STRING,
    },
    city: {
        type: DataTypes.STRING,
    },
    isProfileRegistered: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    accountDeleted: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    
}, {
    timestamps: true,
});


module.exports = User;

