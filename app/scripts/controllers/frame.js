'use strict';

angular.module('frameworthyApp')
  .controller('FrameCtrl', function ($q, $scope, $routeParams, $upload, fileHash, s3, fbase) {

    $scope.frameID = $routeParams.id;
    $scope.appRef = new Firebase(fbase.appURL);

    $scope.onFileSelect = function($files) {
        for (var i = 0; i < $files.length; i++) {

            // Build upload data
            var file = $files[i],
                fileName = file.name.split('.'),
                fileExt = fileName[fileName.length - 1],
                formData = {
                    key: s3.key,
                    acl: s3.acl,
                    redirect: s3.redirect,
                    'Content-Type': file.type
                },
                // Get SHA256 of file data
                hashPromise = fileHash.sha256(file),
                // Grab latest AWS creds from firebase
                awsCredsPromise = fbase.getAWSCreds();

            $q.all([hashPromise, awsCredsPromise]).then(function(res) {
                // Unpack results.  No spread :(
                var hash = res[0],
                    awsCreds = res[1];
            
                // Add additional details to form data
                formData.AWSAccessKeyId = awsCreds.accessKey;
                formData.policy = awsCreds.policy;
                formData.signature = awsCreds.signature;
                formData.key += hash + '.' + fileExt;

                // Upload file to S3
                return $upload.upload({
                    url: s3.bucketURL,
                    file: file,
                    data: formData
                });

            }).then(function() {
                // Record file upload to Firebase
                var imageURL = s3.bucketURL + '/' + formData.key;
                $scope.frame.child('photos').push({caption: "", image: imageURL});
            }).catch(function(err) {
                console.log(err);
            });
        }
    };

    $scope.auth = new FirebaseSimpleLogin($scope.appRef, function(error, user) {
        if (!error && user) {
            // Add user to scope
            $scope.$apply(function() {
                $scope.user = user;

                // Add user details to Firebase
                $scope.userRef = $scope.appRef.child('users/' + user.uid);
                $scope.userRef.child('email').set(user.email);
                $scope.userRef.child('displayName').set(user.displayName || "None");
            });
        }
    });

    $scope.frame = $scope.appRef.child('frames/' + $scope.frameID);
    $scope.frame.child('description').once('value', function(snapshot) {
        $scope.$apply(function() {
            $scope.frameDescription = snapshot.val();
        });
    });

    // Flag for removing spinner from Galleria view
    var first = true;

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
                gallery.push({image: snapshot.val().image});
                // If this is the first image added from Firebase
                if (first) {
                    gallery.splice(0,1);
                    first = false;
                    window.setTimeout(function() {
                        gallery.show(0);
                        gallery.play(5000);
                    }, 10);
                }
            });
        }
    });
  });
