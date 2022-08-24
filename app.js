// ** Import CORE modules **
const path = require('path');

// ** Import NPM modules **
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');

// ** Import our OWN modules **
const AppError = require('./utils/AppError');
const authRouter = require('./routes/authRoutes');
const connectionRouter = require('./routes/connectionRoutes');
const adminRouter = require('./routes/adminRoutes');
const userRouter = require('./routes/userRoutes');
const postRouter = require("./routes/postRoutes.js");
const viewRouter = require('./routes/viewRoutes');
const videoCallRouter = require('./routes/videoCallRoutes');
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

// ** Setup views & template ending **
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ** Parse Request Body & Cookies **
app.use(express.json());
app.use(cookieParser());

// ** Get the Twilio Client **
const twilioClient = require('twilio')(
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_KEY_SECRET,
    {
        accountSid: process.env.TWILIO_ACCOUNT_SID
    }
);

// ** Serve the API Contract (Swagger/OpenAPI) **
const apiContract = YAML.load('./api-contract.yml');
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(apiContract));

// ** Delegate Requests to the specific routes **
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/connections', connectionRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/video-call', (req, res, next) => {
    req.twilioClient = twilioClient;
    next();
}, videoCallRouter);
app.use('/api/v1/posts', postRouter);
app.use('/', viewRouter);

// ** Unhandled Routes **
app.all('*', (req, res, next) => {
    const err = new AppError('Specified Resource|Path does not exist', 404);
    next(err);
});

// ** Use the Global Error Handler (add to middleware stack) **
app.use(globalErrorHandler);