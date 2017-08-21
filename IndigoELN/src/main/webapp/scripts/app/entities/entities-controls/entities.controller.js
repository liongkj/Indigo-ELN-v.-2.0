(function() {
    angular
        .module('indigoeln')
        .controller('EntitiesController', EntitiesController);

    function EntitiesController($scope, EntitiesBrowser, $q, Principal, EntitiesCache, AlertModal, notifyService,
                                dialogService, autorecoveryCache) {
        var vm = this;

        init();

        function init() {
            vm.onTabClick = onTabClick;
            vm.onCloseTabClick = onCloseTabClick;
            vm.onCloseAllTabs = onCloseAllTabs;
            vm.saveEntity = saveEntity;

            bindEvents();
            Principal.identity().then(function(user) {
                EntitiesBrowser.restoreTabs(user);
                EntitiesBrowser.getTabs(function(tabs) {
                    vm.tabs = tabs;
                    vm.activeTab = EntitiesBrowser.getActiveTab();
                });
            });
        }

        function closeTab(tab) {
            EntitiesBrowser.close(tab.tabKey);
            EntitiesCache.removeByKey(tab.tabKey);
            autorecoveryCache.remove(tab.params);
        }

        function saveEntity(tab) {
            var defer = $q.defer();
            $scope.$broadcast('ON_ENTITY_SAVE', {
                tab: tab,
                defer: defer
            });

            return defer.promise;
        }

        function onTabChanged(tab) {
            if (!EntitiesBrowser.getUpdateCurrentEntityFunc()) {
                return;
            }

            if (tab.dirty) {
                AlertModal.alert('Warning', tab.name + ' ' + tab.$$title +
                    ' has been changed by another user while you have not applied changes. ' +
                    'You can Accept or Reject saved changes. ' +
                    '"Accept" button reloads page to show saved data,' +
                    ' "Reject" button leave entered data and allows you to save them.',
                    null,
                    function() {
                        EntitiesBrowser.callUpdateCurrentEntity();
                    },
                    function() {
                        EntitiesBrowser.callUpdateCurrentEntity(true);
                    }, 'Accept', true, 'Reject'
                );

                return;
            }
            notifyService.info(tab.name + ' ' + tab.$$title + ' has been changed by another user and reloaded');
            EntitiesBrowser.callUpdateCurrentEntity();
        }

        function openCloseDialog(editTabs) {
            return dialogService.selectEntitiesToSave(editTabs, function(tabsToSave) {
                return $q.all(_.map(tabsToSave, function(tabToSave) {
                    return saveEntity(tabToSave).then(function() {
                        closeTab(tabToSave);
                    });
                }));
            });
        }

        function onCloseAllTabs(exceptCurrent) {
            var tabs = !exceptCurrent ? vm.tabs : _.filter(vm.tabs, function(tab) {
                return tab !== vm.activeTab;
            });
            var editTabs = _.filter(tabs, function(tab) {
                return tab.dirty && (exceptCurrent ? tab !== vm.activeTab : true);
            });

            $q.when(editTabs.length ? openCloseDialog(editTabs) : null)
                .then(function() {
                    _.each(tabs, closeTab);
                });
        }

        function onCloseTabClick($event, tab) {
            $event.stopPropagation();
            if (tab.dirty) {
                AlertModal.save('Do you want to save the changes?', null, function(isSave) {
                    if (isSave) {
                        saveEntity(tab).then(function() {
                            closeTab(tab);
                        });
                    } else {
                        closeTab(tab);
                    }
                });

                return;
            }

            closeTab(tab);
        }

        function onTabClick($event, tab) {
            $event.stopPropagation();
            EntitiesBrowser.goToTab(tab);
        }

        function bindEvents() {
            $scope.$watch(function() {
                return EntitiesBrowser.getActiveTab();
            }, function(value) {
                vm.activeTab = value;
            });

            $scope.$on('entity-updated', function(event, data) {
                Principal.identity(true).then(function(user) {
                    EntitiesBrowser.getTabByParams(data.entity).then(function(tab) {
                        if (tab && user.id !== data.user) {
                            onTabChanged(tab);
                        }
                    });
                });
            });
        }
    }
})();