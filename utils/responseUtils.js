function successResponse({res,  data = null, message = "Success", status = 200, extraObj = {}}) {
    return res.status(status).json({
        success: true,
        message,
        data,
        ...extraObj
    });
}

function errorResponse({res, error, status = 400}) {
    return res.status(status).json({
        success: false,
        message: error?.message || error || "Something went wrong",
    });
}

const correctImagePath = (imageUrl)=> {

    if(!imageUrl)return {image: '', success: false};
    if(imageUrl.startsWith('http')){
        return {success: false};
    }else{
        return {image: imageUrl, success: true};
    }
};

module.exports = {
    successResponse,
    errorResponse,
    correctImagePath
};