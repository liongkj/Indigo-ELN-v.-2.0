/**
 * Created by Stepan_Litvinov on 2/8/2016.
 */
angular.module('indigoeln')
    .directive('conceptDetails', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'scripts/components/entities/template/components/conceptDetails/conceptDetails.html',
            controller: function ($scope, Principal, Dictionary, LinkedExperimentUtils) {
                $scope.model.conceptDetails = $scope.model.conceptDetails || {};
                $scope.model.reactionDetails = $scope.model.reactionDetails || {};
                $scope.model.conceptDetails.experimentCreator = $scope.model.conceptDetails.experimentCreator ||
                    {name: Principal.getIdentity().fullName};
                $scope.onLinkedExperimentClick = LinkedExperimentUtils.onLinkedExperimentClick;
                Dictionary.get({id: 'users'}, function (dictionary) {
                    $scope.users = dictionary.words;
                    $scope.model.conceptDetails.coAuthors = $scope.model.reactionDetails.coAuthors ||
                        _.where($scope.users, {name: Principal.getIdentity().fullName});
                });
            }
        };
    });