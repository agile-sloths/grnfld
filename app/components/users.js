angular.module('app')
.controller('UsersCtrl', function($scope, $http, usersService, $rootScope) {
    usersService.getAllUsers = function() {
        return $http.get('/users', {

        }).then(function(response){
          console.log('controller response', response)
          return response;
        }).catch(function(err) {
          console.log(err)
          res.end()
        });
      }})
.directive('users', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/users.html',
}});
