const Admin = require('../../models/users/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { successResponse, errorResponse } = require('../../utils/responseUtils');
const Vendor = require('../../models/vendor/vendor');
const User = require('../../models/users/user');

const adminLogin = async (req, res)=> {
    try {
        const {email, password} = req.body;
        // console.log(req.body);
        const admin = await Admin.findOne({raw: true});
        // console.log(admin);
        const isMatch = await bcrypt.compare(password, admin.password);
        if(email!=admin.email || !isMatch)return res.status(403).json({ msg: "Authentication Failed" });
        const obj = {id: admin.id, email };
        console.log(obj);
        const token = jwt.sign(obj, process.env.ADMIN_AUTH_SECRET_KEY, {expiresIn: "30d"});
        return successResponse({res, data: { username: admin.username, email }, extraObj: { token }, message: 'Admin logged in successfully', status: 200});
        // res.status(200).json({token, username: admin.username, email});
    } catch (error) {
        console.log(error);
        // res.status(400).json(error);
        return errorResponse({res, error, status: 500});
    }
};


const adminDashboard = async (req, res) => {
    try {
      const totalOrders = 10;
      const totalVendors = await Vendor.count();
      const totalRevenue = 10000;
      const totalUsers = await User.count();


      const dataObj = {
        totalOrders,
        totalVendors,
        totalRevenue,
        totalUsers
      };
      return successResponse({res, data: dataObj});
    } catch (error) {
        console.log(error);
        // res.status(400).json(error);
        return errorResponse({res, error});
    }
};


module.exports = {
    adminLogin,
    adminDashboard
}