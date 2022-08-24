// import { endpoints } from './api_endpoints.js';
// import { makeAPICall } from './make_api_call.js';
// import { showToast } from './toasts.js';

const friendsDiv = document.querySelector('.friends');

friendsDiv.addEventListener('click', async (e) => {
    const eventPath = e.composedPath();
    // 1. get to the parent .friend div and get the id
    let selectedUsername = null;
    for(let parent of eventPath) {
        if(parent.classList && parent.classList.contains('friend')) {
            selectedUsername = parent.getAttribute('id');
            break;
        }
    }
    if(selectedUsername == null) { return; }
    location.assign(`/video-call/${selectedUsername}`);
    // 2. make an API call to start the video call
    // const joinVideoCallPayload = { username_receiver: selectedUsername };
    // const res = await makeAPICall(endpoints.joinVideoCall.url, endpoints.joinVideoCall.method, joinVideoCallPayload);
    // if(res.status && res.status === 'success') {
    //     showToast(res.status, 'Joining Video Call', 2);
    //     setTimeout(() => {
    //         location.assign('/video-call');
    //     }, 2 * 1000);
    // } else {
    //     showToast(res.status || 'error');
    // }
});