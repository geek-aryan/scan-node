const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConfig');
const User = require('../users/user');
const VendorMenuItems = require('../vendor/vendorMenu');

const UserCart = sequelize.define('user_cart_item', {
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
    menuItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: VendorMenuItems,
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    timestamps: true
});

UserCart.belongsTo(User, { foreignKey: 'userId' });
UserCart.belongsTo(VendorMenuItems, { foreignKey: 'menuItemId' });


module.exports = UserCart;