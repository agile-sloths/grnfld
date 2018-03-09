DROP DATABASE IF EXISTS hackXchange;

CREATE DATABASE hackXchange;

USE hackXchange;


DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS userscomments;

CREATE TABLE users (
 user_id serial PRIMARY KEY,
  username VARCHAR(25) NOT NULL,
  password VARCHAR(60) NOT NULL,
  hackcoin INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

-- ---
-- Table 'post'
--
-- ---

CREATE TABLE posts (
  post_id serial PRIMARY KEY,
  user_id INTEGER REFERENCES users (user_id) NOT NULL,
  title VARCHAR(50) NOT NULL,
  code VARCHAR(8000) DEFAULT NULL,
  summary VARCHAR(8000) DEFAULT NULL,
  anon boolean DEFAULT FALSE,
  closed boolean DEFAULT FALSE,
  solution_id INTEGER DEFAULT NULL, --references comment_id from comment table
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);


-- ---
-- Table 'comment'
--
-- ---

CREATE TABLE comments (
  comment_id serial PRIMARY KEY,
  user_id INTEGER REFERENCES users (user_id) NOT NULL,
  post_id INTEGER REFERENCES posts (post_id) NOT NULL,
  message VARCHAR(8000),
  votes INTEGER DEFAULT 0,
  solution boolean DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

-- ---
-- Table 'usercomment'
--
-- ---

CREATE TABLE userscomments
( id serial PRIMARY KEY,
  user_id INTEGER REFERENCES users (user_id) NOT NULL,
  comment_id INTEGER REFERENCES users (comment_id) NOT NULL,
  votes INTEGER DEFAULT 0
);

-- ---
-- Test Data
--
-- ---

insert into users
  (username, password)
VALUES
  ('yaboi', '$2a$10$MCRlmB8bUswMTqKG.kURCu2pu8ipopli2LLaO5OODNokt44cpLZ56'),
  ('Gepeto', '$2a$10$pKgnmkFU5W7D70ekyEurruql72IonF7c5MiPlfnHrc9ywjrAF89Ou'),
  ('Zanbato', '$2a$10$pKgnmkFU5W7D70ekyEurruql72IonF7c5MiPlfnHrc9ywjrAF89Ou'),
  ('Colonel', '$2a$10$pKgnmkFU5W7D70ekyEurruql72IonF7c5MiPlfnHrc9ywjrAF89Ou'),
  ('Hipster', '$2a$10$pKgnmkFU5W7D70ekyEurruql72IonF7c5MiPlfnHrc9ywjrAF89Ou');

insert into posts
  (user_id, title, code, summary, solution_id)
VALUES
  (1, 'Get to the Choppa', 'aslkdjfleaf', 'Get to the choppa or die', 'JavaScript', 123456),
  (2, 'He is a real boy', 'hello world', 'Turn puppet into real boy', 'HTML', null),
  (3, 'A really big sword', 'chop chop its all in the mind', 'the ultimate onion chopper', 'Python', null),
  (4, 'How do you pronounce my name?', 'some military guy', 'Did not know how to say this till I was 25', 'JavaScript', null),
  (5, 'I hate everything', 'Your music sucks', 'Going to drink some IPAs', 'JavaScript', 234567);

insert into comments
  (user_id, post_id, message, votes)
VALUES
  (1, 1, 'Guns Blazing', 5),
  (2, 1, 'Think of the children!', 2),
  (3, 1, 'sword = shield', 525),
  (4, 1, 'Pulls out rocket launcher', 15),
  (5, 1, 'I used those before they were cool', 0);
