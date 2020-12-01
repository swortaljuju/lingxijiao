import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as path from 'path';
// eslint-disable-next-line no-unused-vars
import {PostModel} from './schema/post';
// eslint-disable-next-line no-unused-vars
import {UserModel} from './schema/user';
import {Post} from '../proto/post.js';
import {Response} from '../proto/response.js';

dotenv.config({
  path: path.resolve(__dirname, '.env'),
});

// Create a new express app instance
const app: express.Application = express();
const MONGODB_URL = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DB_NAME}`;
console.log(MONGODB_URL);
const db = mongoose.createConnection(MONGODB_URL, {
  user: process.env.MONGODB_USERNAME,
  pass: process.env.MONGODB_PASSWORD,
  poolSize: Number(process.env.MONGODB_CONNECTION_POOL_SIZE),
});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('we\'re connected!');
});
app.get('/', function(req, res) {
  res.send(`Hello World! in ${process.env.TEST_STR}`);
});
app.listen(3000, function() {
  console.log('App is listening on port 3000!');
});
