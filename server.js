// ** Configure Environment Variables **
require('dotenv').config({
    path: './config.env'
});
const mongoose = require('mongoose');

// ** Final Safety Net for Uncaught Exception **
process.on('uncaughtException', err => {
    console.log('💥Uncaught Exception, shutting down the app...💥');
    console.log(err);
    process.exit(1);
});

// const app = require('./app').app;   // IMPORTING here is an exception to normal convention of IMPORTS
const {app, server} = require('./app');
const environment = process.env.NODE_ENV.toUpperCase();

// ** Connect to DB as per environment **
const dbUrl = process.env[`DB_URL_${environment}`]
                .replace('<password>', process.env[`DB_PASSWORD_${environment}`]);
mongoose.connect(dbUrl).then(conn => {
    console.log(`Connected to DB in ${environment} successfully👍`);
});

const port = process.env.PORT || 4000;
// const server = app.listen(port, () => {
//     console.log(`Server started on port ${port} in ${environment}👍`);
// });

server.listen(port, () => {
    console.log(`Server started on port ${port} in ${environment}👍`);
});

// ** Final Safety Net for Unhandled Promise Rejection **
process.on('unhandledRejection', err => {
    console.log('💥Unhandled Rejection, gracefully shutting down the app...💥');
    console.log(err);
    server.close(() => {
        process.exit(1);
    });
});

// ** handle SIGTERM sent by HEROKU (dynos restart every 24 hours) **
process.on('SIGTERM', () => {
    console.log('✌️SIGTERM RECEIVED, gracefully shutting down the app...');
    server.close(() => {
        console.log('💥Process Terminated...');
    });
});