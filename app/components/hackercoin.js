angular.module('app')
  .controller('TypeaheadCtrl', function ($scope, $http, coinsService, $rootScope) {
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
      {value: 'LOSE'}
    ]

    $scope.userData = [];

    $scope.getUsers = function (val) {
      return $http.get('/users', {
        params: {
          username: val,
          sensor: false
        }
      }).then(function (response) {
        return response.data.map(function (item) {
          $scope.userData.push(item.username);
          return $scope.userData
        });
      }).catch(function (err) {
        console.log(err)
      });
    };

    $scope.getUsers();

    $scope.submitGift = function () {
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
      $('#slot-alert').hide();
      $('#slot-alert2').hide();
      $('#slotwon-alert').hide();
      if ($rootScope.hackcoin <= 0) {
        $('#slot-alert2').show();
      } else {
        $rootScope.hackcoin = $rootScope.hackcoin - 1;
        await coinsService.spendCoin($rootScope.userId);
        window.localStorage.hackcoin = $rootScope.hackcoin;
        let result = $scope.randomSlot = $scope.slotValues[Math.floor(Math.random() * $scope.slotValues.length)];
        if (result.value === 'LOSE') {
          $('#slot-alert').toggle("slide", "left", "slow");;
        } else if (result.value === 'WIN') {
          $('#slotwon-alert').toggle("slide", "left", "slow").effect('shake', 'slow');
          $rootScope.hackcoin = $rootScope.hackcoin + 10;
          coinsService.coinPrize($rootScope.userId);
          window.localStorage.hackcoin = $rootScope.hackcoin;
        }
      }
    }
  });