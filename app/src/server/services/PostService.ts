import express from 'express';
import {CreateQuery} from 'mongoose';
// eslint-disable-next-line no-unused-vars
import {Post as DbPost} from '../schema/post';
// eslint-disable-next-line no-unused-vars
import {User} from '../schema/user';
import {UserModel, PostModel} from '../schema/models';
import {Gender as ClientGender} from '../../proto/common.js';
import {Post as ClientPost, IPost as ClientIPost} from '../../proto/post.js';
import {Response as ClientPostResponse, IResponse as ClientIResponse} from '../../proto/response.js';
import {PostQuery} from '../../proto/query.js';
import {ErrorCode} from '../../common/error_codes';
import {fromClientGenderToDbGender, fromDbPostToClientPost} from '../converters';

// This is lib is deprecated but it contains a released d.ts
// while the new lib i18next-http-middleware's d.ts was recently added and not released yet.
import * as i18nMiddleware from 'i18next-express-middleware';

import {DocumentType} from '@typegoose/typegoose';
import validator from 'validator';
import {ObjectId} from 'mongodb';
import 'winston-daily-rotate-file';
import {wrapPromiseRoute, getBirthYearFromAge} from '../utils';
import {getEnvironment} from '../environment';

export const postRouter = express.Router();

postRouter.post('/load', wrapPromiseRoute(async function(req, res, next) {
    const queryData = req.body as PostQuery;
    const dbQuery = PostModel.find({
        gender: fromClientGenderToDbGender(queryData.gender),
        createdAt: {$lt: new Date(queryData.startTimestamp as number)},
    });

    if (queryData.searchKeyword) {
        dbQuery.and([{$text: {
            $search: queryData.searchKeyword, 
            // Use none to support chinese text search.
            $language: 'none'}}]);
    }

    const result = await dbQuery.limit(queryData.postNumber)
        .sort({createdAt: 'desc'}).exec();
    res.status(200).send(result.map(
        (dbPost) => JSON.stringify(ClientPost.toObject(new ClientPost(fromDbPostToClientPost(dbPost))))));
    next();
}));


postRouter.post('/create', wrapPromiseRoute(async function(req, res, next) {
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

function createResponseEmailContent(post: ClientIPost, clientPostResponse: ClientIResponse, req: i18nMiddleware.I18NextRequest): string {
    let html = `<div> ${req.t('responseEmail.notice', {email: clientPostResponse.email, gender: formatGender(clientPostResponse.gender, req), age: clientPostResponse.age})}</div><br/>` +
    `<b> ${req.t('responseEmail.warning')}</b><br/><br/>`;

    if (clientPostResponse.questionAndAnswers) {
        for (const qa of clientPostResponse.questionAndAnswers) {
            html += `<i> ${qa.question}</i><br/>` +`<b> ${qa.answer}</b><br/><br/>`;
        }
    }

    html += `<b> ${req.t('originalPost')}</b><br/>`;
    for (const narration of post.narrations!) {
        html += `<div> ${narration.label}</div>` +`<div> ${narration.content}</div>`;
    }
    return html;
}

postRouter.post('/reply', wrapPromiseRoute(async function(req, res, next) {
    const clientPostResponse = req.body as ClientIResponse;
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

    await getEnvironment().transporter.sendMail({
        from: process.env.APP_EMAIL_ADDRESS,
        to: (postData.poster as User).email,
        subject: (req as i18nMiddleware.I18NextRequest).t('responseEmail.title'),
        html: createResponseEmailContent(fromDbPostToClientPost(postData), clientPostResponse, req as i18nMiddleware.I18NextRequest),
    });

    postData.responses.push({
        responder: responderData._id,
        answers: clientPostResponse.questionAndAnswers!.map((qa) => qa.answer),
    });
    await postData.save();

    // add the new post to user's posts list.
    await UserModel.updateOne({
        _id: responderData._id,
    }, {$addToSet: {respondedPosts: new ObjectId(postData._id)}});
    res.sendStatus(200);
    next();
}));

