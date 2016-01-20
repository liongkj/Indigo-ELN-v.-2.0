'use strict';

angular.module('indigoeln', ['ui.router', 'ngResource', 'ui.tree', 'ui.bootstrap', 'ngAnimate', 'ngRoute'])
    .run(function ($rootScope, $location, $window, $http, $state, Auth, Principal) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
            $rootScope.toState = toState;
            $rootScope.toStateParams = toStateParams;

            if (Principal.isIdentityResolved()) {
                Auth.authorize();
            }

        });
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            var titleKey = 'indigoeln';

            // Remember previous state unless we've been redirected to login or we've just
            // reset the state memory after logout. If we're redirected to login, our
            // previousState is already set in the authExpiredInterceptor. If we're going
            // to login directly, we don't want to be sent to some previous state anyway
            if (toState.name != 'login' && $rootScope.previousStateName) {
                $rootScope.previousStateName = fromState.name;
                $rootScope.previousStateParams = fromParams;
            }

            // Set the page title key to the one configured in state or use default one
            if (toState.data.pageTitle) {
                titleKey = toState.data.pageTitle;
            }
            $window.document.title = titleKey;
        });
        $rootScope.back = function () {
            // If previous state is 'activate' or do not exist go to 'home'
            if ($rootScope.previousStateName === 'activate' || $state.get($rootScope.previousStateName) === null) {
                $state.go('home');
            } else {
                $state.go($rootScope.previousStateName, $rootScope.previousStateParams);
            }
        };
    })
    .config(function ($stateProvider, $urlRouterProvider, $provide, $httpProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('navbar', {
            'abstract': true,
            views: {
                'navbar@': {
                    templateUrl: 'scripts/components/navbar/navbar.html',
                    controller: 'NavbarController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                authorize: ['Auth',
                    function (Auth) {
                        return Auth.authorize();
                    }
                ]
            }
        }).state('sidebar', {
            'abstract': true,
            parent: 'navbar',
            views: {
                'sidebar@': {
                    templateUrl: 'scripts/components/sidebar/sidebar.html',
                    controller: 'SidebarController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                //getAuth: ['authService',
                //    function (authService) {
                //        return authService.getAuth();
                //    }
                //]
            }
        });
        $httpProvider.interceptors.push('errorHandlerInterceptor');
        $httpProvider.interceptors.push('notificationInterceptor');

    });
        
