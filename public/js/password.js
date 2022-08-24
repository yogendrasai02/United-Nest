import { endpoints } from './api_endpoints.js';
import { makeAPICall } from './make_api_call.js';
import { showToast } from './toasts.js';
import { isEmail, isMobileNumber } from './validators.js';

let forgotForm = document.getElementById('forgotPassForm')
let resetFrom = document.getElementById('resetPassForm')

let forgotBtn = document.getElementById('forgotPassSubmitBtn')
let resetBtn = document.getElementById('resetPassSubmitBtn')

const ForgotPassHandler = async ()=>{
    let email = document.getElementById('email')
    let error = false;
    let ErrorMsg = '<ul>'
    if(email.value.length == 0 || !isEmail(email.value)){
        error = true;
        ErrorMsg += 'li>Please Enter a valid Email</li>'
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

const ResetPassHandler = async (req,res,next) => {
    let pass = document.getElementById('pass');
    let cpass = document.getElementById('cpass');
    const token = document.getElementById('token').value;
    let error = false;
    let ErrorMsg = '<ul>';
    if(pass.value.length < 8 ){
        error = true;
        ErrorMsg += 'li>Password Should have atleast 8 characters</li>'
    }
    if(pass.value !== cpass.value){
        error = true;
        ErrorMsg += '<li>Password and confirm password didnot match</li>'
    }
    ErrorMsg += '</ul>';
    if(error){
        showToast('fail', ErrorMsg);
        return
    }
    const {url, method} = endpoints.resetPassword;
    url += `/${token}`;
    const response = await makeAPICall(url,method,{password: pass.value, passwordConfirm: cpass.value})
    if(response.status && response.status === 'success'){
        showToast('success', 'Password is Reset. Redirecting to login..', 5);
        setTimeout(() => {
            location.href = '/login';
        }, 3 * 1000);
   } 
   else {
       showToast(response.status || 'error', response.message || 'Please try after sometime');
   }

}

forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await ForgotPassHandler();
});

forgotBtn.addEventListener('click', async ()=>{
    await ForgotPassHandler();
})