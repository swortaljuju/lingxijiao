# Server descriptiion

## How to enable email service
Follow nodejs quick start guide: https://developers.google.com/gmail/api/quickstart/nodejs

And get `credentials.json`, the first time, will be prompted to provide authorization on server console.

Need to safeguard this API carefully.

## Tables

### users
- id
- nickname (won't be displayed)
- avatar
- contact_info # to be revealed
- email # used for contact by the team

```
CREATE TABLE users (
     id INT NOT NULL AUTO_INCREMENT,
     nickname VARCHAR(30) DEFAULT '', -- Should not be displayed
     avatar SMALLINT DEFAULT 0,
     contact_info TEXT DEFAULT '',
     email VARCHAR(200) NOT NULL,
     PRIMARY KEY (id)
);

INSERT INTO users (nickname, avatar, contact_info, email) values ("root", 0, "QQ: 123", "root@root.com");
INSERT INTO users (nickname, avatar, contact_info, email) values ("admin", 1, "QQ: 321", "admin@root.com");
```

### posts
- id
- user_id
- text
- timestamp
- pinned
- removed
- remove_timestamp

```
CREATE TABLE posts (
	id INT NOT NULL AUTO_INCREMENT,
	user_id INT NOT NULL,
	text TEXT,
	timestamp TIMESTAMP NOT NULL,
	pinned BOOLEAN DEFAULT FALSE,
	removed BOOLEAN DEFAULT FALSE,
	remove_timestamp TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id)
);

INSERT INTO posts (user_id, text, timestamp) values (1, "天若有情天亦老", NOW());
```

### comments
- id
- user_id
- text
- timestamp
- post_id
- removed
- remove_timestamp

```
CREATE TABLE comments (
	id INT NOT NULL AUTO_INCREMENT,
	user_id INT NOT NULL,
	text TEXT,
	timestamp TIMESTAMP NOT NULL,
	post_id INT NOT NULL,
	removed BOOLEAN DEFAULT FALSE,
	remove_timestamp TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id)
);

INSERT INTO comments (user_id, text, timestamp, post_id) values (2, "月如无恨月长圆", NOW(), 1);
```

### comment_likes
- id
- comment_id
- user_id
- timestamp
- unstared
- unstar_timestamp

```
CREATE TABLE comment_likes (
	id INT NOT NULL AUTO_INCREMENT,
	user_id INT NOT NULL,
	timestamp TIMESTAMP NOT NULL,
	comment_id INT NOT NULL,
	unstared BOOLEAN DEFAULT FALSE,
	unstar_timestamp TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id)
);

INSERT INTO comment_likes (user_id, timestamp, comment_id) values (1, NOW(), 1);
```


### post_favs
- id
- post_id
- user_id
- timestamp
- unfaved
- unfav_timestamp

```
CREATE TABLE post_favs (
	id INT NOT NULL AUTO_INCREMENT,
	user_id INT NOT NULL,
	timestamp TIMESTAMP NOT NULL,
	post_id INT NOT NULL,
	unfaved BOOLEAN DEFAULT FALSE,
	unfav_timestamp TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id)
);

INSERT INTO post_favs (user_id, timestamp, post_id) values (2, NOW(), 1);
```