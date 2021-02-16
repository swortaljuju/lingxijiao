import nodemailer from 'nodemailer';
import {setupEnv} from './setup';

setupEnv(process.argv[2]);


let transporter;
if (process.env.HOST_SERVER_TYPE == 'AWS') {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.APP_EMAIL_USERNAME,
            pass: process.env.APP_EMAIL_PASSWORD,
        },
    });
} else {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.APP_EMAIL_ADDRESS,
            pass: process.env.APP_EMAIL_PASSWORD,
        },
    });
}

transporter.sendMail({
    from: process.env.APP_EMAIL_ADDRESS,
    to: 'yinyuanqiangapp@gmail.com',
    subject: 'test nodemailer + ses',
    text: 'test nodemailer + ses body',
}, function (err, info) {
    console.log('nodemailer sent email. err: ');
    console.log(err);
    console.log('info');
    console.log(info);
    process.exit();
});
