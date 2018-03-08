angular.module('app')
.controller('TypeaheadCtrl', function($scope, $http) {
    $scope.getUsers = function(val) {
        return $http.get('/users', {
          params: {
            username: val,
            sensor: false
          }
        }).then(function(response){
          return response.data.map(function(item){
            return item.username;
          });
        });
      };
});
