angular.module('app')
.controller('TypeaheadCtrl', function($scope, $http, coinsService, $rootScope) {
    $scope.gift = {
      username: '',
      amount: ''
    }

    $scope.slotValues = [
      {value: 'LOSE'},
      {value: 'WIN'},
      {value: 'LOSE'}
    ]

    $scope.slotResults = {
      value: ''
    }
  
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
        }).catch(function(err) {
          console.log(err)
        });
      };

    $scope.submitGift = function() {
      if ($rootScope.hackcoin < $scope.gift.amount) {
        console.log(`You don't have enough coins to give that amount!`)
      } else {
        coinsService.submitNewGift($scope.gift.username, $scope.gift.amount, $rootScope.userId)
        $rootScope.hackcoin = $rootScope.hackcoin - $scope.gift.amount;
        window.localStorage.hackcoin = $rootScope.hackcoin;
        $scope.gift.username = '';
        $scope.gift.amount = '';
      }
    }

    $scope.getRandomSlotValue = function(length) {

      var result = Math.floor(Math.random() * length);
      return result;
      $scope.slotValues.value = result.value
    }
});
