angular.module('app')
.directive('users', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/users.html',
  };
});