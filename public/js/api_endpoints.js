const baseURL = 'http://localhost:4000';
export const endpoints = {
    login: {
        url: baseURL + '/api/v1/auth/login',
        method: 'POST'
    },
    signup: {
        url: baseURL + '/api/v1/auth/signup',
        method: 'POST'
    },
    forgotPassword: {
        url: baseURL + '/api/v1/auth/forgotPassword',
        method: 'POST'
    },
    resetPassword: {
        url: baseURL + '/api/v1/auth/resetPassword',
        method: 'POST'
    },
    myProfile: {
        url : baseURL + '/api/v1/users/myProfile',
        method: 'GET'
    },
    profile: {
        url : baseURL + '/api/v1/users/profile',
        method: 'GET'
    },
    updateProfile: {
        url: baseURL + '/api/v1/users/updateProfile',
        method: 'PATCH'
    },
    joinVideoCall: {
        url: baseURL + '/api/v1/video-call/join',
        method: 'POST'
    },
    actOnRequest: {
        url: baseURL + '/api/v1/connections/followRequests',
        method: 'PATCH'
    },
};