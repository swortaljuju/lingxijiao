import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as path from 'path';


export function setupEnv(env: string) {
    dotenv.config({
        path: path.resolve(__dirname, '../server/', env == 'prod' ? '.env' : '.env.dev'),
    });
}

export function setupMongoose(): void {
    mongoose.set('debug', true);

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
        console.error('db connection error');
        console.error(JSON.stringify(err));
    });

    db.once('open', function() {
        console.log('db connected!');
    });
}

