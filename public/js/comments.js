import { makeAPICall } from './make_api_call.js';
const filterbtn = document.getElementsByClassName('filterbtn')[0];
const commentForm = document.getElementById('commentForm');
const s1 = document.getElementById('select1');
const s2 = document.getElementById('select2');
const postId = document.getElementById('postid');
const commentId = document.getElementById('commentid');
const username = document.getElementById('username');
const comment = document.getElementById('message');

const baseURL = 'http://localhost:4000';

filterbtn.addEventListener('click', () => {
    console.log(s1.value);
    console.log(s2.value);

    let filterBy = s1.value;
    let order = s2.value;

    if(order === 'desc') {
        filterBy = '-' + filterBy;
    }

    console.log(filterBy);

    let str = window.location.href;

    const arr = str.split('/');

    const postId = arr[arr.length - 2];

    let searchParams = new URLSearchParams(window.location.search);

    console.log(searchParams.get('commentId'));

    const commentId = searchParams.get('commentId');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');
    const filter = s1;

    window.location.href = baseURL + `/posts/${postId}/comments?commentId=${commentId}&limit=${limit}&page=${page}&filter=${filterBy}`;
});

commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = baseURL + `/posts/${postId.value}/comments?commentId=${commentId.value}`;
    // username, content, commentedAt
    const data = {username: username.value, content: comment.value, commentedAt: new Date()};

    console.log(url, data);
    makeAPICall(url, 'POST', data).then((data)=>{
        window.location.href = `/posts/${postId.value}/comments?commentId=${commentId.value}&limit=5&page=1&filter=-commentedAt`;
    });   
});