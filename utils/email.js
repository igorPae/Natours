const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Igor <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                host: 'in.mailsac.com',
                secure: false, // use SSL
                port: 25,
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                },
                tls: { rejectUnauthorized: false }
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        })
    }

    async send(template, subject) {

        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html),
            // html: 
        };


        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
       await this.send('Welcome', 'Welcome to Natours')
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (Valid for 10 minutes)');
    }
};

const sendEmail = async options => {
    // 1) Create transporter

    //     const transporter = nodemailer.createTransport({
    //         service: 'Gmail',
    //         auth: {
    //             user: process.env.EMAIL_USERNAME,
    //             password: process.env.EMAIL_PASSWORD
    //         }
    //         // Activate in gmail 'less secure app' option
    //     })
    // }



    // 2) Define the email options


    // 3) Send email

    await transporter.sendMail(mailOptions);
};