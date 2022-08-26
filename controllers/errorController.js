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
// TODO: Handle invalid Mongoose id error

const handleDEVError = (err, req, res) => {
    const fromAPI = req.originalUrl.startsWith('/api');
    if(fromAPI) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack
        });
    } else {
        return res.render('error', {
            title: 'United Nest | ERROR',
            errorCode: err.statusCode,
            errorMessage: err.message 
        });
    }
};

const handlePRODError = (err, req, res) => {
    const fromAPI = req.originalUrl.startsWith('/api');
    if(fromAPI) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack
        });
    } else {
        if(!(err.isOperational === true)) {
            err.message = 'Something went really wrong. Please try after sometime!'
        }
        return res.render('error', {
            title: 'United Nest | ERROR',
            errorCode: err.statusCode,
            errorMessage: err.message 
        });
    }
};

const globalErrorHandler = (err, req, res, next) => {
    console.log('💥An Error has occured💥');
    console.log(err);
    err.status = err.status || 'error';
    err.statusCode = err.statusCode || 500;
    if(err.name === 'TokenExpiredError')
        err = handleJWTTokenExpiredError(err);
    if(err.name === 'JsonWebTokenError')
        err = handleJWTJsonWebTokenError(err);
    if(process.env.NODE_ENV === 'development') {
        handleDEVError(err, req, res);
    } else {
        handlePRODError(err, req, res);
    }
};

module.exports = globalErrorHandler;