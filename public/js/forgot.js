import { endpoints } from './api_endpoints.js';
import { makeAPICall } from './make_api_call.js';
import { showToast } from './toasts.js';
import { isEmail } from './validators.js';

let forgotForm = document.getElementById('forgotPassForm')

// let forgotBtn = document.getElementById('forgotPassSubmitBtn')

const ForgotPassHandler = async ()=>{
    let email = document.getElementById('email')
    let error = false;
    let ErrorMsg = '<ul>'
    if(email.value.length == 0 || !isEmail(email.value)){
        error = true;
        ErrorMsg += '<li>Please Enter a valid Email</li>'
    }
    ErrorMsg += '</ul>';
    if(error){
        showToast('fail', ErrorMsg);
        return
    }
    const { url, method } = endpoints.forgotPassword;
    const payload = {email:email.value}
    const response = await makeAPICall(url, method, payload);
    if(response.status && response.status === 'success'){
         showToast('success', 'Password Reset link is sent to mail, if not please try again', 5);
    } 
    else {
        showToast(response.status || 'error', response.message || 'Please try after sometime');
    }
}


forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await ForgotPassHandler();
});

// forgotBtn.addEventListener('click', async ()=>{
//     await ForgotPassHandler();
// })