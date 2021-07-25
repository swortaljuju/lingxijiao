import {ErrorRequestHandler} from 'express';
import {Post as ClientPost} from '../proto/post.js';
import {Response as ClientPostResponse} from '../proto/response.js';
import {PostQuery} from '../proto/query.js';
import {Feedback} from '../proto/feedback.js';
import {ErrorCode} from '../common/error_codes';

import winston from 'winston';
import 'winston-daily-rotate-file';
import {initializeEnvironment} from './environment';
import {postRouter} from './services/PostService';
import {feedbackRouter} from './services/FeedbackService';


declare let UI_DIST_PATH: string;
declare module 'express-serve-static-core' {
    interface Request {
      profiler?: winston.Profiler
    }
  }

type ProtoTypes = typeof PostQuery | typeof ClientPost | typeof ClientPostResponse | typeof Feedback;

const environment = initializeEnvironment(UI_DIST_PATH);
const app = environment.app;
const logger = environment.logger;

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

app.use('/post', postRouter);
app.use('/feedback', feedbackRouter);

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
    logger.error(err && err.stack);
    next(err);
} as ErrorRequestHandler);
