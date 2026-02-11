const Building = require('../models/building');
const { successResponse, errorResponse } = require('../utils/responseUtils');

const createBuilding = async (req, res) => {
    try {
        // const { name, address, city, state, zipCode, country, sequenceNo } = req.body;
        const building = await Building.create({ ...req.body });
        return successResponse({ res, data: building, message: 'Building created successfully', status: 201 });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error, status: 500 });
    }
};

const getAllBuildings = async (req, res) => {
    try {
        const buildings = await Building.findAll({
            attributes: ['id', 'name']
        });
        return successResponse({ res, data: buildings, message: 'Buildings fetched successfully', status: 200 });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error, status: 500 });
    }
};

module.exports = {
    createBuilding,
    getAllBuildings
};

//