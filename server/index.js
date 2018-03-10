const express = require('express');
const bodyParser = require('body-parser');
const url = require('url');
const bcrypt = require('bcrypt-nodejs');
const db = require('../database-pg/index');
const passport = require('passport');
const session = require('express-session');

const app = express();
require('../server/config/passport')(passport);
app.use(session({
  secret: process.env.SESSION_PASSWORD || 'supersecretsecret',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../app'));
app.use(express.static(__dirname + '/../node_modules'));

app.use(bodyParser.json());

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).end('You must log in to do that!');
}

app.get('/posts', async (req, res) => {
  let posts = await db.getAllPosts();
  let postVotes = await db.getPostVotes();
  let featuredPost = await db.getFeaturedPost();
  if (featuredPost.length > 1) {
    featuredPost = await [featuredPost[Math.floor(Math.random() * featuredPost.length)]]
  }
  res.json({posts: posts, postVotes: postVotes, featuredPost: featuredPost});
});

// app.get('/test', (req, res) => {
  // wrap this in a promise/async/await
  // let postsWithComments = async () => {
    // res.json(await db.getPostsWithCommentsAsync());

  // };

  // postsWithComments();

  // res.json(db.getPostsWithCommentsAsync());  //doesn't work
// });

app.get('/users', async(req, res) => {
  let users = await db.getUsers();
  res.json(users);
})

app.get('/comments', async (req, res) => {
  let postId = req.query.postId;
  let comments = await db.getComments(postId);
  for (let comment of comments) {
    let voters = {};
    let results = await db.getVoters(comment.comment_id);
    results.forEach(result => {
      voters[result.user_id] = result.votes;
    })
    comment.voters = voters;
  }
  res.json(comments);
});

app.delete('/comment*', isLoggedIn, async (req, res) => {
  let query = url.parse(req.url).query.split('?');
  await db.deleteComment(+query[0]);
  res.status(204).end();
});

app.post('/createPost', isLoggedIn, async (req, res) => {
  try {
    await db.createPost(req.body);
    res.status(200).end();
  } catch (err) {
    console.log(err);
  }
});

app.post('/upvotePost', isLoggedIn, async (req, res) => {
  try {
    let upvote = await db.upvotePost(req.body);
    upvote ? res.status(201).end() : null;
  } catch (err) {
    console.log(err);
  }
})

app.delete('/downvotePost*', isLoggedIn, async (req, res) => {
  let query = url.parse(req.url).query.split('/');
  try {
    let downvote = await db.downvotePost(query[0], query[1], query[2]);
    downvote ? res.status(204).end() : null;
  } catch (err) {
    console.log(err);
  }
})

app.post('/createComment', isLoggedIn, async (req, res) => {
  let comment = req.body;
  try {
    await db.createComment(comment);
  } catch (err) {
    console.log(err);
  }
  res.end();
});

app.post('/login', passport.authenticate('local-login'), (req, res) => {
  res.status(200).json({
    user_id: req.user.user_id,
    username: req.user.username,
    hackcoin: req.user.hackcoin,
    session_id: req.sessionID
  });
});

app.post('/register', passport.authenticate('local-signup'), (req, res) => {
  if (req.user === 'already exists') {
    res.status(409).end();
  } else {
    res.status(200).json({
      user_id: req.user[0].user_id,
      username: req.user[0].username,
      hackcoin: req.user[0].hackcoin,
      session_id: req.sessionID
    })
  }
});

app.post('/logout', isLoggedIn, (req, res) => {
  req.logout();
  res.clearCookie('connect.sid').status(200);
});

const getCurrentHackCoins = async userId => {
  let currentHackCoins = await db.checkCoin(userId);
  return currentHackCoins = currentHackCoins.pop().hackcoin;
}

const getCurrentCoinsByUsername = async username => {
  let currentHackCoins = await db.checkCoinByUsername(username);
  return currentHackCoins = currentHackCoins.pop().hackcoin;
}

app.post('/coin', isLoggedIn, async (req, res) => {
  let currentHackCoins = await getCurrentHackCoins(req.body.userId);
  if (currentHackCoins > 0 && req.body.hackCoins <= currentHackCoins) { //user has usable coins and asking to use a number of some available -- good update db
    await db.subtractCoins(currentHackCoins, req.body.hackCoins, req.body.userId, req.body.commentId, 'flag');
    await db.addCoin(req.body.postUserId, req.body.commentId, null, req.body.hackCoins);
    res.status(200).end();
  } else if(currentHackCoins > 0 && req.body.hackCoins > currentHackCoins) { //if usable coins but asking to use more than available
    console.log('tried to use too many hack coins');
    res.status(409).end();  //send something in the body for client
  } else if(currentHackCoins <= 0) {  //if no usable coins
    res.status(409).end();  //send something in the body for client
  } else {
    console.log('unexpected edge case', 'currentHackCoins', currentHackCoins,  req.body);
  }
});

app.delete('/coin*', isLoggedIn, async (req, res) => { // this feels a little backwards, but they had it set up where a post takes away your coin which means a delete gives one back
  let query = url.parse(req.url).query.split('?');
  let currentHackCoins = await getCurrentHackCoins(+query[0]);
  await db.addCoin(+query[0], +query[1], 'flag', +query[3]); // give back coin to logged in user
  await db.subtractCoins(currentHackCoins, +query[3], +query[2], +query[1]); // revoke coin from poster
  res.status(204).end();
});

app.post('/gift', isLoggedIn, async (req, res) => {
  let currentHackcoins = await getCurrentCoinsByUsername(req.body.params.username);
  db.giftCoin(req.body.params.username, req.body.params.amount)
  res.status(201).end();
})

app.delete('/gift', isLoggedIn, async (req, res) => {
  let query = url.parse(req.url).query.split('?');
  db.deleteGiftedCoin(query[0], query[1])
  res.status(204).end();
})

app.delete('/slot', isLoggedIn, async (req, res) => {
  let query = url.parse(req.url).query.split('?');
  let currentHackCoins = await getCurrentHackCoins(query[0]);
  db.spendSlotCoin(query[0]);
  res.status(204).end();
})

app.post('/slot', isLoggedIn, async (req,res) => {
  await db.awardSlotCoins(req.body.params.userId);
  res.status(201).end();
})

app.post('/solution', isLoggedIn, async (req, res) => {
  const data = await db.markSolution(req.body.commentId, req.body.postId);
  res.status(200).end();
});

app.post('/solution/remove', async (req, res) => {
  const data = await db.unmarkSolution(req.body.commentId, req.body.postId);
  res.status(200).end();
});

app.get('*', (req, res) => res.redirect('/'));

app.listen(process.env.PORT || 3000, function () {
  console.log('listening on port 3000!');
});
