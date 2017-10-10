(function() {
    angular
        .module('indigoeln.componentButtons')
        .directive('addNewBatch', addNewBatchDirective);

    /* @ngInject */
    function addNewBatchDirective() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                batchOperation: '=',
                isReadonly: '=',
                onAddedBatch: '&',
                onSelectBatch: '&'
            },
            templateUrl: 'scripts/app/common/directives/component-buttons/add-new-batch/add-new-batch.html',
            controller: addNewBatchController,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    addNewBatchController.$inject = ['ProductBatchSummaryOperations'];

    function addNewBatchController(ProductBatchSummaryOperations) {
        var vm = this;

        init();

        function init() {
            vm.addNewBatch = addNewBatch;
        }

        function addNewBatch() {
            vm.batchOperation = ProductBatchSummaryOperations.addNewBatch().then(successAddedBatch);
        }

        function successAddedBatch(batch) {
            vm.onAddedBatch({batch: batch});
            vm.onSelectBatch({batch: batch});
        }
    }
})();