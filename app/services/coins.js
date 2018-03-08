angular.module('app')
.service('coinsService', function ($http) {
    this.submitNewGift = async function(username, amount) {
        console.log('service')
        return await $http.post('/gift') //add amount of coin to user
        .then(function(data) {
            console.log('delete service', data)
            return $http.delete('/gift') //delete that amount of coin from current user
        })
    }
});