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
      console.log($scope.gift.username)
      // console.log('controller test')
      return coinsService.submitNewGift($scope.gift.username, $scope.gift.amount)
    }
});
