/*
 * While sending an error, it goes to the 'Global Error Handling Middleware'
 * Create the error object as: const err = new AppError(<ERROR_MSG>, <ERR_STATUS_CODE>);
 * Goto the global error handler as: return next(err);
*/
class AppError extends Error {
    constructor(errorMessage, statusCode) {
        super(errorMessage);
        this.statusCode = statusCode;
        // fail: 4xx, Client Side Error; error: 5xx, Internal Server Error
        this.status = (statusCode && `${statusCode}`.startsWith('4')) ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
        // with the above line, .stack property contains the stack trace
        this.isOperational = true;
    }
}

module.exports = AppError;