angular.module('app')
.controller('LoginCtrl', function($scope, usersService, $rootScope, $location) {
  $('.alert .close').on('click', function (e) {
    $(this).parent().hide();
  });

  $scope.login = {
    username: '',
    password: ''
  };

  $scope.submit = function(isValid) {
    if (isValid) {
      usersService.login($scope.login.username, $scope.login.password, res => {
        if (res.status === 401) {
          $('#login-error').show();
        } else {
          $rootScope.userId = res.data.user_id;
          $rootScope.hackcoin = res.data.hackcoin;
          $rootScope.sessionId = res.data.session_id;
          window.localStorage.sessionID = res.data.session_id;
          $scope.login = {
            username: '',
            password: ''
          };
          $('#login-modal').modal('toggle');
          $location.path('/');
        }
      });
    }
  };
});
