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
    joinVideoCall: {
        url: baseURL + '/api/v1/video-call/join',
        method: 'POST'
    },
    addPostText: {
        url: baseURL + '/api/v1/posts/text',
        method: 'POST'
    },
    addPostImages: {
        url: baseURL + '/api/v1/posts/images',
        method: 'POST'
    },
    addPostVideo: {
        url: baseURL + '/api/v1/posts/video',
        method: 'POST'
    }
};