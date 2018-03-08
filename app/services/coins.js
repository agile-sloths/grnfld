angular.module('app')
.service('coinsService', function ($http) {
    this.submitNewGift = async function(username, amount) {
        return await $http.post(`/coin?${username}`)
        .then(function(data) {
            console.log(data)
        })
    }
});