'use strict';

angular.module('indigoeln')
    .directive('sResizable', function () {
        return {
            restrict: 'A',
            scope: {
                maxHeight: '=',
                minHeight: '='
            },
            link: function postLink(scope, elem, attrs) {
                elem.resizable({
                    handles: 's',
                    maxHeight: scope.maxHeight,
                    minHeight: scope.minHeight
                });
            }
        };
    });