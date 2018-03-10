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
    language: '',
    codebox: '',
    description: ''
  };
  $scope.languages = [{
    id: 0,
    label: 'HTML',
  }, {
    id: 1,
    label: 'CSS',
  }, {
    id: 2,
    label: 'JavaScript',
  }, {
    id: 3,
    label: 'Python',
  }, {
    id: 4,
    label: 'C++',
  }, {
    id: 5,
    label: 'C#',
  }, {
    id: 6,
    label: 'Ruby',
  }, {
    id: 7,
    label: 'Other',
  }];
});
