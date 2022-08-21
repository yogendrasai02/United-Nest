const Group = require("../models/groupModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const { v4: uuidv4 } = require('uuid');

// ** To render / page **
exports.renderHomePage = (req, res, next) => {
    res.redirect('/login');
};

// ** To render /login page **
exports.renderLoginPage = (req, res, next) => {
    res.render('login', {
        title: 'United Nest | Login'
    });
};

// ** To render /posts page **
exports.renderPostsPage = (req, res, next) => {
    res.render('posts', {
        title: 'United Nest | Posts'
    });
};


module.exports.chats_get = async (req, res) => {

    let username, userDataFromDb;

    username = req.user.username;

    console.log(username);

    try {
        userDataFromDb = await Chat.find({users : username}).exec();
    } catch(e) {
        console.log("Error ", e);
    }

    console.log("User data from DB: ", userDataFromDb);

    users = [];

    for(let val of userDataFromDb) {
        let user = {};
        if(val['users'][0] != username) {
            const userData = await User.findOne({username: val['users'][0]}, {_id: 0, profilePhoto: 1});
            user = {username: val['users'][0], roomId: val['roomId'], profilePhoto: userData['profilePhoto']};
        }
        else {
            const userData = await User.findOne({username: val['users'][1]}, {_id: 0, profilePhoto: 1});
            user = {username: val['users'][1], roomId: val['roomId'], profilePhoto: userData['profilePhoto']};
        }

        users.push(user);
    }

    let groupsData = await Group.find({users : username});

    res.render("chats", {username: username, isLoggedIn: true, users: users, groups: groupsData, title: 'United Nest | Posts'});
}

module.exports.chat_get = async (req, res) => {
    let fromUserData, toUserData;

    // try {
    //     fromUserData = await req.users;
    // } catch(e) {
    //     console.log("Error ", e);
    // }

    // try {
    //     toUserData = await userModel.findOne({username: username2}).exec();
    // } catch (e) {
    //     console.log("Error: ", e);
    // }

    const roomId = req.params.roomId;

    const username = req.user.username;

    console.log("fromUsername: ",username);

    // console.log(req.user);

    const toUsername = req.params.name2;

    try {
        userDataFromDb = await Chat.find({users : username}).exec();
    } catch(e) {
        console.log("Error ", e);
    }

    users = [];

    let toUserProfilePhoto = '';

    for(let val of userDataFromDb) {
        let user = {};
        let usrname;
        if(val['users'][0] != username) {
            const userData = await User.findOne({username: val['users'][0]}, {_id: 0, profilePhoto: 1});
            if(userData['profilePhoto'] === '') {
                userData['profilePhoto'] = '/img/user.png';
            }
            usrname = val['users'][0];
            user = {username: val['users'][0], roomId: val['roomId'], profilePhoto: userData['profilePhoto']};
        }
        else {
            const userData = await User.findOne({username: val['users'][1]}, {_id: 0, profilePhoto: 1});
            if(userData['profilePhoto'] === '') {
                userData['profilePhoto'] = '/img/user.png';
            }
            usrname = val['users'][1];
            user = {username: val['users'][1], roomId: val['roomId'], profilePhoto: userData['profilePhoto']};
        }
        if(usrname == toUsername) {
            toUserProfilePhoto = user['profilePhoto'];
        }
        users.push(user);
    }

    let groupsData = await Group.find({users : username});

    console.log("USERS: ", users);

    console.log("GROUPS DATA: ", groupsData);

    console.log(toUserProfilePhoto);

    if(toUserProfilePhoto === '') {
        toUserProfilePhoto = '/img/users-three.png';
    }

    res.render("chat", {isLoggedIn: true, roomId: roomId, username: username, toUsername: toUsername, users: users, groups: groupsData, title: 'United Nest | Posts', toUserProfilePhoto: toUserProfilePhoto});
}

module.exports.group_get = async (req, res) => {
    const userData = await User.find({}, {_id: 0, username: 1});
    res.render("creategroup", {isLoggedIn: true, userData: userData, title: 'United Nest | Chats'});
}

module.exports.group_post = async (req, res) => {
    console.log("In Group post");

    const groupDetails = JSON.parse(JSON.stringify(req.body));

    const roomId = uuidv4();

    const createdBy = req.user.username;

    let users = [];

    console.log(req.body);

    console.log("Group details: ", groupDetails);   

    for(let val in groupDetails) {
        if(val.startsWith("user")) {
            users.push(groupDetails[val]);
        }
    }

    users.push(createdBy);

    const groupData = new Group({roomId: roomId, createdBy: createdBy, users: users, groupname: groupDetails.gname, description: groupDetails.description});

    await groupData.save();

    res.redirect("/chats");
    // try {
    //     userDataFromDb = await Chat.find({users : createdBy}).exec();
    // } catch(e) {
    //     console.log("Error ", e);
    // }

    // users = [];

    // for(let val of userDataFromDb) {
    //     let user = {};
    //     if(val['users'][0] != createdBy) {
    //         const userData = await User.findOne({username: val['users'][0]}, {_id: 0, profilePhoto: 1});
    //         user = {username: val['users'][0], roomId: val['roomId'], profilePhoto: userData['profilePhoto']};
    //     }
    //     else {
    //         const userData = await User.findOne({username: val['users'][1]}, {_id: 0, profilePhoto: 1});
    //         user = {username: val['users'][1], roomId: val['roomId'], profilePhoto: userData['profilePhoto']};
    //     }

    //     users.push(user);
    // }

    // let groupsData = await Group.find({users : createdBy});

    // res.render("chats", {username: createdBy, isLoggedIn: true, users: users, groups: groupsData, title: 'United Nest | Posts'});
}
