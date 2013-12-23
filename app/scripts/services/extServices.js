'use strict';

angular.module('frameworthyApp')
  .factory('s3', function() {
      return {
          bucketURL: 'https://frameworthy.s3.amazonaws.com',
          acl: 'public-read',
          redirect: 'http://frameworthy.s3.amazonaws.com/success.html',
          key: 'uploads/'
      };
  })
  .factory('fbase', function($q) {
      return {
          appURL: 'https://frameworthy.firebaseio.com',
          getAWSCreds: function() {
              var appRef = new Firebase(this.appURL),
                  deferred = $q.defer();
              appRef.child('aws').once('value', function(snapshot) {
                  deferred.resolve(snapshot.val());
              });
              return deferred.promise;
          }
      };
  });

