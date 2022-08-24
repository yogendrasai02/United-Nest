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

    async sendEmail(to, subject, html, text) {
        console.log('Sending Email...');
        await this.transporter.sendMail({
            from: '"NOREPLY🚫" <noreply@united-nest.io>',
            to, subject, html, text
        });
        console.log('Email Sent!');
    }

    async sendResetPasswordEmail(to, subject, resetPasswordLink) {

        const html = `
            <p>Hello, there was a request to reset the password for your United Nest account.</p>
            <p>To reset your password, click the following link:</p>
            <a href='${resetPasswordLink}' class='btn'>Reset your password</a>
            <p>If the above link doesnt work, copy paste the following link in your browser:</p>
            <p>${resetPasswordLink}</p>
            <p>This link expires in 10 hours from the time the email was sent.</p>
            <p>Incase you did not initiate this request, you can safely ignore this email :)</p>
        `;

        const text = `Hello ${to}, use the following link to reset your password of your United Nest Account` + 
        `\nLINK: ${resetPasswordLink}\n` + 
        `This link expires in 10 hours from the time the email was sent.</p>` +
        `Incase you did not initiate this request, you can safely ignore this email :)`;

        await this.sendEmail(to, subject, html, text);

    }

    async sendAccountVerificationEmail(to, subject, verificationLink) {

        const html = `
            <p>Hello ${to}, welcome to United Nest!</p>
            <p>To verify your account, click the following link:</p>
            <a href='${verificationLink}' class='btn'>Verify my account</a>
            <p>If the above link doesnt work, copy paste the following link in your browser:</p>
            <p>${verificationLink}</p>
            <p>This link expires in 24 hours from the time the email was sent.</p>
            <p>Incase you did not initiate this request, you can safely ignore this email :)</p>
        `;

        const text = `Hello ${to}, use the following link to verify your United Nest Account` + 
        `\nLINK: ${verificationLink}\n` + 
        `This link expires in 24 hours from the time the email was sent.` + 
        `Incase you did not initiate this request, you can safely ignore this email :)`;

        await this.sendEmail(to, subject, html, text);

    }

};