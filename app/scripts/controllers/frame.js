'use strict';

angular.module('frameworthyApp')
  .controller('FrameCtrl', function ($scope, $routeParams, $firebase) {
    $scope.frameID = $routeParams.id;
    $scope.frame = new Firebase('https://frameworthy.firebaseio.com/frames/' + $scope.frameID);
    $scope.frame.child('description').once('value', function(snapshot) {
        $scope.$apply(function() {
            $scope.frameDescription = snapshot.val();
        });
    });
        
    $scope.photos = $firebase($scope.frame.child('photos'));

  });
