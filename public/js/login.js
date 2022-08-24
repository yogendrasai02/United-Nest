import { endpoints } from './api_endpoints.js';
import { makeAPICall } from './make_api_call.js';
import { showToast } from './toasts.js';
import { isEmail, isMobileNumber } from './validators.js';

const loginForm = document.getElementById('loginForm');
const loginFormSubmitBtn = document.getElementById('loginFormSubmitBtn');

const loginEventHandler = async function() {
    const identification = document.getElementById('identification').value;
    const password = document.getElementById('password').value;
    let loginErrorMsg = '<ul>', loginError = false;
    if(identification == null || identification.length == 0) {
        loginError = true;
        loginErrorMsg += '<li>Please enter an Email id or a Mobile Number</li>';
    }
    if(password == null || password.length == 0) {
        loginError = true;
        loginErrorMsg += '<li>Please enter a password</li>';
    }
    loginErrorMsg += '</ul>';
    if(loginError) {
        showToast('fail', loginErrorMsg);
        return;
    }
    const { url, method } = endpoints.login;
    const loginPOSTData = { password };
    if(isEmail(identification)) {
        loginPOSTData.email = identification;
    } else if(isMobileNumber(identification)) {
        loginPOSTData.mobile = identification;
    } else {
        showToast('fail', 'Please provide a valid Email Address or a valid 10 digit Mobile Number');
        return;
    }
    const response = await makeAPICall(url, method, loginPOSTData);
    if(response.status && response.status === 'success') {
        // Redirect to POSTS page
        showToast('success', 'Login Success, Redirecting...', 5);
        setTimeout(() => {
            location.href = '/posts';
        }, 3 * 1000);
    } else {
        showToast(response.status || 'error', response.message || 'Please try after sometime');
    }
}

loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    await loginEventHandler();
});

loginFormSubmitBtn.addEventListener('click', async () => {
    console.log('clicked')
    await loginEventHandler();
});