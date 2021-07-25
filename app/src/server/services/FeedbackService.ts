import express from 'express';
import 'winston-daily-rotate-file';
import {wrapPromiseRoute} from '../utils';
import {getEnvironment} from '../environment';
import {Feedback} from '../../proto/feedback.js';

export const feedbackRouter = express.Router();

feedbackRouter.post('/', wrapPromiseRoute(function(req, res, next) {
    const feedback = req.body as Feedback;
    // send mail with defined transport object
    getEnvironment().transporter.sendMail({
        from: process.env.APP_EMAIL_ADDRESS,
        to: process.env.APP_EMAIL_ADDRESS,
        subject: 'FEEDBACK',
        text: feedback.feedback,
    }, (err) => {
        if (err) {
            getEnvironment().logger.info(`Failed to send feedback: ${err.message}`);
        } else {
            getEnvironment().logger.info(`Feedback sent`);
        }
    });
    res.sendStatus(200);
    next();
}));
