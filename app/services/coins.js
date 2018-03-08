angular.module('app')
.service('coinsService', function ($http) {
    this.submitNewGift = async function(username, amount) {
        await $http.post(`/coin?${username}`)
        .then(function(data) {
            $http.delete('/coin')
        })
    }
});