const jwt = require('jsonwebtoken');

const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        // console.log(token, authHeader);
        if(!token)return res.sendStatus(401);
        jwt.verify(token, process.env.ADMIN_AUTH_SECRET_KEY, (err, user)=>{
            if(err){
                return res.status(403).json({msg: "jwt verification failed"});
            }
            req.user = user;
            // console.log(user, "user");
            next();
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
};

const userAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        // console.log(token, authHeader);
        if(!token)return res.sendStatus(401);
        jwt.verify(token, process.env.USER_AUTH_SECRET_KEY, (err, user)=>{
            if(err){
                return res.status(403).json({msg: "jwt verification failed"});
            }
            // console.log(user);
            req.user = user;
            // console.log(user, "user");
            next();
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
};


module.exports = {adminAuth, userAuth};