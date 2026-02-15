const router = require('express').Router();
const adminController = require('../../controllers/users/adminController');
const { adminAuth } = require('../../middlewares/auth');

router.post('/admin-login', adminController.adminLogin);

router.get('/verify-admin', adminAuth, (req, res)=> {
    res.status(200).json({message: 'verified!'});
})

router.get('/admin-dashboard', adminAuth, adminController.adminDashboard);


module.exports = router;