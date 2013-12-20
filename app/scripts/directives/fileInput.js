'use strict';

angular.module('frameworthyApp')
  .directive('fileInput', function () {
    return {
      template: '<input type="file" />',
      restrict: 'E',
      replace: true,
      scope: {
        onChange: '&'
      },
      link: function postLink(scope, element, attrs) {
        element.bind('change', function() {
            scope.onChange({element: element[0]});
        });
      }
    };
  });
