import { showToast } from './toasts.js';
import { makeAPICall } from './make_api_call.js';
import { endpoints } from './api_endpoints.js';
const users = document.getElementsByClassName('users');
const form = document.getElementById('createGroup');

console.log(form);

for(let user of users) {
    user.addEventListener('click', (e) => {
        console.log(e);
        if(e.target.classList.contains('selected')) {
            e.target.classList.remove('selected');
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.color = 'black';
        } else {
            e.target.classList.add('selected');
            e.target.style.backgroundColor = '#8ce99a';
            e.target.style.color = '#f8f9fa';
        }
        console.log("Hello");
    })
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let data = {};
    console.log(e);

    for(let i = 0; i < e['target'].length; i++) {
        data[e['target'][i]['name']] = e['target'][i]['value']
    }

    // console.log(data);
    makeAPICall(endpoints['createGroup']['url'], endpoints['createGroup']['method'], data)
    .then((data) => {
        if(data['message'] === 'success') {
            window.location.href = '/chats';
        } else {
            showToast('fail', 'Group name already exists', 5);
            // window.location.href = '/chats/createGroup';
        }
    });
});

// action='/chats/createGroup' method='POST'
// form.addEventListener('submit', (e) => {
//     e.preventDeafault();

//     console.log("Hello");
// })