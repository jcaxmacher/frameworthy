'use strict';

/*
  Converts any integer into a base [BASE] number. I have chosen 36
  as it is meant to represent the integers using case-insensitive alphanumeric
  characters, [no special characters] = {0..9}, {A..Za..z}
 
  I plan on using this to shorten the representation of possibly long ids,
  a la url shortenters
 
  base36.saturate('5t6C9')  takes the base 36 key, as a string, and turns it back into an integer
  base36.dehydrate(9759321) takes an integer and turns it into the base 36 string
*/
var base36 = {
    BASE: 36,
    LOWERCASEOFFSET: 87,
    DIGITOFFSET: 48,
    trueOrd: function(char) {
        var ord = char.toLowerCase().charCodeAt(0);
        if (ord >= 48 && ord <= 57) {
            return ord - this.DIGITOFFSET;
        } else if (ord >= 97 && ord <= 122) {
            return ord - this.LOWERCASEOFFSET;
        } else {
            throw new Error(char + " is not a valid character");
        }
    },
    trueChr: function(integer) {
        if (integer < 10) {
            return String.fromCharCode(integer + this.DIGITOFFSET);
        } else if (integer >= 10 && integer <= 35) {
            return String.fromCharCode(integer + this.LOWERCASEOFFSET);
        } else {
            throw new Error(integer + " is not a valid integer in the range of base " + this.BASE);
        }
    },
    saturate: function(key) {
        var intSum = 0,
            reversedKey = key.split('').reverse().join(''),
            char = '';
        for (var i = 0; i < reversedKey.length; i++) {
            char = reversedKey[i];
            intSum += this.trueOrd(char) * parseInt(Math.pow(this.BASE, i));
        }
        return intSum;
    },
    dehydrate: function(integer) {
        var str = '',
            remainder = 0;
        if (integer == 0) {
            return '0';
        }
        while (integer > 0) {
            remainder = integer % this.BASE;
            str = this.trueChr(remainder) + str;
            integer = Math.floor(integer / this.BASE);
        }
        return str;
    }
};

angular.module('frameworthyApp')
  .controller('MainCtrl', function ($scope, $firebase) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.frameRef = new Firebase('https://frameworthy.firebaseio.com');
    $scope.counter = $scope.frameRef.child('counter');
    
    $scope.auth = new FirebaseSimpleLogin($scope.frameRef, function(error, user) {
        if (!error && user) {
            // Add user to scope
            $scope.$apply(function() {
                $scope.user = user;

                // Add user details to Firebase
                $scope.userRef = $scope.frameRef.child('users/' + user.uid);
                $scope.userRef.child('email').set(user.email);
                $scope.userRef.child('displayName').set(user.displayName || "None");
                $scope.userRef.child('admin').set(false);

                var ref = $scope.userRef.child('frames');
                $scope.frames = $firebase(ref);

                console.log($scope.frames);
            });
        }
    });

    $scope.createNewFrame = function() {
        $scope.counter.transaction(function(currentValue) {
            $scope.$apply(function() {
                // Transform incrementing id into base 36 ID
                $scope.currentID = base36.dehydrate(currentValue);

                // Claim ID and set user
                $scope.currentFrame = $scope.frameRef.child('frames/' + $scope.currentID);
                $scope.currentFrame.child('description').set($scope.newFrameName);
                $scope.currentFrame.child('user').set($scope.user.uid);

                // Add frame to list of frames
                $scope.userRef.child('frames')
                    .push({id: $scope.currentID, description: $scope.newFrameName});

                // Clear frame name
                $scope.newFrameName = "";
            });

            // Increment counter
            return currentValue + Math.floor((Math.random() * 100) + 1);
        });
    };

    $scope.logIn = function() {
        $scope.auth.login('facebook', {
            rememberMe: true,
            scope: 'email'
        });
    };

    $scope.process = function(element) {
        console.log(element.files);
    };
  });
