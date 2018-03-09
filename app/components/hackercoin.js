angular.module('app')
.controller('TypeaheadCtrl', function($scope, $http, coinsService, $rootScope) {
    $scope.gift = {
      username: '',
      amount: ''
    }

    $scope.slotValues = [
      {value: 'LOSE'},
      {value: 'WIN'},
      {value: 'LOSE'},
      {value: 'LOSE'},
      {value: 'LOSE'},
      {value: 'LOSE'},
      {value: 'LOSE'},
      {value: 'LOSE'},
      {value: 'LOSE'},
      {value: 'LOSE'},
      {value: 'LOSE'},
      {value: 'LOSE'},
      {value: 'LOSE'},
      {value: 'LOSE'},
    ]

    $scope.slotError = {
      error: false
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
    
    $scope.getRandomSlotValue = async () => {
      $scope.slotError === false;
      if ($rootScope.hackcoin <= 0) {
        $scope.slotError.error === true;
      } else {
        await coinsService.spendCoin($rootScope.userId);
        $rootScope.hackcoin = $rootScope.hackcoin - 1;
        window.localStorage.hackcoin = $rootScope.hackcoin;
        //take a coin on button click, then update window.localstorage.hackcoin
        //disable button until function is done running
        //run result
        //if result is a loser, return a message telling to spend a coin to try again
        //if result is a winner, add 10 coins to the users
        let result = $scope.randomSlot = $scope.slotValues[Math.floor(Math.random() * $scope.slotValues.length)];
        if (result.value === 'LOSE') {
          $scope.slotError.error === true;
          //show message that says 'You lost- click to try again'
        } else if (result.value === 'WIN') {
          coinsService.coinPrize($rootScope.userId);
          $rootScope.hackcoin = $rootScope.hackcoin + 10;
          window.localStorage.hackcoin = $rootScope.hackcoin;
        }
      }
    }
});
