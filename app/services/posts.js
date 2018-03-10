angular.module('app')
.service('postsService', function ($http) {
  this.getAll = function (callback) {
    $http.get('/posts')
      .then(function ({ data }) {
        callback(data.posts, data.postVotes, data.featuredPost);
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  this.upvotePost = function (postObj, callback) {
    $http.post('/upvotePost', postObj)
      .then(function (data) {
        callback(data);
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  this.downvotePost = function (userId, postId, postUserId, callback) {
    $http.delete(`/downvotePost?${userId}/${postId}/${postUserId}`)
      .then(function (data) {
        callback(data);
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  this.deletePost = async (postId) => {
    return await $http.delete(`/post?${postId}`);
  };

  this.submitNewPost = function (newPostObj, callback) {
    $http.post('/createPost', newPostObj)
      .then(function (data) {
        callback(data);
      })
      .catch(function (err) {
        console.log(err);
    });
  };
});
