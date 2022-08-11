// ** Global Error Handling Middleware **
// TODO: Differentiate Error Handling for DEV & PROD
// TODO: Handle Mongoose & MongoDB errors here, once they are established
const globalErrorHandler = (err, req, res, next) => {
    console.log('💥An Error has occured💥');
    console.log(err);
    err.status = err.status || 'error';
    err.statusCode = err.statusCode || 500;
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
};

module.exports = globalErrorHandler;