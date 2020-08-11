// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START gae_node_request_example]
const cors = require('cors');
const express = require('express');

const poolPromise = require('./database');

// Create a Winston logger that streams to Stackdriver Logging.
const winston = require('winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console(), loggingWinston],
});

const app = express();

app.use(cors());
app.options('*', cors());

app.get('/', (req, res) => {
  res.status(200).send('Hello, world!').end();
});

// parse application/json
app.use(express.bodyParser());

let pool;
app.use(async (req, res, next) => {
  if (pool) {
    return next();
  }
  try {
    pool = await poolPromise;
    next();
  }
  catch (err) {
    logger.error(err);
    return next(err);
  }
});


app.route('/tests/:city')
  .get(async (req, res) => {
    const stmt = 'SELECT * FROM `tests` WHERE city = ? LIMIT 3';

    let cityQuery;
    if (req.params.city == 'all'){
      cityQuery = pool.query('SELECT * FROM `tests`');
    } else {
      cityQuery = pool.query(stmt, [req.params.city]);
    }

    const cities = await cityQuery;
    res.status(200).send(cities).end();
  });


  app.route('/get/posts')
    .get(async (req, res) => {
      // [START cloud_sql_mysql_mysql_connection]
      try {
          // No pagination for now because I'm lazy.
          const postStmt = 'SELECT * FROM posts';
          // Pool.query automatically checks out, uses, and releases a connection
          // back into the pool, ensuring it is always returned successfully.
          postsQuery = pool.query(postStmt);

          const commentStmt = 'SELECT * FROM comments';
          commentsQuery = pool.query(commentStmt);

          // Organize comments into field in each post.
          const posts = await postQuery;
          const comments = await commentsQuery;
          const updatedPosts = posts.map(function(post) {
            post["comments"] = comments.filter((comment) => {
              comment.post_id == post.id;
            })
            return post;
          });


          // [END cloud_sql_mysql_mysql_connection]
          res.status(200).json({data: updatedPosts}).end();

      } catch (err) {
          // If something goes wrong, handle the error in this section. This might
          // involve retrying or adjusting parameters depending on the situation.
          // [START_EXCLUDE]
          logger.error(err);
          return res
          .status(500)
          .json(
              {message: 'Unable to successfully add user!'}
          )
          .end();
          // [END_EXCLUDE]
      }
  });

app.route('/add/:city-:country')
  .get(async (req, res) => {
    const city = req.params.city;
    const country = req.params.country;
    // [START cloud_sql_mysql_mysql_connection]
    try {
        const stmt = 'INSERT INTO tests (city, country) VALUES (?, ?)';
        // Pool.query automatically checks out, uses, and releases a connection
        // back into the pool, ensuring it is always returned successfully.
        await pool.query(stmt, [city, country]);
    } catch (err) {
        // If something goes wrong, handle the error in this section. This might
        // involve retrying or adjusting parameters depending on the situation.
        // [START_EXCLUDE]
        logger.error(err);
        return res
        .status(500)
        .json(
            {message: 'Unable to successfully add city!'}
        )
        .end();
        // [END_EXCLUDE]
    }

    // [END cloud_sql_mysql_mysql_connection]
    res.status(200).json({message: `Successfully added for ${city} in ${country}`}).end();
  });


  app.route('/insert/user')
  .post(async (req, res) => {
    const params = req.body;
    // [START cloud_sql_mysql_mysql_connection]
    try {
        const stmt = 'INSERT INTO users (nickname, avatar, contact_info, email) values (?, ?, ?, ?)';
        // Pool.query automatically checks out, uses, and releases a connection
        // back into the pool, ensuring it is always returned successfully.
        await pool.query(stmt, [params.nickname, params.avatar, params.contact_info, params.email]);
    } catch (err) {
        // If something goes wrong, handle the error in this section. This might
        // involve retrying or adjusting parameters depending on the situation.
        // [START_EXCLUDE]
        logger.error(err);
        return res
        .status(500)
        .json(
            {message: 'Unable to successfully add user!'}
        )
        .end();
        // [END_EXCLUDE]
    }

    // [END cloud_sql_mysql_mysql_connection]
    res.status(200).json({message: `Successfully added user ${params.email}`}).end();

});



// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

process.on('unhandledRejection', err => {
  console.error(err);
  process.exit(1);
});

// [END gae_node_request_example]

module.exports = app;
