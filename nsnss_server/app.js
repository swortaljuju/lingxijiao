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
const metadata = require('gcp-metadata');
const {OAuth2Client} = require('google-auth-library');
const bodyParser = require('body-parser');

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
const oAuth2Client = new OAuth2Client();

// Cache externally fetched information for future invocations
let aud;

async function audience() {
  if (!aud && (await metadata.isAvailable())) {
    let project_number = await metadata.project('numeric-project-id');
    let project_id = await metadata.project('project-id');

    aud = '/projects/' + project_number + '/apps/' + project_id;
  }

  return aud;
}

async function getUserIdByEmail(user_email) {
  try {
      const stmt = `
        SELECT id FROM users
        WHERE email = ?
        LIMIT 1
      `;
      // Pool.query automatically checks out, uses, and releases a connection
      // back into the pool, ensuring it is always returned successfully.
      const userQuery = pool.query(stmt, [user_email]);

      // Organize comments into field in each post.
      const user = await userQuery;
      // [END cloud_sql_mysql_mysql_connection]

      if (user.length == 0) {
        return null;
      } else {
        return user[0].id;
      }

  } catch (err) {
      // If something goes wrong, handle the error in this section. This might
      // involve retrying or adjusting parameters depending on the situation.
      // [START_EXCLUDE]
      logger.error(err);
      return null;
  }
}

app.use(cors());
app.options('*', cors());

// parse application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

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


async function validateAssertion(assertion) {
  if (!assertion) {
    return {};
  }

  // Check that the assertion's audience matches ours
  const aud = await audience();

  // Fetch the current certificates and verify the signature on the assertion
  const response = await oAuth2Client.getIapPublicKeys();
  const ticket = await oAuth2Client.verifySignedJwtWithCertsAsync(
    assertion,
    response.pubkeys,
    aud,
    ['https://cloud.google.com/iap']
  );
  const payload = ticket.getPayload();

  // Return the two relevant pieces of information
  return {
    email: payload.email,
    sub: payload.sub,
  };
}


app.get('/', async (req, res) => {
  const assertion = req.header('X-Goog-IAP-JWT-Assertion');
  let email = 'None';
  let sub = 'None';
  try {
    const info = await validateAssertion(assertion);
    email = info.email;
    sub = info.sub;
  } catch (error) {
    console.log(error);
  }
  res
    .status(200)
    .send(`Hello ${email} : ${sub}`)
    .end();
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
    res.status(200).json({data: cities}).end();
  });

app.route('/get/user/:user_id')
  .get(async (req, res) => {
    // [START cloud_sql_mysql_mysql_connection]
    try {
        const stmt = `
          SELECT * FROM users
          WHERE id = ?
          LIMIT 1
        `;
        // Pool.query automatically checks out, uses, and releases a connection
        // back into the pool, ensuring it is always returned successfully.
        const userQuery = pool.query(stmt, [req.params.user_id]);

        // Organize comments into field in each post.
        const user = await userQuery;
        // [END cloud_sql_mysql_mysql_connection]

        if (user.length == 0) {
          res
          .status(500)
          .json(
              {message: 'User not found!'}
          )
          .end();
        } else {
          res.status(200).json({data: user[0]}).end();

        }

    } catch (err) {
        // If something goes wrong, handle the error in this section. This might
        // involve retrying or adjusting parameters depending on the situation.
        // [START_EXCLUDE]
        logger.error(err);
        return res
        .status(500)
        .json(
            {message: 'Unable to successfully get user!'}
        )
        .end();
        // [END_EXCLUDE]
    }

  })


app.route('/get/user_by_email/:user_email')
  .get(async (req, res) => {
    // [START cloud_sql_mysql_mysql_connection]
    try {
        const stmt = `
          SELECT id FROM users
          WHERE email = ?
          LIMIT 1
        `;
        // Pool.query automatically checks out, uses, and releases a connection
        // back into the pool, ensuring it is always returned successfully.
        const userQuery = pool.query(stmt, [req.params.user_email]);

        // Organize comments into field in each post.
        const user = await userQuery;
        // [END cloud_sql_mysql_mysql_connection]

        if (user.length == 0) {
          res
          .status(500)
          .json(
              {message: 'User not found!'}
          )
          .end();
        } else {
          res.status(200).json({data: user[0]}).end();

        }

    } catch (err) {
        // If something goes wrong, handle the error in this section. This might
        // involve retrying or adjusting parameters depending on the situation.
        // [START_EXCLUDE]
        logger.error(err);
        return res
        .status(500)
        .json(
            {message: 'Unable to successfully get user!'}
        )
        .end();
        // [END_EXCLUDE]
    }

  })


app.route('/get/faved_posts/:user_id')
  .get(async (req, res) => {
    // [START cloud_sql_mysql_mysql_connection]
    try {
        // No pagination for now because I'm lazy.
        const postStmt = `
          SELECT 
            posts.id,
            posts.text,
            posts.timestamp,
            posts.pinned,
            users.avatar,
            users.nickname
          FROM posts
          INNER JOIN users ON posts.user_id = users.id
          INNER JOIN post_favs ON posts.id = post_favs.post_id
          WHERE posts.removed = FALSE AND post_favs.unfaved = FALSE AND post_favs.user_id = ?
        `;
        // Pool.query automatically checks out, uses, and releases a connection
        // back into the pool, ensuring it is always returned successfully.
        const postsQuery = pool.query(postStmt, [req.params.user_id]);

        const commentStmt = `
        SELECT 
          comments.id,
          comments.text,
          comments.timestamp,
          comments.post_id,
          users.avatar,
          users.nickname,
          COALESCE(star_count, 0) as star_count 
        FROM comments 
        INNER JOIN users ON comments.user_id = users.id
        INNER JOIN post_favs ON comments.post_id = post_favs.post_id
        LEFT JOIN (
          SELECT comment_id, COUNT(*) as star_count
          FROM comment_likes
          WHERE unstared = FALSE
          GROUP BY comment_id
        ) like_stat
        ON like_stat.comment_id = comments.id
        WHERE removed = FALSE AND post_favs.unfaved = FALSE AND post_favs.user_id = ?`;
        const commentsQuery = pool.query(commentStmt, [req.params.user_id]);

        // Organize comments into field in each post.
        const posts = await postsQuery;
        const comments = await commentsQuery;
        const updatedPosts = posts.map(function(post) {
          post["comments"] = comments.filter((comment) => {
            return comment.post_id == post.id;
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
            {message: 'Unable to successfully get posts!'}
        )
        .end();
        // [END_EXCLUDE]
    }

  })

app.route('/get/posts')
  .get(async (req, res) => {
    // [START cloud_sql_mysql_mysql_connection]
    try {
        // No pagination for now because I'm lazy.
        const postStmt = `
        SELECT 
          posts.id,
          posts.text,
          posts.timestamp,
          posts.pinned,
          users.avatar,
          users.nickname
        FROM posts
        INNER JOIN users ON posts.user_id = users.id
        WHERE posts.removed = FALSE`;
        // Pool.query automatically checks out, uses, and releases a connection
        // back into the pool, ensuring it is always returned successfully.
        const postsQuery = pool.query(postStmt);

        const commentStmt = `
          SELECT 
            comments.id,
            comments.text,
            comments.timestamp,
            comments.post_id,
            users.avatar,
            users.nickname,
            COALESCE(star_count, 0) as star_count 
          FROM comments 
          INNER JOIN users ON comments.user_id = users.id
          LEFT JOIN (
            SELECT comment_id, COUNT(*) as star_count
            FROM comment_likes
            WHERE unstared = FALSE
            GROUP BY comment_id
          ) like_stat
          ON like_stat.comment_id = comments.id
          WHERE removed = FALSE
        `;
        const commentsQuery = pool.query(commentStmt);

        // Organize comments into field in each post.
        const posts = await postsQuery;
        const comments = await commentsQuery;
        const updatedPosts = posts.map(function(post) {
          post["comments"] = comments.filter((comment) => {
            return comment.post_id == post.id;
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
            {message: 'Unable to successfully get posts!'}
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

    const user_id = await getUserIdByEmail(params.email);

    // [START cloud_sql_mysql_mysql_connection]
    try {

      if (user_id == null) {
        const stmt = 'INSERT INTO users (nickname, avatar, contact_info, email) values (?, ?, ?, ?)';
        // Pool.query automatically checks out, uses, and releases a connection
        // back into the pool, ensuring it is always returned successfully.
        await pool.query(stmt, [params.nickname, params.avatar, params.contact_info, params.email]);
      } else {
        const stmt = 'UPDATE `users` SET nickname = ?, avatar = ?, contact_info = ? WHERE id = ?';
        // Pool.query automatically checks out, uses, and releases a connection
        // back into the pool, ensuring it is always returned successfully.
        await pool.query(stmt, [params.nickname, params.avatar, params.contact_info, user_id]);        
      }
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


app.route('/insert/post')
  .post(async (req, res) => {
    const params = req.body;
    // [START cloud_sql_mysql_mysql_connection]
    try {
        const stmt = 'INSERT INTO posts (user_id, text, timestamp) values (?, ?, NOW())';
        // Pool.query automatically checks out, uses, and releases a connection
        // back into the pool, ensuring it is always returned successfully.
        await pool.query(stmt, [params.user_id, params.text]);
    } catch (err) {
        // If something goes wrong, handle the error in this section. This might
        // involve retrying or adjusting parameters depending on the situation.
        // [START_EXCLUDE]
        logger.error(err);
        return res
        .status(500)
        .json(
            {message: 'Unable to successfully add post!'}
        )
        .end();
        // [END_EXCLUDE]
    }

    // [END cloud_sql_mysql_mysql_connection]
    res.status(200).json({message: `Successfully added post ${params.text}`}).end();
});


app.route('/insert/comment')
  .post(async (req, res) => {
    const params = req.body;
    // [START cloud_sql_mysql_mysql_connection]
    try {
        const stmt = 'INSERT INTO comments (user_id, text, timestamp, post_id) values (?, ?, NOW(), ?)';
        // Pool.query automatically checks out, uses, and releases a connection
        // back into the pool, ensuring it is always returned successfully.
        await pool.query(stmt, [params.user_id, params.text, params.post_id]);
    } catch (err) {
        // If something goes wrong, handle the error in this section. This might
        // involve retrying or adjusting parameters depending on the situation.
        // [START_EXCLUDE]
        logger.error(err);
        return res
        .status(500)
        .json(
            {message: 'Unable to successfully add comment!'}
        )
        .end();
        // [END_EXCLUDE]
    }

    // [END cloud_sql_mysql_mysql_connection]
    res.status(200).json({message: `Successfully added comment ${params.text}`}).end();
});

app.route('/insert/fav')
  .post(async (req, res) => {
    const params = req.body;
    // [START cloud_sql_mysql_mysql_connection]
    try {
        const stmt = 'INSERT INTO post_favs (user_id, timestamp, post_id) values (?, NOW(), ?)';
        // Pool.query automatically checks out, uses, and releases a connection
        // back into the pool, ensuring it is always returned successfully.
        await pool.query(stmt, [params.user_id, params.post_id]);
    } catch (err) {
        // If something goes wrong, handle the error in this section. This might
        // involve retrying or adjusting parameters depending on the situation.
        // [START_EXCLUDE]
        logger.error(err);
        return res
        .status(500)
        .json(
            {message: 'Unable to successfully fav post!'}
        )
        .end();
        // [END_EXCLUDE]
    }

    // [END cloud_sql_mysql_mysql_connection]
    res.status(200).json({message: `Successfully faved post ${params.post_id}`}).end();
});

app.route('/insert/star')
  .post(async (req, res) => {
    const params = req.body;
    // [START cloud_sql_mysql_mysql_connection]
    try {
        const stmt = 'INSERT INTO comment_likes (user_id, timestamp, comment_id) values (?, NOW(), ?)';
        // Pool.query automatically checks out, uses, and releases a connection
        // back into the pool, ensuring it is always returned successfully.
        await pool.query(stmt, [params.user_id, params.comment_id]);
    } catch (err) {
        // If something goes wrong, handle the error in this section. This might
        // involve retrying or adjusting parameters depending on the situation.
        // [START_EXCLUDE]
        logger.error(err);
        return res
        .status(500)
        .json(
            {message: 'Unable to successfully stared comment!'}
        )
        .end();
        // [END_EXCLUDE]
    }

    // [END cloud_sql_mysql_mysql_connection]
    res.status(200).json({message: `Successfully stared comment ${params.comment_id}`}).end();
});

app.route('/delete/:item_type')
  .post(async (req, res) => {
    const params = req.body;
    // [START cloud_sql_mysql_mysql_connection]
    try {
        let stmt;
        let key;
        if (req.params.item_type == "post") {
          stmt = 'UPDATE `posts` SET removed = TRUE, remove_timestamp = NOW() WHERE id = ?';
          key = [params.id];
        } else if (req.params.item_type == "comment") {
          stmt = 'UPDATE `comments` SET removed = TRUE, remove_timestamp = NOW() WHERE id = ?';
          key = [params.id];
        } else if (req.params.item_type == "star") {
          stmt = 'UPDATE `comment_likes` SET unstared = TRUE, unstar_timestamp = NOW() WHERE user_id = ? and comment_id = ?';
          key = [params.user_id, params.comment_id];
        } else if (req.params.item_type == "fav") {
          stmt = 'UPDATE `post_favs` SET unfaved = TRUE, unfav_timestamp = NOW() WHERE user_id = ? and post_id = ?';
          key = [params.user_id, params.post_id];
        } else {
          throw new Error(`Do not support deletion of ${req.params.item_type}.`)
        }

        // Pool.query automatically checks out, uses, and releases a connection
        // back into the pool, ensuring it is always returned successfully.
        await pool.query(stmt, key);

    } catch (err) {
        // If something goes wrong, handle the error in this section. This might
        // involve retrying or adjusting parameters depending on the situation.
        // [START_EXCLUDE]
        logger.error(err);
        return res
        .status(500)
        .json(
            {message: `Unable to delete ${req.params.item_type}!`}
        )
        .end();
        // [END_EXCLUDE]
    }

    // [END cloud_sql_mysql_mysql_connection]
    res.status(200).json({message: `Successfully deleted ${req.params.item_type}!`}).end();
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
