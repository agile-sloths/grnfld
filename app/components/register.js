angular.module('app')
.controller('RegisterCtrl', function ($scope, usersService, $rootScope, $location) {
  $('.alert .close').on('click', function (e) {
    $(this).parent().hide();
  });

  $scope.register = {
    username: '',
    password: ''
  };

  $scope.submit = function (isValid) {
    if (isValid) {
      usersService.register($scope.register.username, $scope.register.password, $scope.register.location, $scope.register.languages, $scope.register.github_handle, res => {
        if (res.status === 409) {
          console.log('registration error');
          $('#registration-error').show();
        } else {
          $rootScope.userId = res.data.user_id;
          $rootScope.hackcoin = res.data.hackcoin;
          $rootScope.sessionId = res.data.session_id;
          window.localStorage.sessionID = res.data.session_id;
          $scope.register = {
            username: '',
            password: ''
          };
          $('#register-modal').modal('toggle');
          $location.path('/');
        }
      });
    }
  };
});
