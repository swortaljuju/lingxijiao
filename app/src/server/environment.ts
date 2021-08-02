import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as path from 'path';
import nodemailer from 'nodemailer';
import aws from 'aws-sdk';

// This is lib is deprecated but it contains a released d.ts
// while the new lib i18next-http-middleware's d.ts was recently added and not released yet.
import * as i18nMiddleware from 'i18next-express-middleware';

import i18next from 'i18next';
import {resources} from './i18n/config';
import winston from 'winston';
import 'winston-daily-rotate-file';
import * as nodejieba from 'nodejieba';


interface Environment {
    app: express.Application;
    logger: winston.Logger;
    db: mongoose.Connection;
    transporter: nodemailer.Transporter;
}


let environment: Environment;

export function initializeEnvironment(uiDistPath: string): Environment {
    if (environment) {
        return environment;
    }
    dotenv.config({
        path: path.resolve(__dirname, '.env'),
    });

    nodejieba.load({
        dict: path.resolve(__dirname, 'jieba.dict.utf8'),
        idfDict: path.resolve(__dirname, 'idf.utf8'),
    });

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

    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
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

    mongoose.set('debug', process.env.NODE_ENV != 'production');

    const MONGODB_URL = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DB_NAME}`;
    mongoose.connect(MONGODB_URL, {
        user: process.env.MONGODB_USERNAME,
        pass: process.env.MONGODB_PASSWORD,
        poolSize: Number(process.env.MONGODB_CONNECTION_POOL_SIZE),
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = mongoose.connection;

    db.on('error', function(err) {
        logger.error('db connection failed:' + err);
    });
    db.once('open', function() {
        logger.info('db connected!');
    });

    const transporter =(function() {
        if (process.env.HOST_SERVER_TYPE == 'AWS') {
            return nodemailer.createTransport({
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
    app.use(express.static(path.join(__dirname, '../', uiDistPath)));

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
    environment = {
        app,
        logger,
        db,
        transporter,
    };
    return environment;
}

export function getEnvironment(): Environment {
    if (!environment) {
        throw new Error('no environment initialized');
    }
    return environment;
}
