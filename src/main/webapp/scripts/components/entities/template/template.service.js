'use strict';

angular.module('indigoeln')
    .factory('Template', function ($resource, DateUtils) {
        return $resource('api/templates/:id', {}, {
            'query': {method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'update': {method: 'PUT'}
        });
    });