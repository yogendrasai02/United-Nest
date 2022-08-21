// ** Import CORE modules **
const path = require('path');
const http = require("http");

// ** Import NPM modules **
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const socketio = require("socket.io");

// ** Import our OWN modules **
const AppError = require('./utils/AppError');
const authRouter = require('./routes/authRoutes');
const connectionRouter = require('./routes/connectionRoutes');

const adminRouter = require('./routes/adminRoutes');
const userRouter = require('./routes/userRoutes');

const postRouter = require("./routes/postRoutes.js");
const searchRouter = require("./routes/searchRoutes.js");
const viewRouter = require('./routes/viewRoutes');
const chatRouter = require("./routes/chatRoutes.js");
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

const server = http.createServer(app);
const io = socketio(server);

const initSocket = async (req, res, next) => {

    io.on('connection', (socket) => { 

        socket.on('joinRoom', async (roomId) => {
            socket.join(roomId);
            // retrieve all the messages based on the roomId, then call emit method and emit all the documents
            const dataFromDb = await chatMessagesModel.find({roomId: roomId}).exec();
            console.log("Data from db: ", dataFromDb);
            for(let i=0; i< dataFromDb.length; i++) {
                socket.emit('message', {username: dataFromDb[i].fromUsername, message: dataFromDb[i].message, dateAndTime: new Date(dataFromDb[i].dateAndTime).getHours() + ':' + new Date(dataFromDb[i].dateAndTime).getMinutes()});
            }
        });

        socket.on('chatMessage', async (data) => {
            console.log("message_b: ", data);
            //store the roomId, username, message, timeStamp in DB
            let chatObj = new chatMessagesModel({roomId: data.roomId, fromUsername: data.username1, toUsername: data.username2, message: data.msg, dateAndTime: data.dateAndTime});
            await chatObj.save();
            io.to(data.roomId).emit('message', {username: data.username1, message: data.msg, dateAndTime: new Date(data.dateAndTime).getHours() + ':' + new Date(data.dateAndTime).getMinutes()});
        })
        
    });

}

// ** Delegate Requests to the specific routes **
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/connections', connectionRouter);

app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/users', userRouter);

app.use('/api/v1/posts', postRouter);
app.use('/api/v1/search', searchRouter);
initSocket();
app.use("/api/v1/chats", chatRouter);
app.use('/', viewRouter);

// ** Unhandled Routes **
app.all('*', (req, res, next) => {
    const err = new AppError('Specified Resource|Path does not exist', 404);
    next(err);
});

// ** Use the Global Error Handler (add to middleware stack) **
app.use(globalErrorHandler);