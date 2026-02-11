const Otp = require("../../models/otps/otp");
const User = require("../../models/users/user");
const bcrypt = require('bcryptjs');
const path = require('path');

const { Op } = require('sequelize');
// const { sendEjsMail } = require("../../services/nodemailer");
const { generateNDigitsOTP, verifyOTP } = require("../../utils/otpUtils");
const { OTP_TYPE, OTP_PAGE } = require("../../utils/enums/otpEnums");
const jwt = require('jsonwebtoken');
const { errorResponse, successResponse, correctImagePath } = require("../../utils/responseUtils");
const UserAddress = require("../../models/users/userAddress");


const generateMobileRegisterOtp = async (req, res) => {
    try {
        const {phoneNumber} = req.body;
        const currentTime = new Date();
        const alreadyOtps = await Otp.count({
            where: {
                phoneNumber: phoneNumber,
                expiresAt: {
                    [Op.gte]: currentTime,
                },
                isVerified: 0
            }
        });
        if(alreadyOtps >= 5){
            return errorResponse({res, error: 'Otp Limit Reached!', status: 429});
            // return res.status(400).json({ message: 'Otp Limit Reached!' });
        }
        // const otp = generateNDigitsOTP(6);
        const otp = '123456';
        const otpValidityMinutes = 10;
        await Otp.create({
            phoneNumber: phoneNumber,
            otp: otp,
            otpType: OTP_TYPE.PHONE,
            forPage: OTP_PAGE.USER_LOGIN,
            expiresAt: new Date(Date.now() + otpValidityMinutes * 60 * 1000)
        });
        

        const alreadyUser = await User.findOne({where: {mobile: phoneNumber, accountDeleted: 0}});
        if(!alreadyUser){
            await User.create({mobile: phoneNumber, isProfileRegistered: false});
        }
        return successResponse({res, message: 'Otp sent successfully'});
        // return res.status(200).json({message: 'otp sent successfully'});
        
    }catch(error){
        console.log(error);
        // res.status(400).json(error);
        return errorResponse({res, error, status: 400});
    }
};

const verifyUserWithMobileOtp = async (req, res) => {
    try {
        const {phoneNumber, otp} = req.body;
        const verifyOtp = await verifyOTP(phoneNumber, otp, OTP_TYPE.PHONE, OTP_PAGE.USER_LOGIN);
        if(!verifyOtp)return errorResponse({res, error: 'Invalid OTP', status: 400});

        let user = await User.findOne({where: {mobile: phoneNumber, accountDeleted: 0}});
        if(!user) user = await User.create({mobile: phoneNumber, isProfileRegistered: false});
        // console.log(user.toJSON());  
        const token = jwt.sign({id: user.id, mobile: user.mobile, role: 'user'}, process.env.USER_AUTH_SECRET_KEY, {expiresIn: '30d'});
        const extraObj = { token };
        return successResponse({res, data: { isProfileRegistered: user.isProfileRegistered }, extraObj, message: 'User verified successfully'});
    }catch(error){
        console.log(error);
        // res.status(400).json(error);
        return errorResponse({res, error, status: 400});
    }
};

const updateUserProfile = async (req, res) => {
    try {
        // console.log(req.body);
        const _id = req.user.id;
        // console.log(_id);
        const user = await User.findByPk(_id);
        let {image, ...myBody} = req.body;
        if(image){
            const checkCorrectImagePath = correctImagePath(image);
            if(checkCorrectImagePath.success){
                myBody.image = checkCorrectImagePath.image;
            }
        }

        if(!user)return errorResponse({res, error: 'user not found', status: 404});
        await user.update({
            ...myBody,
            isProfileRegistered: true,
        }, {fields: ['name', 'image', 'username', 'password', 'email', 'address', 'city', 'state', 'buildingId', 'isProfileRegistered']});
        
        await UserAddress.destroy({
            where: {
                userId: _id
            }
        });

        await UserAddress.create({
            userId: _id,
            addressCategory: 'Home',
            street: myBody.address,
            ...req.body
        });

        return successResponse({res, message: 'Profile registered successfully'});
    } catch (error) {
        console.log(error);
        // res.status(400).json(error);
        return errorResponse({res, error, status: 400});
    }
};

const checkUserProfileRegistered = async (req, res) => {
    try {
        const _id = req.user.id;
        const user = await User.findByPk(_id);
    
        if(!user)return errorResponse({res, error: 'user not found', status: 404});
        return successResponse({res, data: { isProfileRegistered: user.isProfileRegistered }});
    } catch (error) {
        console.log(error);
        // res.status(400).json(error);
        return errorResponse({res, error, status: 400});
    }
};


const socialLogin = async (req, res) => {
    try {
        // console.log(req.body);
        const {email} = req.body;
        let user = await User.findOne({where: {email: email, accountDeleted: 0}});
        if(!user){
            user = await User.create({email: email, isProfileRegistered: false});
        }
        const token = jwt.sign({id: user.id, email: user.email, role: 'user'}, process.env.USER_AUTH_SECRET_KEY, {expiresIn: '30d'});
        const extraObj = { token };
        return successResponse({res, data: { isProfileRegistered: user.isProfileRegistered }, extraObj});
    } catch (error) {
        console.log(error);
        return errorResponse({res, error, status: 400});
        // res.status(400).json(error);
    }
};

const getUserProfile = async (req, res) => {
    try {
        const _id = req.user.id;
        const user = await User.findByPk(_id, {
            attributes: ['id', 'image', 'name', 'email', 'mobile', 'address']
        });
    
        if(!user)return errorResponse({res, error: 'user not found', status: 404});
        user.dataValues.drawEntries = 12;
        user.dataValues.offersUsed = 20;
        user.dataValues.visit = 25;
        return successResponse({res, data: user});
    } catch (error) {
        console.log(error);
        return errorResponse({res, error, status: 400});
    }
};

const uploadPhoto = async (req, res) => {
    try {
        const file = req.file.filename;
        const image = file;
        return successResponse({res, data: image});
    } catch (error) {
        console.log(error);
        return errorResponse({res, error, status: 400});
    }
};

const addUpdateUserAddressByAddressCategory = async (req, res) => {
    try {
        if(!req.body.addressCategory){
            return errorResponse({res, message: 'address category not found!', status: 404});
        }   
    
        const alreadyAddress = await UserAddress.findOne({
            where: {
                userId: req.user.id,
                // addressCategory: req.body.addressCategory
            }
        });
        if(alreadyAddress){
            await alreadyAddress.update({
                ...req.body
            });
            return successResponse({res, message: 'success!'});
        }
        await UserAddress.create({
            ...req.body,
            userId: req.user.id
        });
        return successResponse({res, message: 'success!'});
    } catch (error) {
        console.log(error);
        return errorResponse({res, error});
    }
};

const getUserAddressByAddressCategory = async (req, res) => {
    try{
        
        // const { addressCategory } = req.query;
        const userAddress = await UserAddress.findOne({
            where: {
                userId: req.user.id,
                // addressCategory
            },
            attributes: ['id', 'addressCategory', 'city', 'state', 'street', 'country', 'postCode']
        });
        if(!userAddress)return errorResponse({res, error: 'address not found!', status: 404});
        return successResponse({res, data: userAddress, message: 'address fetched successfully', status: 200});
    }catch(error){
        console.log(error);
        return errorResponse({res, error});
    }
};

const deleteUserAccount = async (req, res) => {
    try {
        const _id = req.user.id;
        const user = await User.findByPk(_id);
    
        if(!user)return errorResponse({res, error: 'user not found', status: 404});
        await user.update({
            accountDeleted: 1,
        }, {fields: ['accountDeleted']});
        return successResponse({res, message: 'User account deleted successfully'});
    } catch (error) {
        console.log(error);
        return errorResponse({res, error, status: 400});
    }
};


const userController = {
    generateMobileRegisterOtp,
    verifyUserWithMobileOtp,
    updateUserProfile,
    checkUserProfileRegistered,
    socialLogin,
    getUserProfile,
    uploadPhoto,
    addUpdateUserAddressByAddressCategory,
    getUserAddressByAddressCategory,
    deleteUserAccount
};

module.exports = userController;