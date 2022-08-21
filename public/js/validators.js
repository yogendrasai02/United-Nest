export const isEmail = (email) => {
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    return regex.test(email);
};

export const isMobileNumber = (mobile) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(mobile);
};