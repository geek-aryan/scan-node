const buildingController = require('../controllers/buildingController');
const { adminAuth } = require('../middlewares/auth');
const router = require('express').Router();


router.post('/create-building', adminAuth, buildingController.createBuilding);
router.put('/update-building/:id', adminAuth, buildingController.updateBuilding);
router.get('/get-all-buildings', buildingController.getAllBuildings);



module.exports = router;