angular.module('indigoeln')
    .config(function ($stateProvider) {
        $stateProvider
            .state('entities.role-management', {
                url: '/role-management',
                data: {
                    authorities: ['ROLE_EDITOR'],
                    pageTitle: 'indigoeln',
                    tab: {
                        name: 'Roles',
                        kind: 'management',
                        state: 'entities.role-management',
                        type:'entity'
                    }
                },
                views: {
                    'tabContent': {
                        templateUrl: 'scripts/app/entities/role-management/role-management.html',
                        controller: 'RoleManagementController'
                    }
                },
                resolve: {
                    pageInfo: function($q, Role, AccountRole) {
                        var deferred = $q.defer();
                        $q.all([
                            Role.query().$promise,
                            AccountRole.query().$promise
                        ]).then(function(results){
                            deferred.resolve({
                                roles: results[0],
                                accountRoles: results[1]
                            });
                        });
                        return deferred.promise;
                    }
                }
            })
            .state('entities.role-management.delete', {
                parent: 'entities.role-management',
                url: '/role/{id}/delete',
                data: {
                    authorities: ['ROLE_EDITOR'],
                    tab: {
                        type:''
                    }
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'scripts/app/entities/role-management/role-management-delete-dialog.html',
                        controller: 'role-managementDeleteController',
                        size: 'md',
                        resolve: {
                            entity: ['Role', function (Role) {
                                return Role.get({id: $stateParams.id}).$promise;
                            }]
                        }
                    }).result.then(function () {
                            $state.go('entities.role-management', null, {reload: true});
                        }, function () {
                            $state.go('entities.role-management');
                        });
                }]
            });
    });