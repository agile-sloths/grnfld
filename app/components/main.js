angular.module('app')
.controller('MainCtrl', function ($scope, postsService, $rootScope, commentsService) {
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
    postsService.getAll((posts, postVotes) => {
      console.log('got posts', posts);
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

      //pagination
      $scope.$watch('currentPage + numPerPage', function () {
        //filter posts by page number
        let begin = (($scope.currentPage - 1) * $scope.numPerPage);
        let end = begin + $scope.numPerPage;

        $scope.filteredPosts = $scope.posts.slice(begin, end);

        $scope.filteredPosts.forEach(post => { // for each visible post,
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
      console.log('comments', data);
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

  $scope.selectLanguage = () => {
    $scope.filteredPosts = $scope.posts.filter(post => {
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
      let res = await commentsService.unlikeComment($rootScope.userId, commentId, postUserId);

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

  $scope.upvotePost = async (userId, postId, postUserId, index) => {''
    await postsService.upvotePost({
      userId: userId,
      postId: postId,
      postUserId: postUserId
    }, (data) => {
      if (data.status === 201) {
        let post = $scope.filteredPosts[index];
        console.log($scope)
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
        let post = $scope.filteredPosts[index];
        post.votes--;
        if (post.votedOn === null || !post.votedOn) {
          post.votedOn = 'down';
        } else if (post.votedOn === 'up') {
          post.votedOn = null;
        }
      }
    });
  }

  $scope.multipleLike = (commentId, postUserId, index) => {
    if ($rootScope.hackcoin <= 0) {
      $('#like-error').show();
    } else {
      console.log('like has been double clicked!-->',commentId, postUserId, index);
      $('#like-modal').modal('toggle');
    }
  };

  $scope.like = {
    input: 0
  };

  $scope.submit = async (isValid, commentId, postUserId, index) => {
    if (isValid) {
      console.log('form is valid! heres scope:', $scope.like.input);
      console.log('hers submit-->',commentId, postUserId, index);
      if($scope.like.input === 0) {
        $('#likemultiple-error').show();
        $('#likemultiple-error').hide();
      } else {
        let res = await commentsService.likeComment({
          commentId: commentId,
          postUserId: postUserId,
          userId: $rootScope.userId,
          hackCoins: $scope.like.input
        });
        if (res.status === 200) {
          $scope.$apply(() => {
            $rootScope.hackcoin -= $scope.like.input;
            $scope.comments[index].votes += $scope.like.input;
            if (!$scope.comments[index].voters.hasOwnProperty($rootScope.userId)) {
              $scope.comments[index].voters[$rootScope.userId] = $scope.like.input;
            } else {
              $scope.comments[index].voters[$rootScope.userId] += $scope.like.input;
            }
          });
          $('#like-modal').modal('toggle');
          $('#like-alert').show();
        }
      }
    } else {
      $('#likemultiple-error').show();
    }
  };

});
