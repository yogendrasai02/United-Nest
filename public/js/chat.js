const socket = io();
import { showToast } from './toasts.js';
//GET 2 usernames from URL 
console.log(location.search);
const url = location.href;
let c = 0;
const arr = url.split('/');

console.log("array: ", arr);
const username1 = arr[arr.length - 3];
const username2 = arr[arr.length - 2];
const roomId = arr[arr.length - 1];

// const {username1, username2} = Qs.parse(location.search, {
//     ignoreQueryPrefic: true
// })

console.log(username1, username2);

socket.emit("joinRoom", roomId);

const sendBtn = document.getElementsByClassName("sendBtn")[0];
const message = document.getElementsByClassName("message")[0];

function sendMessage() {
    const msg = message.value;

    if(msg === '') {
        showToast("fail", "message can't be empty", 2);
        return;
    }
    message.value = '';
    message.focus();
    let data = {msg, roomId, username1, username2, dateAndTime: new Date()};
    console.log("MEssage is: ", msg);
    socket.emit('chatMessage', data);
}

sendBtn.addEventListener("click", sendMessage);

message.addEventListener("keypress", (e) => {
    console.log("Hello");
    if(e.key === "Enter") {
        sendBtn.click();
    }
})

// const chatForm = document.getElementById('send-container');

socket.on('message', data => {
    console.log(data.message);

    outputMessage(data);
});

// chatForm.addEventListener('submit', (e) => {

//     let timeStamp = new Date();

//     e.preventDefault();

//     //get message text
//     const msg = e.target.elements['message-input'].value;

//     e.target.elements['message-input'].value = '';

//     e.target.elements['message-input'].focus();
//     //emitting a message to the server
//     data = {msg, roomId, username1, username2, dateAndTime: new Date()};
//     console.log("MEssage is: ", msg);
//     socket.emit('chatMessage', data);
// })

//output message to DOM
function outputMessage(message) {
    
    console.log(message);

    let main_div;

    if(username1 === message.username) {
        message.username = "You";
        main_div = document.createElement("div");
        main_div.classList.add('chat-message-right', 'mb-4');
    } else {
        main_div = document.createElement("div");
        main_div.classList.add('chat-message-left', 'mb-4');
    }
    
    main_div.style.borderColor = '#dee2e6';
    main_div.style.borderSize = '1px';
    main_div.style.borderType = 'solid';
    main_div.style.boxShadow = '0px 0px 3px grey';

    let img = document.createElement('img');
    img.src = message.profilePhoto;
    img.height = 40;
    img.width = 40;
    img.alt = message.username;
    img.classList.add('rounded-circle', 'me-1', 'msgphoto');

    let div2 = document.createElement("div");
    div2.classList.add('text-muted', 'small', 'text-nowrap', 'mt-2');
    console.log(message.dateAndTime);
    div2.innerHTML = moment(message.dateAndTime).format('HH:mm');

    let inner_div_1 = document.createElement("div");

    inner_div_1.appendChild(img);
    inner_div_1.appendChild(div2);

    let inner_div_2 = document.createElement("div");
    inner_div_2.classList.add('flex-shrink-1', 'bg-light', 'rounded', 'py-2', 'px-3', 'me-3');

    let div5 = document.createElement("div");
    div5.classList.add('fw-bold', 'text-decoration-underline', 'mb-1');
    
    div5.innerHTML = message.username;

    let div6 = document.createElement("div");
    div6.innerHTML = message.message;

    inner_div_2.appendChild(div5);
    inner_div_2.appendChild(div6);    

    main_div.appendChild(inner_div_1);
    main_div.appendChild(inner_div_2);

    const chatMessages = document.getElementsByClassName('chat-messages')[0];

    chatMessages.appendChild(main_div);
}