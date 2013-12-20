'use strict';

angular.module('frameworthyApp')
  .controller('FrameCtrl', function ($scope, $routeParams, $firebase, fileReader) {

    $scope.appRef = new Firebase('https://frameworthy.firebaseio.com');

    $scope.auth = new FirebaseSimpleLogin($scope.appRef, function(error, user) {
        if (!error && user) {
            // Add user to scope
            $scope.$apply(function() {
                $scope.user = user;

                // Add user details to Firebase
                $scope.userRef = $scope.appRef.child('users/' + user.uid);
                $scope.userRef.child('email').set(user.email);
                $scope.userRef.child('displayName').set(user.displayName || "None");

                var ref = $scope.userRef.child('frames');
                $scope.frames = $firebase(ref);

            });
        }
    });

    $scope.frameID = $routeParams.id;
    $scope.frame = $scope.appRef.child('frames/' + $scope.frameID);
    $scope.frame.child('description').once('value', function(snapshot) {
        $scope.$apply(function() {
            $scope.frameDescription = snapshot.val();
        });
    });

    // $scope.photos = $firebase($scope.frame.child('photos'));

    $scope.first = true;

    // Begin evil dom manipulation and jQuery plugin use in controller
    Galleria.loadTheme('bower_components/jquery-galleria/src/themes/classic/galleria.classic.js');
    Galleria.ready(function() {
        console.log('entering fullscreen');
        this.enterFullscreen();
    });
    Galleria.run('#gallery', {
        debug: true,
        extend: function() {
            var gallery = this;
            // Add each photo in the frame to the gallery view
            $scope.frame.child('photos').on('child_added', function(snapshot) {
                gallery.push({image: snapshot.val().data});
                // If this is the first image added from Firebase
                if ($scope.first) {
                    gallery.splice(0,1);
                    $scope.first = false;
                    window.setTimeout(function() {
                        gallery.show(0);
                        gallery.play(5000);
                    }, 10);
                }
            });
        }
    });

    $scope.process = function(element) {
        fileReader.readAsDataUrl(element.files[0], $scope).then(function(result) {
            $scope.photos.$add({caption: "", data: result});
        });
    };

  });
