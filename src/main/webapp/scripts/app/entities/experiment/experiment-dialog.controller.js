'use strict';

angular.module('indigoeln').controller('ExperimentDialogController',
    function ($scope, $stateParams, entity, Experiment, templates, mode, $state) {

        $scope.experiment = entity;
        $scope.notebookId = $stateParams.notebookId;
        $scope.templates = templates;
        $scope.mode = mode;
        $scope.template = _.find($scope.templates, function (template) {
            return template.id == $scope.experiment.templateId;
        });
        var onSaveSuccess = function (result) {
            $scope.isSaving = false;
            $state.go('experiment.detail', {notebookId: $stateParams.notebookId, id: result.id});
        };

        var onSaveError = function (result) {
            $scope.isSaving = false;
        };

        $scope.save = function () {
            $scope.isSaving = true;
            $scope.experiment = _.extend($scope.experiment, {templateId: $scope.template.id})
            if ($scope.experiment.id != null) {
                Experiment.update({
                    notebookId: $stateParams.notebookId,
                    id: $scope.experiment.id
                }, $scope.experiment, onSaveSuccess, onSaveError);
            } else {
                Experiment.save({notebookId: $stateParams.notebookId}, $scope.experiment, onSaveSuccess, onSaveError);
            }
        };

    });
