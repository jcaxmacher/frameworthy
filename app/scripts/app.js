'use strict';

angular.module('frameworthyApp', ['ngRoute', 'firebase', 'angularFileUpload'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/frame/:id', {
        templateUrl: 'views/frame.html',
        controller: 'FrameCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
