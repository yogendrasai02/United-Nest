import { Modal } from 'bootstrap';
import { showToast } from './toasts.js';
import { makeAPICall } from './make_api_call.js';
import { endpoints } from './api_endpoints.js';

window.onload = () => {
    const addPostForm = document.getElementById('addPostForm');
    const loadingSpinner = document.querySelector('.loadingSpinner');
    
    const handleFormSubmitEvent = async () => {
        const username = document.getElementById('username').textContent;
        const content = document.getElementById('content').value;
        const images = document.getElementById('images').files;
        const video = document.getElementById('video').files;
        let hashTags = document.getElementById('hashTags').value;

        const contentTypeObj = {
            text: (content && !images.length && !video.length),
            image: (images.length && !content && !video.length),
            video: (video.length && !content && !images.length),
            imageText: (images.length && content && !video.length),
            videoText: (video.length && content && !images.length)
        };

        let cnt = 0, contentType = null;
        for(let type in contentTypeObj) {
            cnt += (contentTypeObj[type] == true);
            if(contentTypeObj[type] == true)
                contentType = type;
        }

        if(cnt != 1) {
            const toastMsg = 'You can add a post with only <strong>one</strong> of the following data:    ' +
            '<ul>' +
                '<li> Text only </li>' +
                '<li> Images only </li>' +
                '<li> One Video only </li>' +
                '<li> Text & Images only </li>' +
                '<li> Text & One Video only </li>' +
            '</ul>';
            showToast('fail', toastMsg, 15);
            return;
        }

        const multipartForm = (contentType != 'text');
        const postedAt = new Date();
        let data = null, endpointObj = null;
        if(contentType === 'text') {
            endpointObj = endpoints.addPostText;
            data = {
                username,
                hashTags,
                content,
                contentType,
                postedAt
            };
        } else {
            data = new FormData();
            data.append('username', username);
            data.append('contentType', contentType);
            data.append('hashTags', hashTags);
            data.append('postedAt', postedAt);
            if(contentType.includes('Text'))
                data.append('content', content);
            if(contentType.includes('image')) {
                console.log(images);
                for(let i = 0; i < images.length; i++) {
                    console.log(images[i]);
                    data.append("images", images[i]);
                }
                endpointObj = endpoints.addPostImages;
            }
            if(contentType.includes('video')) {
                data.append('video', video[0]);
                endpointObj = endpoints.addPostVideo;
            }
        }

        // endpoint, method, data, multipartForm?
        const response = await makeAPICall(endpointObj.url, endpointObj.method, data, multipartForm);
        loadingSpinner.classList.add('d-none');
        if(response.status && response.status === 'success') {
            showToast('success', response.message + '. Redirecting to posts page now...', 1);
            setTimeout(() => { location.assign('/posts'); }, 1000);
        } else if(response.status && ['isNSFW', 'toxicText'].includes(response.status)) {
            const reasons = response.reasons;
            let reasonsEl = '<ul>';
            reasons.forEach(reason => {
                const li = `<li>${reason}</li>`;
                reasonsEl += li;
            });
            reasonsEl += '</ul>';
            const modal = document.createElement('div');
            modal.classList.add('modal', 'fade');
            modal.setAttribute('aria-hidden', true);
            modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title text-danger">${response.message}</h4>
                        <button type="button" class="btn-close border border-dark" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p class='fs-4'>It is because your Post Content is inappropriate!</p>
                        ${reasonsEl}
                    </div>
                </div>
            </div>
            `;
            const myModal = new Modal(modal);
            myModal.show();
        } else {
            showToast(response.status || 'error', response.status.message, 2);
            setTimeout(() => { location.assign('/add-post'); }, 1000);
        }

    };
    
    addPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loadingSpinner.classList.remove('d-none');
        await handleFormSubmitEvent();
    });
};