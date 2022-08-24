import { isEmail, isMobileNumber } from './validators.js';
import { endpoints } from './api_endpoints.js';
import { makeAPICall } from './make_api_call.js';
import { showToast } from './toasts.js';
let form  = document.getElementById('signupForm')
let formsubmit = document.getElementById('signupFormSubmitBtn')

const SignUpHandler = async ()=>{
    
    //form elements
    let name = document.getElementById('name')
    let username = document.getElementById('username')
    let email = document.getElementById('email')
    let mobile = document.getElementById('mobile');
    let pass = document.getElementById('password')
    let cpass = document.getElementById('passwordConfirm')

    //Error messages
    let signupErrorMsg = '<ul>'

    let signupErr = false;

    if(name.value.length == 0){
        signupErr = true
        signupErrorMsg += '<li>Name is required!</li>'
    }
    if(username.value.length == 0){
        signupErr = true
        signupErrorMsg = '<li>Username is required!</li>'
    }
    if(email.value.length == 0 ||  !isEmail(email.value)){
        signupErr = true
        signupErrorMsg = '<li>Please enter a valid email</li>'
    }
    if(mobile.value.length < 10 || !isMobileNumber(mobile.value)){
        signupErr = true
        signupErrorMsg = '<li>Please enter a valid mobilenumber</li>'
    }
    if(pass.value.length < 8){
        signupErr = true
        if(pass.value.length == 0){
            signupErrorMsg = '<li>Please enter a password</li>'
        }
        else{
            signupErrorMsg = '<li>Password should have minimum 8 characters</li>'
        }
    }
    if(pass.value !== cpass.value){
        signupErr = true;
        signupErrorMsg = "<li>Password and Confirm Password didn't match</li>"
    }
    signupErrorMsg += '</ul>';
    if(signupErr) {
        showToast('fail', signupErrorMsg);
        return;
    }

    const { url, method } = endpoints.signup;

    const signupPOSTData = { 
        name: name.value,
        username: username.value,
        email: email.value,
        mobile: mobile.value,
        password: pass.value,
        passwordConfirm: cpass.value
    };

    const response = await makeAPICall(url, method, signupPOSTData);
    if(response.status && response.status === 'success') {
        // Redirect to verify mail page
        showToast('success', 'Signup, Success, Redirecting...', 5);
        setTimeout(() => {
            location.href = '/posts';
        }, 3 * 1000);
    } else {
        showToast(response.status || 'error', response.message || 'Please try after sometime');
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await SignUpHandler();
})

formsubmit.addEventListener('click', async (e)=>{
    e.preventDefault();
    await SignUpHandler();
})