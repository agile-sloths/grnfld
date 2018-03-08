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
    .orderBy('post_id', 'desc');
};

const getComments = (postId) => {
  return knex.column(knex.raw('comments.*, users.username')).select()
    .from(knex.raw('comments, users'))
    .where(knex.raw(`comments.post_id = ${postId} and comments.user_id = users.user_id`))
    .orderBy('votes', 'desc');
};

const getVoters = (commentId) => {
  return knex.column(knex.raw('userscomments.user_id, userscomments.votes')).select().from('userscomments')
    .where(knex.raw(`comment_id = ${commentId}`));
};

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

const createUser = async (username, password) => {
  const query = await knex.select().from('users')
    .where(knex.raw(`LOWER(username) = LOWER('${username}')`));

  if (query.length) {
    return 'already exists';
  } else {
    return await knex('users').insert({ username: username, password: password});
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

module.exports = {
  getAllPosts,
  createPost,
  getComments,
  getVoters,
  // getPostsWithCommentsAsync,
  checkCredentials,
  createUser,
  createComment,
  markSolution,
  unmarkSolution,
  checkCoin,
  subtractCoins,
  addCoin,
  refreshCoins
};
