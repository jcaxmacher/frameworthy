'use strict';

angular.module('frameworthyApp')
  .factory('fileHash', function($q, $log) {
      return {
          sha256: function(file) {
              var deferred = $q.defer(),
                  reader = new FileReader();
              reader.onload = (function(e) {
                  var filePayload = e.target.result,
                      hash = CryptoJS.SHA256(filePayload).toString(CryptoJS.enc.Base64);
                  $log.info(hash);
                  deferred.resolve(hash);
              });
              reader.readAsDataURL(file);
              return deferred.promise;
          }
      };
  }); 
