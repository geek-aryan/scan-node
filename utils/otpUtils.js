const Otp = require('../models/otps/otp');
const { OTP_TYPE } = require('./enums/otpEnums');
const {Op} = require('sequelize');

/**
 * Generates an N-digit OTP.
 * @param {number} length - The desired length of the OTP.
 * @returns {string} The generated OTP.
 */
const generateNDigitsOTP = (length) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};

/**
 * Verifies an OTP.
 * @param {string} contactInfo - The email or phone number associated with the OTP.
 * @param {string} otp - The OTP to verify.
 * @param {string} otpType - The type of OTP (e.g., 'Email', 'Phone').
 * @param {string} forPage - The page for which the OTP was generated (e.g., 'Student_Registration').
 * @returns {Promise<boolean>} True if the OTP is verified successfully, false otherwise.
 */
const verifyOTP = async (contactInfo, otp, otpType, forPage) => {
    try {
        const currentTime = new Date();

        let contactFilter = {};
        if (otpType === OTP_TYPE.EMAIL) {
            contactFilter = { email: contactInfo };
        } else if (otpType === OTP_TYPE.PHONE) {
            contactFilter = { phoneNumber: contactInfo };
        } else {
            return false; // Unknown OTP type
        }

        const emailOtp = await Otp.findOne({
            where: {
                ...contactFilter,
                otpType: otpType,
                forPage: forPage,
                expiresAt: { [Op.gte]: currentTime },
                isVerified: 0,
            },
            order: [['id', 'DESC']],
        });

        if (!emailOtp) return false;
        if (emailOtp.verifyAttempts >= 5) return false;
        if (emailOtp.otp === otp) {
            emailOtp.isVerified = 1;
            await emailOtp.save({ fields: ['isVerified'] });
            return true;
        } else {
            emailOtp.verifyAttempts += 1;
            await emailOtp.save({ fields: ['verifyAttempts'] });
            return false;
        }
    } catch (error) {
        console.error(`Error verifying OTP: ${error}`);
        return false;
    }
};

module.exports = {
    generateNDigitsOTP,
    verifyOTP,
};