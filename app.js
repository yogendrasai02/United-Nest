// ** Import CORE modules **
const path = require("path");
const http = require("http");

// ** Import NPM modules **
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const socketio = require("socket.io");
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const expressMongoSanitize = require('express-mongo-sanitize');

// ** Import our OWN modules **
const AppError = require("./utils/AppError");
const authRouter = require("./routes/authRoutes");
const connectionRouter = require("./routes/connectionRoutes");
const adminRouter = require("./routes/adminRoutes");
const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes.js");
const searchRouter = require("./routes/searchRoutes.js");
const viewRouter = require("./routes/viewRoutes");
const globalErrorHandler = require("./controllers/errorController");
const chatRouter = require("./routes/chatRoutes.js");
const videoCallRouter = require('./routes/videoCallRoutes');
const User = require("./models/userModel");
const ChatMessage = require("./models/chatMessagesModel");

const app = express();
module.exports.app = app;

// ** Log incoming requests **
app.use(
  morgan(function (tokens, req, res) {
    return [
      "[ METHOD:",
      tokens.method(req, res),
      "]",
      "[ URL:",
      tokens.url(req, res),
      "]",
      "[ STATUS:",
      tokens.status(req, res),
      "]",
      "[ RES_TIME:",
      tokens["response-time"](req, res),
      "ms",
      "]",
    ].join(" ");
  })
);

// ** Serve static files from 'public' folder **
app.use(express.static(path.join(__dirname, "public")));

// ** Setup views & template ending **
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// ** Parse Request Body & Cookies **
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({
    extended: true
}));

// Limit API requests
// app.use('/api', rateLimiter({
//   windowMs: 60 * 60 * 1000,
//   max: 100,
//   message: 'Too many requests from this IP, please try again after an hour',
//   standardHeaders: true,
//   legacyHeaders: false
// }));

// Set HTTP Security Headers
// app.use(helmet());

// XSS
// app.use(xssClean());

// Sanitize input
// app.use(expressMongoSanitize());

const twilioClient = require('twilio')(
  process.env.TWILIO_API_KEY_SID,
  process.env.TWILIO_API_KEY_SECRET,
  {
      accountSid: process.env.TWILIO_ACCOUNT_SID
  }
);

// ** Serve the API Contract (Swagger/OpenAPI) **
const apiContract = YAML.load("./api-contract.yml");
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(apiContract));

const server = http.createServer(app);
const io = socketio(server);

module.exports.server = server;

const initSocket = async (req, res, next) => {

    io.on('connection', (socket) => { 

        socket.on('joinRoom', async (roomId) => {
            socket.join(roomId);
            // retrieve all the messages based on the roomId, then call emit method and emit all the documents
            const dataFromDb = await ChatMessage.find({roomId: roomId}).exec();
            console.log("Data from db: ", dataFromDb);
            for(let i=0; i< dataFromDb.length; i++) {
                let usrName = dataFromDb[i].fromUsername;
                let userdata = await User.findOne({username: usrName});
                if(userdata['profilePhoto'] === '') {
                    userdata['profilePhoto'] = '/img/user.png';
                }
                socket.emit('message', {username: dataFromDb[i].fromUsername, message: dataFromDb[i].message, dateAndTime: new Date(dataFromDb[i].dateAndTime).getHours() + ':' + new Date(dataFromDb[i].dateAndTime).getMinutes(), profilePhoto: userdata['profilePhoto']});
            }
        });

        socket.on('chatMessage', async (data) => {
            console.log("message_b: ", data);
            //store the roomId, username, message, timeStamp in DB
            let chatObj = new ChatMessage({roomId: data.roomId, fromUsername: data.username1, toUsername: data.username2, message: data.msg, dateAndTime: data.dateAndTime});
            await chatObj.save();
            let userdata = await User.findOne({username: data.username1});
            console.log("userdata: ", userdata);
            if(userdata['profilePhoto'] === '') {
                userdata['profilePhoto'] = '/img/user.png';
            }
            io.to(data.roomId).emit('message', {username: data.username1, message: data.msg, dateAndTime: new Date(data.dateAndTime).getHours() + ':' + new Date(data.dateAndTime).getMinutes(), profilePhoto: userdata['profilePhoto']});
        })
        
    });

}


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
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/connections", connectionRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/users", userRouter);
app.use(
  "/api/v1/video-call",
  (req, res, next) => {
    req.twilioClient = twilioClient;
    next();
  },
  videoCallRouter
);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/search", searchRouter);
initSocket();
app.use("/api/v1/chats", chatRouter);
app.use("/", viewRouter);

// ** Unhandled Routes **
app.all("*", (req, res, next) => {
  const err = new AppError("Specified Resource|Path does not exist", 404);
  next(err);
});

// ** Use the Global Error Handler (add to middleware stack) **
app.use(globalErrorHandler);
