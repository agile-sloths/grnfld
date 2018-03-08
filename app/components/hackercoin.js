angular.module('app')
.controller('TypeaheadCtrl', function($scope, $http, limitToFilter) {
    $scope.getUsers = function(val) {
        return $http.get('/users', {
          params: {
            username: val,
            sensor: false
          }
        }).then(function(response){
          return response.data.map(function(item){
            return limitToFilter(item.username, 5);
          });
        });
      };
});
