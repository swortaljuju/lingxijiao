import express, {ErrorRequestHandler, RequestHandler} from 'express';
import mongoose, {CreateQuery} from 'mongoose';
import dotenv from 'dotenv';
import * as path from 'path';
// eslint-disable-next-line no-unused-vars
import {Post as DbPost} from './schema/post';
// eslint-disable-next-line no-unused-vars
import {User} from './schema/user';
import {UserModel, PostModel} from './schema/models';
import {Gender as ClientGender} from '../proto/common.js';
import {Post as ClientPost, IPost as ClientIPost} from '../proto/post.js';
import {Response as ClientPostResponse, IResponse as ClientIResponse} from '../proto/response.js';
import {PostQuery} from '../proto/query.js';
import {Feedback} from '../proto/feedback.js';
import {ErrorCode} from '../common/error_codes';
import {fromClientGenderToDbGender, fromDbPostToClientPost} from './converters';
import nodemailer from 'nodemailer';

// This is lib is deprecated but it contains a released d.ts
// while the new lib i18next-http-middleware's d.ts was recently added and not released yet.
import * as i18nMiddleware from 'i18next-express-middleware';

import i18next from 'i18next';
import {DocumentType} from '@typegoose/typegoose';
import validator from 'validator';
import {ObjectId} from 'mongodb';
import {resources} from './i18n/config';
import winston from 'winston';
import 'winston-daily-rotate-file';


declare let UI_DIST_PATH: string;
declare module 'express-serve-static-core' {
    interface Request {
      profiler?: winston.Profiler
    }
  }

type ProtoTypes = typeof PostQuery | typeof ClientPost | typeof ClientPostResponse | typeof Feedback;
function wrapPromiseRoute(fn: RequestHandler): RequestHandler {
    return async function(req, res, next) {
        try {
            // run controllers logic
            await fn(req, res, next);
        } catch (e) {
            // if an exception is raised, do not send any response
            // just continue performing the middleware chain
            next(e);
        }
    };
}

dotenv.config({
    path: path.resolve(__dirname, '.env'),
});
mongoose.set('debug', process.env.NODE_ENV != 'production');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: {service: 'user-service'},
    transports: [
        new (winston.transports.DailyRotateFile)({
            dirname: '/tmp',
            filename: 'lingxijiao-%DATE%.log',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
        }),
    ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

// Create a new express app instance
const app: express.Application = express();
app.use(express.json());
app.listen(process.env.NODEJS_PORT, () => {
    logger.info(`app listening at http://localhost:${process.env.NODEJS_PORT}`);
});

const MONGODB_URL = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DB_NAME}`;
mongoose.connect(MONGODB_URL, {
    user: process.env.MONGODB_USERNAME,
    pass: process.env.MONGODB_PASSWORD,
    poolSize: Number(process.env.MONGODB_CONNECTION_POOL_SIZE),
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    logger.info('db connected!');
});


const transporter =(function() {
    if (process.env.HOST_SERVER_ENV == 'AWS') {
        return nodemailer.createTransport({
            host: 'email-smtp.us-west-2.amazonaws.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.APP_EMAIL_ADDRESS,
                pass: process.env.APP_EMAIL_PASSWORD,
            }
        });
    } else {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.APP_EMAIL_ADDRESS,
                pass: process.env.APP_EMAIL_PASSWORD,
            },
        });
    }
})();

// Route to static client web files including index.html.
app.use(express.static(path.join(__dirname, '../', UI_DIST_PATH)));

i18next
    .use(i18nMiddleware.LanguageDetector)
    .init({
        fallbackLng: 'zh',
        supportedLngs: ['zh'],
        resources,
    });
app.use(
    i18nMiddleware.handle(i18next),
);

function getBirthYearFromAge(age: number): number {
    return new Date().getFullYear() - age;
}

// Middleware to start profiler.
app.use(function(req, res, next) {
    req.profiler = logger.startTimer();
    next();
});


// Middleware to parse request proto.
app.use(function(req, res, next) {
    let protoType: ProtoTypes;
    switch (req.path) {
    case '/post/load':
        protoType = PostQuery;
        break;
    case '/post/create':
        protoType = ClientPost;
        break;
    case '/post/reply':
        protoType = ClientPostResponse;
        break;
    case '/feedback':
        protoType = Feedback;
        break;
    default:
        next();
        return;
    }

    const error = protoType.verify(req.body);
    if (error) {
        console.error(`invalid request data. type = ${typeof protoType}; error = ${error}`);
        res.status(400).send([ErrorCode.ERROR_PARSING_REQUEST]);
        return;
    }
    next();
});

app.post('/post/load', wrapPromiseRoute(async function(req, res, next) {
    const queryData = req.body as PostQuery;
    const dbQuery = PostModel.find({
        gender: fromClientGenderToDbGender(queryData.gender),
        createdAt: {$lt: new Date(queryData.startTimestamp as number)},
    });

    if (queryData.searchKeyword) {
        dbQuery.and([{$text: {$search: queryData.searchKeyword}}]);
    }

    const result = await dbQuery.limit(queryData.postNumber)
        .sort({createdAt: 'desc'}).exec();
    res.status(200).send(result.map(
        (dbPost) => JSON.stringify(ClientPost.toObject(new ClientPost(fromDbPostToClientPost(dbPost))))));
    next();
}));


app.post('/post/create', wrapPromiseRoute(async function(req, res, next) {
    const clientPostData = req.body as ClientIPost;
    if (!validator.isEmail(clientPostData.email || '')) {
        res.status(400).send([ErrorCode.INVALID_EMAIL]);
        return;
    }
    const currentTime = new Date();
    const userDataArray = await UserModel.find({
        email: clientPostData.email!,
    }).populate({
        path: 'posts',
        // Fetch posts created in last x days.
        match: {createdAt: {$gte: currentTime.setDate(currentTime.getDate() - Number(process.env.PERIOD_DAYS_FOR_MAX_NUMBER_CHECK))}},
        select: '_id',
    }).exec();
    const birthYear = getBirthYearFromAge(clientPostData.age!);
    const dbGender = fromClientGenderToDbGender(clientPostData.gender);
    let userData: DocumentType<User>;
    if (userDataArray.length == 0) {
        // Create a user.
        userData = await UserModel.create({
            email: clientPostData.email!,
            gender: dbGender,
            posts: [],
            respondedPosts: [],
            birthYear,
        });
    } else if (userDataArray.length > 1) {
        console.error(`Multiple users exist with same email ${clientPostData.email}`);
        res.sendStatus(500);
        return;
    } else {
        userData = userDataArray[0];
        if (userData.posts && userData.posts.length >= Number(process.env.MAX_NUMBER_POST_PER_PERIOD)) {
            res.status(400).send([ErrorCode.EXCEED_POST_CREATION_LIMIT]);
            return;
        }
    }
    const newDbPost: CreateQuery<DbPost> = {
        poster: userData._id,
        narrations: clientPostData.narrations!,
        questions: clientPostData.questions!,
        responses: [],
        // Always use post's gender and age even when it doesn't match user's initial value
        // until we support user profile setting.
        gender: dbGender,
        birthYear,
    };
    const createdPost: DocumentType<DbPost> = await PostModel.create(newDbPost);
    // add the new post to user's posts list.
    await UserModel.updateOne({
        _id: userData._id,
    }, {$push: {posts: createdPost._id}});
    res.sendStatus(200);
    next();
}));

function formatGender(gender: ClientGender, req: i18nMiddleware.I18NextRequest): string {
    return (gender == ClientGender.MALE)? req.t('male') : req.t('female');
}

function createResponseEmailContent(clientPostResponse: ClientPostResponse, req: i18nMiddleware.I18NextRequest): string {
    let html = `<div> ${req.t('responseEmail.notice', {email: clientPostResponse.email, gender: formatGender(clientPostResponse.gender, req), age: clientPostResponse.age})}</div><br/>` +
    `<b> ${req.t('responseEmail.warning')}</b><br/><br/>`;

    for (const qa of clientPostResponse.questionAndAnswers) {
        html+= `<i> ${qa.question}</i><br/>` +`<b> ${qa.answer}</b><br/>`;
    }

    return html;
}

app.post('/post/reply', wrapPromiseRoute(async function(req, res, next) {
    const clientPostResponse = req.body as ClientPostResponse;
    if (!validator.isEmail(clientPostResponse.email)) {
        res.status(400).send([ErrorCode.INVALID_EMAIL]);
        return;
    }
    const postDataArray = await PostModel.find({
        _id: new ObjectId(clientPostResponse.postId),
    }).populate({
        path: 'poster',
        select: 'email -_id',
    }).exec();

    if (postDataArray.length != 1) {
        console.error(`no post find for response ${clientPostResponse.postId}`);
        res.sendStatus(500);
        return;
    }

    const postData = postDataArray[0];

    const responderDataArray = await UserModel.find({
        email: clientPostResponse.email,
    }).exec();
    let responderData: DocumentType<User>;
    const birthYear = getBirthYearFromAge(clientPostResponse.age);
    if (responderDataArray.length == 0) {
        // Create a user.
        responderData = await UserModel.create({
            email: clientPostResponse.email,
            gender: fromClientGenderToDbGender(clientPostResponse.gender),
            posts: [],
            respondedPosts: [],
            birthYear,
        });
    } else if (responderDataArray.length > 1) {
        console.error(`Multiple users exist with same email ${clientPostResponse.email}`);
        res.sendStatus(500);
        return;
    } else {
        responderData = responderDataArray[0];
        if (responderData.respondedPosts) {
            const respondedPostsIds = responderData.respondedPosts.map((postId) => (postId as ObjectId).toString());
            if (respondedPostsIds.includes(postData.id)) {
                res.status(400).send([ErrorCode.POST_RESPONDED]);
                return;
            }
            const xDaysAgo = new Date();
            xDaysAgo.setDate(xDaysAgo.getDate() - Number(process.env.PERIOD_DAYS_FOR_MAX_NUMBER_CHECK));
            const recentRespondedPost = responderData.respondedPosts.filter((postId) => {
                return (postId as ObjectId).getTimestamp() >= xDaysAgo;
            });
            if (recentRespondedPost.length >= Number(process.env.MAX_NUMBER_RESPONSE_PER_PERIOD)) {
                res.status(400).send([ErrorCode.EXCEED_RESPONSE_LIMIT]);
                return;
            }
        }
    }

    await transporter.sendMail({
        from: process.env.APP_EMAIL_ADDRESS,
        to: (postData.poster as User).email,
        subject: (req as i18nMiddleware.I18NextRequest).t('responseEmail.title'),
        html: createResponseEmailContent(clientPostResponse, req as i18nMiddleware.I18NextRequest),
    });

    postData.responses.push({
        responder: responderData._id,
        answers: clientPostResponse.questionAndAnswers.map((qa) => qa.answer),
    });
    await postData.save();

    // add the new post to user's posts list.
    await UserModel.updateOne({
        _id: responderData._id,
    }, {$addToSet: {respondedPosts: new ObjectId(postData._id)}});
    res.sendStatus(200);
    next();
}));

app.post('/feedback', wrapPromiseRoute(function(req, res, next) {
    const feedback = req.body as Feedback;
    // send mail with defined transport object
    transporter.sendMail({
        from: process.env.APP_EMAIL_ADDRESS,
        to: process.env.APP_EMAIL_ADDRESS,
        subject: 'FEEDBACK',
        text: feedback.feedback,
    }, (err) => {
        if (err) {
            logger.info(`Failed to send feedback: ${err.message}`);
        } else {
            logger.info(`Feedback sent`);
        }
    });
    res.sendStatus(200);
    next();
}));

// Middleware to stop profiler.
app.use(function(req, res, next) {
    if (req.profiler) {
        req.profiler.done({message: req.path});
    }
    next();
});

// Error logger
app.use(function(err, req, res, next) {
    logger.error(`err: ${err}; path: ${req.path}; request body: ${JSON.stringify(req.body)}`);
    next(err);
} as ErrorRequestHandler);
