AnalyzeRxnController.$inject = ['$uibModalInstance', 'reactants', 'searchService',
    'appValuesService', 'onStoichRowsChanged', 'stoichColumnActions', '$q'];

function AnalyzeRxnController($uibModalInstance, reactants, searchService, appValuesService, onStoichRowsChanged,
                              stoichColumnActions, $q) {
    var vm = this;
    vm.addToStoichTable = addToStoichTable;
    vm.updateStoicAndExit = updateStoicAndExit;
    vm.search = search;
    vm.cancel = cancel;

    $onInit();

    function $onInit() {
        vm.model = getDefaultModel();
        vm.tabs = buildTabs();
        vm.selectedReactants = [];

        vm.onSelected = onSelected;
    }

    function onSelected(tab, item) {
        tab.selectedReactant = item;

        vm.selectedReactants = buildReactantsFromSelected();
    }

    function buildTabs() {
        return _.map(reactants, function(reactant, id) {
            return {
                formula: reactant.formula,
                searchResult: [],
                selectedReactant: null,
                id: id
            };
        });
    }

    function addToStoichTable() {
        onStoichRowsChanged(vm.selectedReactants);
    }

    function buildReactantsFromSelected() {
        return _.map(_.filter(vm.tabs, 'selectedReactant'), function(tab) {
            return stoichColumnActions.cleanReactant(_.extend(angular.copy(reactants[tab.id]), tab.selectedReactant));
        });
    }

    function updateStoicAndExit() {
        onStoichRowsChanged(buildReactantsFromSelected());
        $uibModalInstance.close({});
    }

    function search() {
        vm.loading = true;
        $q.all(_.map(vm.tabs, function(tab) {
            return getSearchResult(tab.formula)
                .then(function(searchResult) {
                    tab.searchResult = responseCallback(searchResult);
                });
        })).finally(function() {
            vm.loading = false;
            vm.isSearchCompleted = true;
        });
    }

    function cancel() {
        $uibModalInstance.close({});
    }

    function getDefaultModel() {
        return {
            reactants: reactants,
            selectedReactants: [],
            isSearchResultFound: false,
            databases: searchService.getCatalogues()
        };
    }

    function prepareDatabases() {
        return _.map(_.filter(vm.model.databases, {
            isChecked: true
        }), 'value');
    }

    function responseCallback(result) {
        var databases = prepareDatabases();

        return _.map(result, function(item) {
            var batchDetails = _.extend({}, item.details);
            batchDetails.$$isCollapsed = true;
            batchDetails.$$isSelected = false;
            batchDetails.nbkBatch = item.notebookBatchNumber;
            batchDetails.database = databases.join(', ');
            batchDetails.rxnRole = batchDetails.rxnRole || appValuesService.getRxnRoleReactant();
            batchDetails.saltCode = batchDetails.saltCode || appValuesService.getDefaultSaltCode();

            return batchDetails;
        });
    }

    function getSearchResult(formula) {
        var databases = prepareDatabases();
        var searchRequest = {
            databases: databases,
            structure: {
                formula: formula, searchMode: 'molformula'
            }
        };

        return searchService.search(searchRequest).$promise;
    }
}

module.exports = AnalyzeRxnController;
