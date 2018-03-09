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
      usersService.register($scope.register.username, $scope.register.password, res => {
        if (res.status === 409) {
          console.log('registration error');
          $('#registration-error').show();
        } else {
          $scope.$emit('signupEvent', [$scope.register.username, $scope.register.password]);
          // $rootScope.userId = res.data.user_id;
          // $rootScope.hackcoin = res.data.hackcoin;
          // $rootScope.sessionId = res.data.session_id;
          // window.localStorage.userId = res.data.user_id;
          // window.localStorage.hackcoin = res.data.hackcoin;
          // window.localStorage.sessionID = res.data.session_id;
          $scope.register = {
            username: '',
            password: ''
          };
          $('#register-modal').modal('toggle');
          // $location.path('/');
        }
      });
    }
  };
});
