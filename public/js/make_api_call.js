export const makeAPICall = async function(endpoint, method, data, multipartForm = false) {
    const fetchOptions = { method };
    if(method === 'POST' || method === 'PATCH') {
        fetchOptions.body = data;
        if(!multipartForm) {
            fetchOptions.body = JSON.stringify(fetchOptions.body);
            fetchOptions.headers = {
                'Content-Type': 'application/json'
            };
        }
    }
    console.log(`About to make API call to ${method}: ${endpoint}`);
    try {
        const res = await fetch(endpoint, fetchOptions);
        const responseData = await res.json();
        console.log('Received Response from API');
        console.log(responseData);
        return responseData;
    } catch (err) {
        console.log('Error while making API Call');
        console.log(err);
        return err;
    }
};


export const makeAPICallFile = async function(endpoint, method, data) {
    const fetchOptions = { method };
    if(method === 'POST' || method === 'PATCH') {
        fetchOptions.body = data;
    }
    console.log(`About to make API call to ${method}: ${endpoint}`);
    try {
        const res = await fetch(endpoint, fetchOptions);
        const responseData = await res.json();
        console.log('Received Response from API');
        console.log(responseData);
        return responseData;
    } catch (err) {
        console.log('Error while making API Call');
        console.log(err);
        return err;
    }
};