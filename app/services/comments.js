 angular.module('app')
.service('commentsService', function ($http) {
  this.submitNewComment = function (newCommentObj, callback) {
    $http.post('/createComment', newCommentObj)
      .then(function (data) {
        callback(data);
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  this.likeComment = async (newLikeObj) => {
    return await $http.post('/coin', newLikeObj)
  };

  this.unlikeComment = async (unlikeObj) => {
    return await $http.post('/coin', unlikeObj)
  };

  //grab comments
  this.getComments = function (postId, callback) {
    $http.get('/comments', {
      params: { postId: postId }
    })
      .then(function ({ data }) {
        callback(data);
      })
      .catch(function (err) {
        console.log(err);
    });
  };

  this.selectSolution = async (commentId, postId) => {
    await $http.post('/solution', {
      postId: postId, commentId: commentId
    });
  };
});
