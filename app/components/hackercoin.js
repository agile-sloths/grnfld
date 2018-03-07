angular.module('app')
.controller('TypeaheadCtrl', function($scope, $http, coinsService) {
    coinsService.getAll(data => {
        console.log("DATA", )
    })

    $scope.getUsers = function(val) {
        return $http.get('/users', {
          params: {
            username: val
          }
        }).then(function(response){
            console.log("SEARCH")
          return response.data.results.map(function(item){
            console.log("SEARCH", item.username)
            return item.username;
          });
        });
      };
});
