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

const updateBuilding = async (req, res) => {
    try {
        const { id } = req.params;
        const building = await Building.findByPk(id);
        if (!building) {
            return errorResponse({ res, message: 'Building not found!', status: 404 });
        }
        await building.update(req.body);
        return successResponse({ res, data: building, message: 'Building updated successfully', status: 200 });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error, status: 500 });
    }
};

const getAllBuildings = async (req, res) => {
    try {
        const buildings = await Building.findAll({
            attributes: ['id', 'name', 'status']
        });
        return successResponse({ res, data: buildings, message: 'Buildings fetched successfully', status: 200 });
    } catch (error) {
        console.log(error);
        return errorResponse({ res, error, status: 500 });
    }
};





module.exports = {
    createBuilding,
    updateBuilding,
    getAllBuildings,
};

//