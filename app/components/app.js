angular.module('app')
.controller('AppCtrl', function (postsService, $rootScope) {
  $rootScope.userId = 0;
  $rootScope.hackcoin = 0;
  $rootScope.sessionId = window.localStorage.sessionID;
})
.component('app', {
  bindings: {},
  controller: 'AppCtrl',
  templateUrl: '/templates/app.html'
})
.config(function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: '/templates/main.html',
      controller: 'MainCtrl'
    })
    .when('/submit', {
      templateUrl: '/templates/submit.html',
      controller: 'SubmitCtrl'
    })
    .otherwise({ redirectTo: '/' });
  $locationProvider.html5Mode(true);
});
