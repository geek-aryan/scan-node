const { DataTypes } = require('sequelize');
const sequelize = require('../../config/dbConfig');

const { OTP_PAGE, OTP_TYPE } = require('../../utils/enums/otpEnums');


const Otp = sequelize.define('Otp', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: { type: DataTypes.STRING(150), allowNull: true, defaultValue: null },
    phoneNumber: { type: DataTypes.STRING(105), allowNull: true, defaultValue: null, field: 'phone_number' },
    otpType: { type: DataTypes.ENUM(Object.values(OTP_TYPE)), allowNull: false, field: 'otpType' },
    otp: { type: DataTypes.STRING(9), allowNull: false },
    forPage: { type: DataTypes.ENUM(Object.values(OTP_PAGE)), allowNull: false, field: 'forPage' },
    verifyAttempts: { type: DataTypes.INTEGER, defaultValue: 0, field: 'verify_attempts' },
    isVerified: { type: DataTypes.INTEGER, defaultValue: 0, field: 'is_verified' },
    expiresAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null, field: 'expires_at' },

}, {
    tableName: 'otps',
    timestamps: true,
});

module.exports = Otp;