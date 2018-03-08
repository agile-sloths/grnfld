angular.module('app')
.controller('TypeaheadCtrl', function($scope, $http) {
    // coinsService.getAll(data => {
    //     $scope.users = data
    //     console.log('SCOPE USERS', $scope.users)

    // })
    $scope.getUsers = function(val) {
        return $http.get('/users', {
          params: {
            username: val,
            sensor: false
          }
        }).then(function(response){
          return response.data.map(function(item){
            console.log("SEARCH", item.username)
            return item.username;
          });
        });
      };
});
