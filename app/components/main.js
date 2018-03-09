angular.module('app')
.controller('MainCtrl', function ($scope, usersService, postsService, $rootScope, commentsService) {
  $('.alert .close').on('click', function (e) {
    $(this).parent().hide();
  });

  $scope.init = function() {
    $rootScope.userId = window.localStorage.userId || null;
    $rootScope.hackcoin = window.localStorage.hackcoin || null;
    $rootScope.sessionId = window.localStorage.sessionID || null;
    $scope.currentPage = 1;
    $scope.numPerPage = 5;

    //get all posts on page load
    postsService.getAll((posts, postVotes, featuredPost) => {
      $scope.posts = posts;
      $scope.postVotes = {};
      postVotes.forEach(pair => {
        if (!$scope.postVotes.hasOwnProperty(pair.post_id)) {
          $scope.postVotes[pair.post_id] = {};
        }
        $scope.postVotes[pair.post_id][pair.user_id] = pair.vote;
      })
      // category selecter
      $scope.languages = [{
        id: 0,
        label: 'All'
      },
      {
        id: 1,
        label: 'HTML',
      }, {
        id: 2,
        label: 'CSS',
      }, {
        id: 3,
        label: 'JavaScript',
      }, {
        id: 4,
        label: 'Python',
      }, {
        id: 5,
        label: 'C++',
      }, {
        id: 6,
        label: 'C#',
      }, {
        id: 7,
        label: 'Ruby',
      }];
      $scope.selectedLanguage = $scope.languages[0]; // default to all languages

      $scope.$watch(function() {
        return $rootScope.userId; // watch user id so that whenever login/signup/logout happens, renrender
      }, function(newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.init();
        }
      });

      //featured post
      $scope.featuredPost = featuredPost[0];

      $scope.assignVoters($scope.featuredPost);

      //pagination
      $scope.$watch('currentPage + numPerPage', function () {
        //filter posts by page number
        let begin = (($scope.currentPage - 1) * $scope.numPerPage);
        let end = begin + $scope.numPerPage;

        $scope.filteredPosts = $scope.posts.slice(begin, end);

        $scope.filteredPosts.forEach(post => { // for each visible post,
          $scope.assignVoters(post);
        })
        $scope.selectLanguage(); // initialize filter based on language
      });
    });
  };

  //runs init on view startup
  $scope.init();

  $scope.handlePostClick = (clickedValue) => {
    $('#like-alert').hide();
    $scope.currentPost = $scope.filteredPosts[clickedValue];
    //get all comments from clicked post
    commentsService.getComments($scope.currentPost.post_id, (data) => {
      $scope.comments = data;
      $scope.comments.forEach(comment => comment.message = comment.message.replace(/\{\{([^}]+)\}\}/g, '<code>$1</code>'));
      $scope.currentIndex = clickedValue; //sets index for when submit comment is clicked
    });

  };

  //hacky way of refreshing the current view to get new posts
  $scope.refresh = () => {
    $scope.init();
  };

  $scope.toggleStyle = () => {
    let el = document.getElementById("styledark");
    let buttonText = document.getElementById("styletoggle");
    if (el.href.match("https://maxcdn.bootstrapcdn.com/bootswatch/3.3.7/solar/bootstrap.min.css")) {
        el.href = "https://maxcdn.bootstrapcdn.com/bootswatch/3.3.7/materia/bootstrap.min.css";
        buttonText.innerHTML = 'Dark Mode'
        console.log(el)
    }
    else {
        el.href = "https://maxcdn.bootstrapcdn.com/bootswatch/3.3.7/solar/bootstrap.min.css";
        buttonText.innerHTML = 'Light Mode'
        console.log(el)
    }
  };


  $scope.deleteComment = async (comment, index) => {
    console.log('delete comment input!',comment.comment_id, $rootScope.userId);
    let res = await commentsService.deleteComment(comment.comment_id, $rootScope.userId);
    if (res.status === 204) {
      console.log('success!');
      // $scope.$apply(() => {
      //   $scope.comments[index].active = false;
      // });
      $('#like-alert').show();
    }
  };

  $scope.message = '';

  $scope.submitComment = (isValid) => {
    if (isValid) {
      let commentObj = {
        user_id: $rootScope.userId,
        post_id: $scope.currentPost.post_id,
        message: $scope.message
      };
      commentsService.submitNewComment(commentObj, (data) => {
        $scope.message = '';
        $scope.handlePostClick($scope.currentIndex);
      });
    }
  };

  $scope.assignVoters = (post) => {
    post.voters = {}; // create voters object
    if ($scope.postVotes.hasOwnProperty(post.post_id)) { // check if post exists in all retrieved post vote pairs
      for (let voter in $scope.postVotes[post.post_id]) { // if so, select each voter in that pair
        post.voters[voter] = $scope.postVotes[post.post_id][voter]; // and set it to the post object
      }
    }
    if ($rootScope.userId) {
      if (post.voters.hasOwnProperty($rootScope.userId)) {
        if (post.voters[$rootScope.userId] === 0) {
          post.votedOn = 'down';
        } else {
          post.votedOn = 'up';
        }
      }
    }
  }

  $scope.selectLanguage = (language) => {
    if (language) {
      for (let i = 0; i < $scope.languages.length; i++) {
        if ($scope.languages[i].label === language) {
          $scope.selectedLanguage = $scope.languages[i];
        }
      }
    }
    $scope.filteredPosts = $scope.posts.filter(post => {
      if (post.post_id === $scope.featuredPost.post_id) {
        return;
      }
      if ($scope.selectedLanguage.label === 'All') {
        return post;
      } else {
        return post.language === $scope.selectedLanguage.label;
      }
    });
  }

  $scope.selectSolution = (comment) => {
    if ($rootScope.userId === $scope.currentPost.user_id) {
      $scope.currentPost.solution_id = comment.comment_id; //changes local solution_id so that star moves without refresh
      commentsService.selectSolution(comment.comment_id, $scope.currentPost.post_id);
      console.log('select Solution completed');
    }
  };

  $scope.unselectSolution = (comment) => {
    if (($rootScope.userId === $scope.currentPost.user_id) && ($scope.currentPost.solution_id === comment.comment_id)) {
      $scope.currentPost.solution_id = null;
      commentsService.unselectSolution(comment.comment_id, $scope.currentPost.post_id);
      console.log('Unselect Solution completed');
    }
  };

  $scope.likeComment = async (commentId, postUserId, index) => {
    //need commmentId, usernameId(rootscope), how many coins to use (ng-click to send one and ng-double click to send more?)
    //TODO add modal for ng-doubleclick
    if ($rootScope.hackcoin <= 0) {
      $('#like-error').show();
    } else {
      let res = await commentsService.likeComment({
        commentId: commentId,
        postUserId: postUserId,
        userId: $rootScope.userId,
        hackCoins: 1
      });

      if (res.status === 200) {
        $scope.$apply(() => {
          --$rootScope.hackcoin;
          $scope.comments[index].votes++;
          if (!$scope.comments[index].voters.hasOwnProperty($rootScope.userId)) {
            $scope.comments[index].voters[$rootScope.userId] = 1;
          } else {
            $scope.comments[index].voters[$rootScope.userId]++;
          }
        });
        $('#like-alert').show();
      }
    }
  };

  $scope.unlikeComment = async (commentId, postUserId, index) => {
    if ($scope.comments[index].voters[$rootScope.userId] > 0) {
      let res = await commentsService.unlikeComment($rootScope.userId, commentId, postUserId, 1);
      if (res.status === 204) {
        $scope.$apply(() => {
          ++$rootScope.hackcoin;
          $scope.comments[index].votes--;
          $scope.comments[index].voters[$rootScope.userId]--;
        });
        $('#like-error').hide();
        $('#like-alert').show();
      }
    }
  };

  $scope.upvotePost = async (userId, postId, postUserId, index) => {
    await postsService.upvotePost({
      userId: userId,
      postId: postId,
      postUserId: postUserId
    }, (data) => {
      if (data.status === 201) {
        index === 'featured' ?
        post = $scope.featuredPost :
        post = $scope.filteredPosts[index];
        post.votes++;
        if (post.votedOn === null || !post.votedOn) {
          post.votedOn = 'up';
        } else if (post.votedOn === 'down') {
          post.votedOn = null;
        }
      }
    });
  }

  $scope.downvotePost = async (userId, postId, postUserId, index) => {
    await postsService.downvotePost(userId, postId, postUserId, (data) => {
      if (data.status === 204) {
        index === 'featured' ?
        post = $scope.featuredPost :
        post = $scope.filteredPosts[index];
        post.votes--;
        if (post.votedOn === null || !post.votedOn) {
          post.votedOn = 'down';
        } else if (post.votedOn === 'up') {
          post.votedOn = null;
        }
      }
    });
  }

  $scope.submitUnlikes = async (isValid) => {
    if (isValid) {
      let res = await commentsService.unlikeComment($rootScope.userId, $scope.unlikeCommentId, $scope.unlikePostUserId, $scope.unlike.input);
        if (res.status === 204) {
          $scope.$apply(() => {
            $rootScope.hackcoin += $scope.unlike.input;
            $scope.comments[$scope.unlikeIndex].votes -= $scope.unlike.input;
            $scope.comments[$scope.unlikeIndex].voters[$rootScope.userId] -= $scope.unlike.input;
          });
          $('#unlike-modal').modal('toggle');
          $('#like-alert').show();
        }
    } else {
      $('#unlikemultiple-error').show();
    }
  };


  $scope.multipleUnlike = (commentId, postUserId, index) => {
    if ($scope.comments[index].voters[$rootScope.userId] > 1) {
      $scope.max = $scope.comments[index].voters[$rootScope.userId] - 1;
      $scope.unlikeCommentId = commentId;
      $scope.unlikePostUserId = postUserId;
      $scope.unlikeIndex = index;
      $('#unlike-modal').modal('toggle');
    }
  };

  $scope.unlike = {
    input: 1
  };

  $scope.multipleLike = (commentId, postUserId, index) => {
    if ($rootScope.hackcoin <= 0) {
      $('#like-error').show();
    } else {
      $scope.commentId = commentId;
      $scope.postUserId = postUserId;
      $scope.index = index;
      $('#like-modal').modal('toggle');
    }
  };

  $scope.like = {
    input: 1
  };


  $scope.submit = async (isValid) => {
    if (isValid) {
        let res = await commentsService.likeComment({
          commentId: $scope.commentId,
          postUserId: $scope.postUserId,
          userId: $rootScope.userId,
          hackCoins: $scope.like.input
        });
        if (res.status === 200) {
          $scope.$apply(() => {
            $rootScope.hackcoin -= $scope.like.input;
            $scope.comments[$scope.index].votes += $scope.like.input;
            if (!$scope.comments[$scope.index].voters.hasOwnProperty($rootScope.userId)) {
              $scope.comments[$scope.index].voters[$rootScope.userId] = $scope.like.input;
            } else {
              $scope.comments[$scope.index].voters[$rootScope.userId] += $scope.like.input;
            }
          });
          $('#like-modal').modal('toggle');
          $('#like-alert').show();
        }
    } else {
      $('#likemultiple-error').show();
    }
  };

});
