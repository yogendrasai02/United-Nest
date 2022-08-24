import { endpoints } from './api_endpoints.js';
import { makeAPICall } from './make_api_call.js';
import { showToast } from './toasts.js';

let resetForm = document.getElementById('resetPassForm')

let resetBtn = document.getElementById('resetPassSubmitBtn')


let ResetPassHandler = async () => {
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


    let {url, method} = endpoints.resetPassword;

    //** add the token to the url **
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


resetForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    await ResetPassHandler();
})

resetBtn.addEventListener('click', async ()=>{
    await ResetPassHandler();
})