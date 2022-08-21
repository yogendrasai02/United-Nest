import { endpoints } from './api_endpoints.js';
import { makeAPICall } from './make_api_call.js';

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log(e.target);
    const password = e.target.password.value;
    const { url, method } = endpoints.login;
    const loginPOSTData = { password };
    if(e.target.username) {
        loginPOSTData.username = e.target.username.value;
    } else if(e.target.email) {
        loginPOSTData.email = e.target.email.value;
    } else {
        loginPOSTData.mobile = e.target.mobile.value;
    }
    const response = await makeAPICall(url, method, loginPOSTData);
    if(response.status && response.status === 'success') {
        // Redirect to POSTS page
        location.href = '/posts';
    }
});