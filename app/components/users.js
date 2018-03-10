angular.module('app')
.controller('UsersCtrl', function($http, $scope, $rootScope, $location, usersService) {
//   $scope.getGithubPicture = function(githubHandle) {
//   	$http.get(`https://api.github.com/users/${githubHandle}`)
//   	.then(function (response) {
//   	  return response.avatar_url
//   	})
// 	  .catch(function (error) {
// 	  	console.log(error);
// 	  	// return default picture tag
// 	  });
//   }
})
.directive('users', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/users.html',
  };
});