const btn = document.getElementsByClassName('btn')[0];
const input = document.getElementById('floatingInput');
const searchBy = document.getElementById('searchBy');
import { makeAPICall } from './make_api_call.js';

btn.addEventListener('click', () => {
    const searchValue = input.value;
    const searchByType = searchBy.value;

    console.log(searchValue, searchByType);

    // if(searchByType === 'user') {
        // fetch(`/search/?type=${searchByType}&searchQuery=${searchValue}`);
        // .then((data)=>{console.log(data)});

    var queryParams = new URLSearchParams(window.location.search);
    // Set new or modify existing parameter value. 
    queryParams.set("type", searchByType);
    queryParams.set("searchQuery", searchValue);
    
    // Replace current querystring with the new one
    history.replaceState(null, null, "?" + queryParams.toString());

    window.location.href = window.location.href;
    // } else {

    // }
})