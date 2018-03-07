angular.module('app')
.controller('TypeaheadCtrl', function($scope, $http) {
    // coinsService.getAll(data => {
    //     $scope.users = data
    //     console.log('SCOPE USERS', $scope.users)

    // })
    $scope.getUsers = function(val) {
        console.log(val)
        return $http.get('/users', {
          params: {
            username: val,
            sensor: false
          }
        }).then(function(response){
            console.log(response)
          return response.data.results.map(function(item){
            console.log("SEARCH", item.username)
            return item.username;
          });
        });
      };
});
