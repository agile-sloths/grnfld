angular.module('app')
.controller('NavbarCtrl', function($scope, $rootScope, $location, usersService) {
  $scope.logout = function() {
    $rootScope.userId = 0;
    usersService.logout();
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
