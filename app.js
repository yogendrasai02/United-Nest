// ** Import CORE modules **
const path = require('path');

// ** Import NPM modules **
require('dotenv').config({
    path: './config.env'
});
const express = require('express');
const morgan = require('morgan');

// ** Import our OWN modules **

const app = express();

// ** Log incoming requests **
app.use(morgan(function (tokens, req, res) {
    return [
        '[ METHOD:',
        tokens.method(req, res), ']',
        '[ URL:',
        tokens.url(req, res), ']',
        '[ STATUS:',
        tokens.status(req, res), ']',
        '[ RES_TIME:',
        tokens['response-time'](req, res), 'ms', ']'
    ].join(' ');
}));

// ** Serve static files from 'public' folder **
app.use(express.static(path.join(__dirname, 'public')));

// ** Uncomment and test **
// app.get('/', (req, res) => {
//     res.status(200).json({
//         status: 'success',
//         data: {
//             data: 'Hello World!'
//         }
//     });
// });

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server started on port ${port} in ${process.env.NODE_ENV.toUpperCase()}👍`);
});