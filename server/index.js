const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const db = require('../database-pg/index');

const app = express();
app.use(express.static(__dirname + '/../app'));
app.use(express.static(__dirname + '/../node_modules'));

app.use(bodyParser.json());

const timer =  24 * 60 * 1000; //hours minutes seconds  //15 * 1000
let refreshCoins = setInterval( () => {
  db.refreshCoins();
}, timer);


app.get('/posts', async (req, res) => {
  let posts = await db.getAllPosts();
  res.json(posts);
});

// app.get('/test', (req, res) => {
  // wrap this in a promise/async/await
  // let postsWithComments = async () => {
    // res.json(await db.getPostsWithCommentsAsync());

  // };

  // postsWithComments();

  // res.json(db.getPostsWithCommentsAsync());  //doesn't work
// });

app.get('/comments', async (req, res) => {
  let postId = req.query.postId;
  let comments = await db.getComments(postId);
  res.json(comments);
});

app.post('/createPost', async (req, res) => {
  try {
    await db.createPost(req.body);
  } catch (err) {
    console.log(err);
  }
  res.end();
});

app.post('/createComment', async (req, res) => {
  let comment = req.body;
  try {
    await db.createComment(comment);
  } catch (err) {
    console.log(err);
  }
  res.end();
});

app.post('/login', async (req, res) => {
  const userInfo = await db.checkCredentials(req.body.username);

  if (userInfo.length) {
    const user = userInfo[0];
    if (bcrypt.compareSync(req.body.password, user.password)) {
      res.status(200).json({
        user_id: user.user_id,
        username: user.username,
        hackcoin: user.hackcoin
      });
    } else {
      res.status(401).send('false password');
    }
  } else {
    res.status(401).send('username doesn\'t exist');
  }
});

app.post('/register', async (req, res) => {
  const shasum = bcrypt.hashSync(req.body.password);
  const data = await db.createUser(req.body.username, shasum);
  if (data === 'already exists') {
    res.status(409).end();
  } else {
    const userInfo = await db.checkCredentials(req.body.username);
    res.status(200).json({
      user_id: userInfo[0].user_id,
      username: userInfo[0].username,
      hackcoin: userInfo[0].hackcoin
    });
  }
});

app.post('/coin', async (req, res) => {
  let currentHackCoins = await db.checkCoin(req.body.userId);
  currentHackCoins = currentHackCoins.pop().hackcoin;

  if (currentHackCoins > 0 && req.body.hackCoins <= currentHackCoins) { //user has usable coins and asking to use a number of some available -- good update db
    await db.subtractCoins(currentHackCoins, req.body.hackCoins, req.body.userId, req.body.commentId);
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

app.post('/solution', async (req, res) => {
  console.log(req.body);
  const data = await db.markSolution(req.body.commentId, req.body.postId);
  res.status(200).end();
});

app.get('*', (req, res) => res.redirect('/'));

app.listen(process.env.PORT || 3000, function () {
  console.log('listening on port 3000!');
});
