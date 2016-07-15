angular.module('indigoeln')
    .config(function ($stateProvider, PermissionManagementConfig) {
        $stateProvider
            .state('notebook', {
                abstract: true,
                parent: 'entity'
            })
            .state('notebook.new', {
                parent: 'notebook',
                url: '/project/{projectId}/notebook/new',
                views: {
                    'content@app_page': {
                        templateUrl: 'scripts/app/entities/notebook/notebook-dialog.html',
                        controller: 'NotebookDialogController'
                    }
                },
                data: {
                    authorities: ['CONTENT_EDITOR', 'NOTEBOOK_CREATOR'],
                    pageTitle: 'indigoeln'
                },
                resolve: {
                    pageInfo: function ($q, $stateParams, Principal) {
                        var deferred = $q.defer();
                        $q.all([
                            Principal.identity(),
                            Principal.hasAuthorityIdentitySafe('CONTENT_EDITOR'),
                            Principal.hasAuthorityIdentitySafe('NOTEBOOK_CREATOR'),
                            Principal.hasAuthorityIdentitySafe('EXPERIMENT_CREATOR')
                        ]).then(function(results){
                            deferred.resolve({
                                notebook: {},
                                identity: results[0],
                                isContentEditor: results[1],
                                hasEditAuthority: results[2],
                                hasCreateChildAuthority: results[3],
                                projectId: $stateParams.projectId
                            });
                        });
                        return deferred.promise;
                    }
                }
            }).state('entities.notebook-detail', {
                url: '/project/{projectId}/notebook/{notebookId}',
                views: {
                    'tabContent': {
                        templateUrl: 'scripts/app/entities/notebook/notebook-dialog.html',
                        controller: 'NotebookDialogController'
                    }
                },
                data: {
                    authorities: ['CONTENT_EDITOR', 'NOTEBOOK_READER', 'NOTEBOOK_CREATOR'],
                    pageTitle: 'indigoeln'
                },
                resolve: {
                    pageInfo: function($q, $stateParams, EntitiesBrowser, Principal) {
                        var deferred = $q.defer();
                        $q.all([
                            EntitiesBrowser.getCurrentEntity($stateParams),
                            Principal.identity(),
                            Principal.hasAuthorityIdentitySafe('CONTENT_EDITOR'),
                            Principal.hasAuthorityIdentitySafe('NOTEBOOK_CREATOR'),
                            Principal.hasAuthorityIdentitySafe('EXPERIMENT_CREATOR')
                        ]).then(function(results){
                            deferred.resolve({
                                notebook: results[0],
                                identity: results[1],
                                isContentEditor: results[2],
                                hasEditAuthority: results[3],
                                hasCreateChildAuthority: results[4],
                                projectId: $stateParams.projectId
                            });
                        });
                        return deferred.promise;
                    }
                }
            })
            .state('notebook.new.permissions', _.extend({}, PermissionManagementConfig, {
                parent: 'notebook.new',
                data: {
                    authorities: ['CONTENT_EDITOR', 'NOTEBOOK_CREATOR']
                },
                permissions: [
                    {id: 'VIEWER', name: 'VIEWER (read notebook)'},
                    {id: 'USER', name: 'USER (read notebook, create experiments)'},
                    {id: 'OWNER', name: 'OWNER (read/update notebook, create experiments)'}
                ]
            }))
            .state('entities.notebook-detail.permissions', _.extend({}, PermissionManagementConfig, {
                parent: 'entities.notebook-detail',
                data: {
                    authorities: ['CONTENT_EDITOR', 'NOTEBOOK_CREATOR']
                },
                permissions: [
                    {id: 'VIEWER', name: 'VIEWER (read notebook)'},
                    {id: 'USER', name: 'USER (read notebook, create experiments)'},
                    {id: 'OWNER', name: 'OWNER (read/update notebook, create experiments)'}
                ]
            }))
            .state('notebook.select-project', {
                parent: 'notebook',
                url: 'notebook/select-project',
                data: {
                    authorities: ['CONTENT_EDITOR', 'NOTEBOOK_CREATOR'],
                    pageTitle: 'indigoeln'
                },
                onEnter: function($state, $uibModal, $window) {
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'scripts/app/entities/notebook/notebook-select-parent.html',
                        controller: 'NotebookSelectParentController',
                        size: 'lg',
                        resolve: {
                            parents: function (ProjectsForSubCreation) {
                                return ProjectsForSubCreation.query().$promise;
                            }
                        }
                    }).result.then(function (projectId) {
                        $state.go('notebook.new', {projectId: projectId});
                    }, function() {
                        $window.history.back();
                    });
                }
            });
    });