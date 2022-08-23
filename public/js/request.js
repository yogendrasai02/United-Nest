import { makeAPICall } from './make_api_call.js';
import {endpoints} from './api_endpoints.js';

const form1 = document.getElementById('form1');
const form2 = document.getElementById('form2');

const baseURL = 'http://localhost:4000';
// let username = document.getElementById('username').innerHTML;

// console.log(username);

if(form1 !== null) {
    form1.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log(e);
        console.log(makeAPICall);
        let url = endpoints['actOnRequest']['url'];
        const uname = e.target[0].value;
        url += `/${uname}/accept`;
        makeAPICall(url, 'PATCH')
        .then((data) => {
            console.log(data);
            window.location.href = baseURL + '/requests/allfollowers';
        });
    });
}

if(form2 !== null) {
    form2.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log(e);
        console.log(makeAPICall);
        let url = endpoints['actOnRequest']['url'];
        const uname = e.target[0].value;
        url += `/${uname}/reject`;
        makeAPICall(url, 'PATCH')
        .then((data) => {
            console.log(data);
            window.location.href = baseURL + '/requests/allfollowers';
        });
    });
}