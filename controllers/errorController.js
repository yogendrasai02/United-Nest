const AppError = require("../utils/AppError");

const handleJWTTokenExpiredError = err => {
    return new AppError('Your login session has expired, please login again', 401);
}

const handleJWTJsonWebTokenError = err => { 
    return new AppError(`Invalid Session, please login again`, 401);
}

// ** Global Error Handling Middleware **
// TODO: Differentiate Error Handling for DEV & PROD
// TODO: Handle Mongoose & MongoDB errors here, once they are established
const globalErrorHandler = (err, req, res, next) => {
    console.log('💥An Error has occured💥');
    console.log(err);
    err.status = err.status || 'error';
    err.statusCode = err.statusCode || 500;
    if(err.name === 'TokenExpiredError')
        err = handleJWTTokenExpiredError(err);
    if(err.name === 'JsonWebTokenError')
        err = handleJWTJsonWebTokenError(err);
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
};

module.exports = globalErrorHandler;