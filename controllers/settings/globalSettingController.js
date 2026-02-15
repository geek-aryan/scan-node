const GlobalSetting = require('../../models/global_setting');
const { errorResponse, successResponse } = require('../../utils/responseUtils');


const addUpdateGlobalSettings = async (req, res) => {
    try {
        // const { vendorRadius } = req.body;
        const globalSetting = await GlobalSetting.findOne();
        const body = req.body;
        if(globalSetting){
            await globalSetting.update({...body});
        }else{
            await GlobalSetting.create({...body});
        }
        return successResponse({res, message: 'Global settings updated successfully', status: 200});
    } catch (error) {
        console.log(error);
        return errorResponse({res, error, status: 400});
    }
};

const getGlobalSettings = async (req, res) => {
    try {
        const globalSetting = await GlobalSetting.findOne();
        return successResponse({res, data: globalSetting, message: 'Global settings fetched successfully', status: 200});
    } catch (error) {
        console.log(error);
        return errorResponse({res, error, status: 400});
    }
};


module.exports = {
    addUpdateGlobalSettings,
    getGlobalSettings
};

//