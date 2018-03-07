angular.module('app')
.service('coinsService', function ($http) {
  this.getAll = function (callback) {
    $http.get('/users')
      .then(function ({ data }) {
        callback(data);
      })
      .catch(function (err) {
        console.log(err);
      });
  };
});