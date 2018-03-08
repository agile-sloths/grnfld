angular.module('app')
.service('coinsService', function ($http) {
    this.submitGift = function(username, amount) {
        $http.post('/coin')
        .then(function(data) {

        })
    }
});