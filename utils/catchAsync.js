// ** To CATCH errors with ASYNCHRONOUS FUNCTION (especially async route handlers) **
const catchAsync = (asyncFunction) => {
    console.log('Inside CatchAsync');
    return (req, res, next) => {
        asyncFunction(req, res, next).catch(err => next(err));
    };
};

module.exports = catchAsync;