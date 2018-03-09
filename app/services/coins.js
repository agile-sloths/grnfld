angular.module('app')
.service('coinsService', function ($http, $rootScope) {
    this.submitNewGift = function(username, amount, currentUserId) {
        $http.post('/gift', {
            params: {
                username: username,
                amount: amount
            }
        }).then(function(response) {
            currentUserId = $rootScope.userId;
            return $http.delete(`/gift?${currentUserId}?${amount}`)
        }).catch(function(err) {
            console.log(err)
        })
    }

    this.spendCoin = async (userId) => {
        return await $http.delete(`/slot?${userId}`)
    }
    
});