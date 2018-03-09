angular.module('app')
.controller('NavbarCtrl', function($scope, $rootScope, $location, usersService) {
  $scope.logout = function() {
    $rootScope.userId = 0;
    $rootScope.hackcoin = 0;
    usersService.logout((err, data) => {
      err ? console.log(err) : console.log(data);
    });
    $location.path('/');
    $rootScope.sessionId = null;
    window.localStorage.clear();
    $('#like-error').hide();
  };
})
.directive('navbar', function() {
  return {
    templateUrl: 'templates/navbar.html',
    controller: 'NavbarCtrl'
  };
});
