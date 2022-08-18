// ** Import CORE modules **
const path = require('path');

// ** Import NPM modules **
const express = require('express');
const morgan = require('morgan');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');

// ** Import our OWN modules **
const AppError = require('./utils/AppError');
const authRouter = require('./routes/authRoutes');
const connectionRouter = require('./routes/connectionRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

module.exports = app;

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

// ** Parse Request Body **
app.use(express.json());

// ** Serve the API Contract (Swagger/OpenAPI) **
const apiContract = YAML.load('./api-contract.yml');
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(apiContract));

// ** Uncomment and test **
// app.get('/test-route', (req, res, next) => {
//     res.status(200).json({
//         status: 'success',
//         data: {
//             data: 'Hello World!'
//         }
//     });
// });

// ** Delegate Requests to the specific routes **
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/connections', connectionRouter);

// ** Unhandled Routes **
app.all('*', (req, res, next) => {
    const err = new AppError('Specified Resource/Path does not exist', 404);
    next(err);
});

// ** Use the Global Error Handler (add to middleware stack) **
app.use(globalErrorHandler);