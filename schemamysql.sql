cDROP DATABASE IF EXISTS grnfld;

CREATE DATABASE grnfld;

USE grnfld;


DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

CREATE TABLE users
(
  user_id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(25) NOT NULL,
  password varchar(60) NOT NULL,
  hackcoin int NOT NULL DEFAULT 100,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id)
);

-- ---
-- Table 'post'
--
-- ---

CREATE TABLE posts
(
  post_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(50) NOT NULL,
  code VARCHAR(8000) DEFAULT NULL,
  summary VARCHAR(8000) DEFAULT NULL,
  anon BOOLEAN DEFAULT FALSE,
  closed BOOLEAN DEFAULT FALSE,
  solution_id INT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id),
  FOREIGN KEY (user_id) REFERENCES users (user_id)
  -- FOREIGN KEY (solution_id) REFERENCES comments (comment_id) THIS NEEDS TO BE ADDED IN AFTERWARDS
);

-- ---
-- Table 'comment'
--
-- ---

CREATE TABLE comments
(
  comment_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  message VARCHAR(8000),
  votes INTEGER DEFAULT 0,
  solution boolean DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (comment_id),
  FOREIGN KEY (user_id) REFERENCES users (user_id),
  FOREIGN KEY (post_id) REFERENCES posts (post_id)
);

-- ---
-- Table 'usercomment'
--
-- ---

CREATE TABLE userscomments
( id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  comment_id INT NOT NULL,
  votes INTEGER DEFAULT 0,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users (user_id),
  FOREIGN KEY (comment_id) REFERENCES comments (comment_id)
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
  (1, 'Get to the Choppa', 'aslkdjfleaf', 'Get to the choppa or die', 123456),
  (2, 'He is a real boy', 'hello world', 'Turn puppet into real boy', null),
  (3, 'A really big sword', 'chop chop its all in the mind', 'the ultimate onion chopper', null),
  (4, 'How do you pronounce my name?', 'some military guy', 'Did not know how to say this till I was 25', null),
  (5, 'I hate everything', 'Your music sucks', 'Going to drink some IPAs', 234567);

insert into comments
  (user_id, post_id, message, votes)
VALUES
  (1, 1, 'Guns Blazing', 5),
  (2, 1, 'Think of the children!', 2),
  (3, 1, 'sword = shield', 525),
  (4, 1, 'Pulls out rocket launcher', 15),
  (5, 1, 'I used those before they were cool', 0);
