angular.module('indigoeln')
    .factory('SearchService', function($resource, apiUrl) {
        return $resource(apiUrl + 'search', {}, {
            getCatalogues: {
                url: apiUrl + 'search/catalogue', method: 'GET', isArray: true
            },
            search: {
                url: apiUrl + 'search/batch', method: 'POST', isArray: true
            },
            searchAll: {
                url: apiUrl + 'search', method: 'POST', isArray: true
            }
        });
    });
