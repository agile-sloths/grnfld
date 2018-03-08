angular.module('app')
.controller('TypeaheadCtrl', function($scope, $http, limitToFilter, coinsService) {
    $scope.gift = {
      username: '',
      amount: ''
    }
  
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
    $scope.submitGift = function() {
      console.log('works')
      coinsService.submitNewGift(/*user goes here, amount goes here*/)
    }
});
