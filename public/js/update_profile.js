import { endpoints } from './api_endpoints.js';
import { makeAPICallFile} from './make_api_call.js';
import { showToast } from './toasts.js';
import { isEmail, isMobileNumber } from './validators.js';

let profile = document.getElementById('profile-label');
let file = document.getElementById('file');

let form = document.getElementById('updateForm');
let name = document.getElementById('name');
let username = document.getElementById('username');
let email = document.getElementById('email');
let mobile = document.getElementById('mobile');
let description = document.getElementById('desc');
let submitBtn = document.getElementById('uploadFormSubmitBtn');

const olduser = {
    name: name.value,
    username: username.value,
    email: email.value,
    mobile : mobile.value,
    description: description.value,
}
olduser.images = (profile.src == 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png') ? '' : profile.src;

const FormSubmitHandler = async ()=>{
    let payload = new FormData();
    let ErrorMsg = '<ul>', error = false;
    if(name.value !== olduser.name){
        if(name.value.length > 0){
            payload.append('name', name.value)
        }
        else{
            error=true
            ErrorMsg += '<li>Please enter the name</li>'
        }
    }
    if(username.value !== olduser.username){
        if(username.value.length > 0){
            payload.append('username', username.value)
        }
        else{
            error=true
            ErrorMsg += '<li>Please enter the username</li>'
        }
    }
    if(email.value !== olduser.email){
        if(email.value.length > 0 && isEmail(email.value)){
            payload.append('email', email.value)
        }
        else{
            error=true
            ErrorMsg += '<li>Please enter proper email</li>'
        }
    }
    if(mobile.value !== olduser.mobile){
        if(mobile.value.length == 10 && isMobileNumber(mobile.value)){
            payload.append('mobile', mobile.value)
        }
        else{
            error=true
            ErrorMsg += '<li>Please enter proper mobile number</li>'
        }
    }
    if(file.files[0]){
        payload.append('images', file.files[0])
    }
    if(description.value != olduser.description){
        payload.append('description',  description.value)
    }
    ErrorMsg += '</ul>';
    if(error){
        showToast('fail', ErrorMsg);
        return;
    }
    console.log(payload)
    const { url, method } = endpoints.updateProfile;
    const response = await makeAPICallFile(url, method, payload);
    if(response.status && response.status === 'success') {
        // Redirect to PROFILE Page
        showToast('success', 'Update Success, Redirecting...', 5);
        setTimeout(() => {
            location.href = '/my-profile';
        }, 3 * 1000);
    } else {
        showToast(response.status || 'error', response.message || 'Please try after sometime');
    }
    
}



form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    await FormSubmitHandler();
})
submitBtn.addEventListener('click', async ()=>{
    console.log('i was clicked')
    await FormSubmitHandler();
})
profile.addEventListener('click', ()=>{
    file.click();
})
file.addEventListener('change', ()=>{
    profile.src = URL.createObjectURL(file.files[0]);
    console.log(file.files[0]);
})