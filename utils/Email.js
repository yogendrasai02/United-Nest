const nodemailer = require('nodemailer');
module.exports = class Email {

    constructor() {
        const environment = process.env.NODE_ENV.toUpperCase();
        this.transporter = nodemailer.createTransport({
            host: process.env[`EMAIL_HOST_${environment}`],
            port: process.env[`EMAIL_PORT_${environment}`],
            secure: false,
            auth: {
                user: process.env[`EMAIL_USERNAME_${environment}`],
                pass: process.env[`EMAIL_PASSWORD_${environment}`]
            }
        });
    }

    async sendEmail(to, subject, text) {
        console.log('Sending Email...');
        await this.transporter.sendMail({
            from: '"NOREPLY🚫" <noreply@united-nest.io>',
            to, subject, text
        });
        console.log('Email Sent!');
    }

};