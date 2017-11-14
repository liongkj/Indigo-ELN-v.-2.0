var template = require('./indigo-entities-controls.html');

function indigoEntitiesControls() {
    return {
        restrict: 'E',
        template: template,
        controller: IndigoEntitiesControlsController,
        bindToController: true,
        controllerAs: 'vm',
        scope: {
            activeTab: '=',
            onCloseTab: '&',
            onCloseAllTabs: '&',
            onCloseNonActiveTabs: '&',
            onSave: '&'
        }
    };
}

IndigoEntitiesControlsController.$inject = ['$state', 'entitiesBrowser', 'modalHelper', 'projectsForSubCreation',
    'appRoles'];

function IndigoEntitiesControlsController($state, entitiesBrowser, modalHelper, projectsForSubCreation, appRoles) {
    var vm = this;

    $onInit();

    function $onInit() {
        vm.CONTENT_EDITOR = appRoles.CONTENT_EDITOR;
        vm.PROJECT_CREATOR = appRoles.PROJECT_CREATOR;
        vm.NOTEBOOK_CREATOR = appRoles.NOTEBOOK_CREATOR;
        vm.EXPERIMENT_CREATOR = appRoles.EXPERIMENT_CREATOR;
        vm.GLOBAL_SEARCH = appRoles.GLOBAL_SEARCH;
        vm.PROJECT_CREATORS = [vm.CONTENT_EDITOR, vm.PROJECT_CREATOR].join(',');
        vm.NOTEBOOK_CREATORS = [vm.CONTENT_EDITOR, vm.NOTEBOOK_CREATOR].join(',');
        vm.EXPERIMENT_CREATORS = [vm.CONTENT_EDITOR, vm.EXPERIMENT_CREATOR].join(',');
        vm.ENTITY_CREATORS = [vm.CONTENT_EDITOR, vm.PROJECT_CREATOR, vm.NOTEBOOK_CREATOR, vm.EXPERIMENT_CREATOR]
            .join(',');
        vm.isDashboard = false;

        vm.onTabClick = onTabClick;
        vm.openSearch = openSearch;
        vm.canPrint = canPrint;
        vm.print = print;
        vm.canDuplicate = canDuplicate;
        vm.duplicate = duplicate;
        vm.onCloseTabClick = onCloseTabClick;
        vm.createExperiment = createExperiment;
        vm.createNotebook = createNotebook;

        entitiesBrowser.getTabs(function(tabs) {
            vm.entities = tabs;
        });
    }

    function onTabClick(tab) {
        entitiesBrowser.goToTab(tab);
    }

    function openSearch() {
        $state.go('entities.search-panel');
    }

    function canPrint() {
        var actions = entitiesBrowser.getEntityActions();

        return actions && actions.print;
    }

    function print() {
        entitiesBrowser.getEntityActions().print();
    }

    function canDuplicate() {
        var actions = entitiesBrowser.getEntityActions();

        return actions && actions.duplicate;
    }

    function duplicate() {
        entitiesBrowser.getEntityActions().duplicate();
    }

    function onCloseTabClick($event, tab) {
        vm.onCloseTab({
            $event: $event, tab: tab
        });
    }

    function createExperiment() {
        var resolve = {
            fullNotebookId: function() {
                return null;
            }
        };

        modalHelper.openCreateNewExperimentModal(resolve).then(function(result) {
            $state.go('entities.experiment-detail', {
                notebookId: result.notebookId,
                projectId: result.projectId,
                experimentId: result.id
            });
        });
    }

    function createNotebook() {
        var resolve = {
            parents: function() {
                return projectsForSubCreation.query().$promise;
            }
        };
        modalHelper.openCreateNewNotebookModal(resolve).then(function(projectId) {
            $state.go('entities.notebook-new', {
                parentId: projectId
            });
        });
    }
}

module.exports = indigoEntitiesControls;