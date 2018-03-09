angular.module('app')
.controller('UsersCtrl', function($scope, $http, usersService, $rootScope) {
    usersService.getAllUsers = function() {
        return $http.get('/users', {

        }).then(function(response){
          return response;
        }).catch(function(err) {
          console.log(err)
          res.end()
        });
      };
});
