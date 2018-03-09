angular.module('app')
.controller('UsersCtrl', function($scope, $rootScope, $location, usersService) {
  $scope.getGithubPicture = function() {
  	console.log('Got it!');
  }
})
.directive('users', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/users.html',
  };
});