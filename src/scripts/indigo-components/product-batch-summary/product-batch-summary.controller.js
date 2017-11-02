(function() {
    angular
        .module('indigoeln.Components')
        .controller('ProductBatchSummaryController', ProductBatchSummaryController);

    /* @ngInject */
    function ProductBatchSummaryController() {
        var vm = this;

        vm.structureSize = 0.3;

        vm.showStructure = showStructure;

        function showStructure(value) {
            vm.isStructure = value;
        }
    }
})();