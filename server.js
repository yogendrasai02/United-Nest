// ** Configure Environment Variables **
require('dotenv').config({
    path: './config.env'
});

// ** Final Safety Net for Uncaught Exception **
process.on('uncaughtException', err => {
    console.log('💥Uncaught Exception, shutting down the app...💥');
    console.log(err);
    process.exit(1);
});

const app = require('./app');   // IMPORTING here is an exception to normal convention of IMPORTS

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
    console.log(`Server started on port ${port} in ${process.env.NODE_ENV.toUpperCase()}👍`);
});

// ** Final Safety Net for Unhandled Promise Rejection **
process.on('unhandledRejection', err => {
    console.log('💥Unhandled Rejection, gracefully shutting down the app...💥');
    console.log(err);
    server.close(() => {
        process.exit(1);
    });
});