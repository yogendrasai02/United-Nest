const baseURL = 'http://localhost:4000';
export const endpoints = {
    login: {
        url: baseURL + '/api/v1/auth/login',
        method: 'POST'
    },
    signup: {
        url: baseURL + '/api/v1/auth/signup',
        method: 'POST'
    }
};