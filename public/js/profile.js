import { endpoints } from './api_endpoints.js';
import { makeAPICall, makeAPICallFile} from './make_api_call.js';
import { showToast } from './toasts.js';
import { isEmail, isMobileNumber } from './validators.js';


const baseURL = '';

let sendFollowRequest = async ()=> {
    let name = window.location.href.split('/').at(-1);
    // let url = `http://localhost:4000/api/v1/connections/followRequests/${name}`;
    let url = `/api/v1/connections/followRequests/${name}`;
    let method = 'PATCH'

    const response = await makeAPICallFile(url, method);
    if(response.status && response.status === 'success') {
        // Redirect to POSTS page
        showToast('success', 'Request sent....', 5);
        btn.disabled = true;
        btn.classList.add('disabled');
    } else {
        showToast(response.status || 'error', response.message || 'Please try after sometime');
    }

}

try{
    let btn = document.getElementById('followBtn');
    btn.addEventListener('click', async ()=>{
        await sendFollowRequest();
    })
}
catch(err){
    console.log(err);
}