import nodemailer from 'nodemailer';
import {setupEnv} from './setup';
import aws from 'aws-sdk';

setupEnv(process.argv[2]);

let transporter;
if (process.env.HOST_SERVER_TYPE == 'AWS') {
    transporter = nodemailer.createTransport({
        SES: new aws.SES({
            apiVersion: '2010-12-01',
            credentials: new aws.Credentials({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            }),
            region: process.env.AWS_REGION,
        }),
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
    to: 'yinyuanqiangapptest@gmail.com',
    subject: 'test nodemailer + ses',
    text: 'test nodemailer + ses body',
}, function (err, info) {
    console.log('nodemailer sent email. err: ');
    console.log(err);
    console.log('info');
    console.log(info);
    process.exit();
});
