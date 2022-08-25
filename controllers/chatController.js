const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Chat = require("../models/chatModel");
const GroupMessages = require("../models/groupMessagesModel");
const ChatMessages = require("../models/chatMessagesModel");
const UserConnection = require("../models/connectionModel");

const { v4: uuidv4 } = require('uuid');

module.exports.chats_get = async (req, res) => {

    let username, userDataFromDb;

    username = req.user.username;

    console.log(username);

    try {
        userDataFromDb = await Chat.find({users : username}).exec();
    } catch(e) {
        console.log("Error ", e);
    }

    users = [];

    for(let val of userDataFromDb) {
        if(val['users'][0] != username)
            users.push({username: val['users'][0], roomId: val['roomId']});
        else {
            users.push({username: val['users'][1], roomId: val['roomId']});
        }
    }

    let groupsData = await Group.find({users : username});

    res.render("chats", {username: username, isLoggedIn: true, users: users, groups: groupsData});
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

    const toUsername = req.params.username2;

    try {
        userDataFromDb = await Chat.find({users : username}).exec();
    } catch(e) {
        console.log("Error ", e);
    }

    users = [];

    for(let val of userDataFromDb) {
        if(val['users'][0] != username)
            users.push({username: val['users'][0], roomId: val['roomId']});
        else
            users.push({username: val['users'][1], roomId: val['roomId']});
    }

    let groupsData = await Group.find({users : username});

    console.log("USERS: ", users);

    console.log("GROUPS DATA: ", groupsData);

    res.render("chat", {isLoggedIn: true, roomId: roomId, fromUsername: username, toUsername: toUsername, users: users, groups: groupsData});
}

module.exports.group_get = async (req, res) => {
    const userData = await userModel.find({}, {_id: 0, username: 1});
    res.render("creategroup", {isLoggedIn: true, userData: userData});
}

module.exports.group_post = async (req, res) => {
    console.log("In Group post");

    const groupDetails = JSON.parse(JSON.stringify(req.body));

    let groupCheck = await Group.find({groupname: groupDetails.gname});

    if(groupCheck.length !== 0) {
        //send an error message that group already exists
        return res.send({message: "failure"});
        // showToast('failure', 'Group name already exists', 5);
    }

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

    res.send({message: "success"});
}

module.exports.singlechat_post = async (req, res) => {
    let suc = await Chat.deleteMany({});
    suc = await ChatMessages.deleteMany({});
    suc = await Group.deleteMany({});
    suc = await GroupMessages.deleteMany({});

    let usernames = await User.find({});
    console.log(usernames);

    for(let i = 0; i < usernames.length; i++) {
        for(let j = i+1; j < usernames.length; j++) {

            const d1 = await UserConnection.findOne({$and: [{requestSender: usernames[i]['username']}, {requestReceiver: usernames[j]['username']}, {status: "accepted"}]})
            const d2 = await UserConnection.findOne({$and: [{requestSender: usernames[j]['username']}, {requestReceiver: usernames[i]['username']}, {status: "accepted"}]})

            if(d1 !== null && d2 !== null) {
                const roomId = uuidv4();
                const users = [];

                users.push(usernames[i]['username']);
                users.push(usernames[j]['username']);

                const chatData = new Chat({roomId: roomId, users: users});

                let suc = await chatData.save();
            }
        }
    }
    res.send({usernames: usernames});
}