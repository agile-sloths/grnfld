angular.module('app')
.service('usersService', function ($http) {
  this.login = function (username, password, callback) {
    $http.post('/login', {
      username: username,
      password: password
    })
      .then(function (data) {
        callback(data);
      })
      .catch(function (err) {
        callback(err);
    });
  };

  this.register = function (username, password, location, languages, github_handle, callback) {
    $http.post('/register', {
      username: username,
      password: password,
      location: location,
      languages: languages,
      github_handle: github_handle
    })
      .then(function (data) {
        callback(data);
      })
      .catch(function (err) {
        callback(err);
    });
  };

  this.logout = function (callback) {
    $http.post('/logout')
      .then(function (data) {
        console.log(err);
      })
      .catch(function (err) {
        console.error(err);
    });
  };

  this.getAllUsers = function (callback) {
    $http.get('/users')
      .then(function ({ data }) {
        callback(data);
      })
      .catch(function (err) {
        console.log(err);
      });
  };
});
