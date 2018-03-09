angular.module('app')
.controller('LoginCtrl', function($scope, usersService, $rootScope, $location) {
  $('.alert .close').on('click', function (e) {
    $(this).parent().hide();
  });

  $scope.login = {
    username: '',
    password: ''
  };

  $scope.$on('registerEvent', function() {
    let registerInfo = Array.from(arguments)[1].loginInfo;
    $scope.login = {
      username: registerInfo[0],
      password: registerInfo[1]
    }
    $scope.submit(true, 'flag');
  });

  $scope.submit = function(isValid, flag) {
    if (isValid) {
      usersService.login($scope.login.username, $scope.login.password, res => {
        if (res.status === 401) {
          $('#login-error').show();
        } else {
          $rootScope.userId = res.data.user_id;
          $rootScope.hackcoin = res.data.hackcoin;
          $rootScope.sessionId = res.data.session_id;
          window.localStorage.userId = res.data.user_id;
          window.localStorage.hackcoin = res.data.hackcoin;
          window.localStorage.sessionID = res.data.session_id;
          $scope.login = {
            username: '',
            password: ''
          };
          if (!flag) {
            $('#login-modal').modal('toggle');
          }
          $location.path('/');
        }
      });
    }
  };
});
