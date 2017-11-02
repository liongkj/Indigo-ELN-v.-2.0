angular
    .module('indigoeln.Components')
    .controller('EditResidualSolventsController', EditResidualSolventsController);

/* @ngInject */
function EditResidualSolventsController($uibModalInstance, solvents) {
    var vm = this;

    init();

    function init() {
        vm.solvents = solvents;
        vm.save = save;
        vm.cancel = cancel;
        vm.addSolvent = addSolvent;
        vm.remove = remove;
        vm.removeAll = removeAll;
    }

    function addSolvent() {
        vm.solvents.push({
            name: '', eq: '', comment: ''
        });
    }

    function remove(solvent) {
        vm.solvents = _.without(vm.solvents, solvent);
    }

    function removeAll() {
        vm.solvents = [];
    }

    function resultToString() {
        var solventStrings = _.map(vm.solvents, function(solvent) {
            if (solvent.name && solvent.eq) {
                return solvent.eq + ' mols of ' + solvent.name.name;
            }

            return '';
        });

        return _.compact(solventStrings).join(', ');
    }

    function save() {
        $uibModalInstance.close({
            data: vm.solvents,
            asString: resultToString()
        });
    }

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    }
}