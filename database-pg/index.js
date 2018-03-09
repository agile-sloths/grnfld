const config = require('./config.js');
let knex;

if (config.mySql) {
  knex = require('knex')({
    client: 'mysql',
    connection: config.mySql
  });
} else {
  knex = require('knex')({
    client: 'pg',
    connection: process.env.DATABASE_URL,
    ssl: true
  });
}

const getAllPosts = () => {
  return knex.column(knex.raw('posts.*, users.username')).select()
    .from(knex.raw('posts, users'))
    .where(knex.raw('posts.user_id = users.user_id'))
    .orderBy('post_id', 'desc')
    .orderBy('votes', 'desc');
};

const getPostVotes = () => {
  return knex('usersposts').select('post_id', 'user_id', 'vote');
};

const getFeaturedPost = async () => {
  let maxVotes = await knex('posts').max('votes').select();
  return knex('posts').select().where('votes', maxVotes[0]['max(`votes`)']);
}

const getComments = (postId) => {
  return knex.column(knex.raw('comments.*, users.username')).select()
    .from(knex.raw('comments, users'))
    .where(knex.raw(`comments.post_id = ${postId} and comments.user_id = users.user_id and comments.active = true`))
    .orderBy('votes', 'desc');
};

const getVoters = (commentId) => {
  return knex.column(knex.raw('userscomments.user_id, userscomments.votes')).select().from('userscomments')
    .where(knex.raw(`comment_id = ${commentId}`));
};

const getUsers = async () => {
  return await knex.column(knex.raw('username, user_id, hackcoin, location, languages, github_handle')).select().from('users');
}

//using async/await
//currently not used
// async function getPostsWithCommentsAsync() {
  //get all posts with username
  // const posts = await knex.select().from('posts')
      // .leftOuterJoin('users', 'users.user_id', 'posts.user_id');

  //returns posts with a comment array inside each post object
  // return Promise.all(posts.map(async (post, index, posts) => {
    //get all comments for the selected post_id
//     const comments = await knex.select().from('comments')
//         .where('post_id', post.post_id);
//     post.comments = comments;
//     return post;
//   }));
// }

const createPost = (post) => {
  return knex('posts').insert({
    user_id: post.userId,
    title: post.title,
    code: post.codebox,
    summary: post.description,
    anon: false //hard coded to false until functionality implemented
  });
};

const upvotePost = async (post) => {
  let voted = await knex('usersposts').select('vote').where('user_id', post.userId).andWhere('post_id', post.postId);
  if (!voted.length) {
    await knex('posts').where('post_id', post.postId).increment('votes', 1); // increase post votes
    await knex('users').where('user_id', post.postUserId).increment('hackcoin', 1); // give owner of post hackcoin
    await knex('usersposts').insert({user_id: post.userId, post_id: post.postId, vote: true}); // create record of post
    return 1; // need status code to tell to server to send on success
  } else if (voted[0].vote === 0) {
    await knex('posts').where('post_id', post.postId).increment('votes', 1); // increase post votes
    await knex('users').where('user_id', post.postUserId).increment('hackcoin', 1); // give owner of post hackcoin
    await knex('usersposts').where('user_id', post.userId).andWhere('post_id', post.postId).del();
    return 1; // need status code to tell to server to send on success
  }
}

const downvotePost = async (userId, postId, postUserId) => {
  let voted = await knex('usersposts').select('vote').where('user_id', userId).andWhere('post_id', postId);
  if (!voted.length) {
    await knex('posts').where('post_id', postId).decrement('votes', 1);
    await knex('users').where('user_id', postUserId).decrement('hackcoin', 1); // give owner of post hackcoin
    await knex('usersposts').insert({user_id: userId, post_id: postId, vote: false});
    return 1; // need status code to tell to server to send on success
  } else if (voted[0].vote === 1) {
    await knex('posts').where('post_id', postId).decrement('votes', 1);
    await knex('users').where('user_id', postUserId).decrement('hackcoin', 1); // give owner of post hackcoin
    await knex('usersposts').where('user_id', userId).andWhere('post_id', postId).del();
    return 1; // need status code to tell to server to send on success
  }
}

const createComment = (comment) => {
  return knex('comments').insert({
    user_id: comment.user_id,
    post_id: comment.post_id,
    message: comment.message
  }).orderBy('comment_id', 'asc');
};

const checkCredentials = (username) => {
  return knex.select().from('users')
    .where(knex.raw(`LOWER(username) = LOWER('${username}')`));
};

const createUser = async (req, username, password) => {
  console.log('reqqqq', req.body)
  const query = await knex.select().from('users')
    .where(knex.raw(`LOWER(username) = LOWER('${username}')`));

  if (query.length) {
    return 'already exists';
  } else {
    return await knex('users').insert({ username: username, password: password, location: req.body.location, languages: req.body.languages, github_handle: req.body.github_handle });
  }
};

const markSolution = async (commentId, postId) => {
  await knex('posts').where('post_id', postId).update('solution_id', commentId);
  await knex('comments').where('comment_id', commentId).update('solution', true);
};

const unmarkSolution = async (commentId, postId) => {
  await knex('posts').where('post_id', postId).update('solution_id', null);
  await knex('comments').where('comment_id', commentId).update('solution', false);
};

const checkCoin = (userId) => {
  return knex.select('hackcoin').from('users').where('user_id', userId);
};

const checkCoinByUsername = (username) => {
  return knex.select('hackcoin').from('users').where('username', username);
};

const deleteComment = async (commentId) => {
  await knex('comments').where('comment_id', commentId).update('active', false);
};

const subtractCoins = async (currenthackcoin, subtractinghackcoin, userId, commentId, flag) => {
  await knex('users').where('user_id', userId).update('hackcoin', currenthackcoin - subtractinghackcoin);

  if (flag) {
    let currentVotes = await knex.select('votes').from('comments').where('comment_id', commentId);
    await knex('comments').where('comment_id', commentId).update('votes', currentVotes[0].votes + subtractinghackcoin);  //update votes by amount of hackcoins subtracted
    let currentCount = await knex.select('votes').from('userscomments').where('user_id', userId).andWhere('comment_id', commentId);
    if (!currentCount.length) {
      await knex('userscomments').insert({
        user_id: userId,
        comment_id: commentId,
        votes: subtractinghackcoin
      });
    } else {
      let userVotes = await knex.select('votes').from('userscomments').where('comment_id', commentId).andWhere('user_id', userId);
      await knex('userscomments').where('comment_id', commentId).andWhere('user_id', userId).update('votes', userVotes[0].votes + subtractinghackcoin);
    }
  }
};

const addCoin = async (userId, commentId, flag, addinghackcoin) => {
  let currentCoins = await knex.select('hackcoin').from('users').where('user_id', userId);
  await knex('users').where('user_id', userId).update('hackcoin', currentCoins[0].hackcoin + addinghackcoin);

  if (flag) {
    let currentVotes = await knex.select('votes').from('comments').where('comment_id', commentId);
    let userVotes = await knex.select('votes').from('userscomments').where('comment_id', commentId).andWhere('user_id', userId);
    await knex('comments').where('comment_id', commentId).update('votes', currentVotes[0].votes - addinghackcoin);
    await knex('userscomments').where('comment_id', commentId).andWhere('user_id', userId).update('votes', userVotes[0].votes - addinghackcoin);
  }
};

const refreshCoins = () => {
  knex('users').update('hackcoin', 5);
};

const giftCoin = async (username, amount) => {
  let currentCoins = await knex.select('hackcoin').from('users').where('username', username);
  await knex('users').where('username', username).update('hackcoin', currentCoins[0].hackcoin + amount);
}

const deleteGiftedCoin = async (currentUserId, amount) => {
  let currentCoins = await knex.select('hackcoin').from('users').where('user_id', currentUserId);
  await knex('users').where('user_id', currentUserId).update('hackcoin', currentCoins[0].hackcoin - amount);
}

module.exports = {
  getAllPosts,
  getPostVotes,
  getFeaturedPost,
  createPost,
  upvotePost,
  downvotePost,
  getComments,
  getVoters,
  deleteComment,
  // getPostsWithCommentsAsync,
  checkCredentials,
  createUser,
  createComment,
  markSolution,
  unmarkSolution,
  checkCoin,
  subtractCoins,
  addCoin,
  refreshCoins,
  getUsers,
  giftCoin,
  deleteGiftedCoin,
  checkCoinByUsername
};
