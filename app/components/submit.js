angular.module('app')
.controller('SubmitCtrl', function($scope, postsService, $rootScope, $location) {
  $scope.submit = function(isValid) {
    if (isValid) {
      postsService.submitNewPost($scope.post, res => {
        if (res.status === 200) {
          $location.path('/');
        }
      });
    }
  };

  //create new post variable
  $scope.post = {
    userId: +$rootScope.userId,
    title: '',
    codebox: '',
    description: ''
  };
});
