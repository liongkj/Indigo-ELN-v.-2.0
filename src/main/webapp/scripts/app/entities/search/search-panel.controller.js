angular.module('indigoeln')
    .controller('SearchPanelController', function ($rootScope, $scope, $sce, $filter, SearchService, SearchUtilService, pageInfo) {

        var OWN_ENTITY = 'OWN_ENTITY';
        var USERS_ENTITIES = 'USERS_ENTITIES';


        $scope.model = {};
        $scope.identity = pageInfo.identity;
        $scope.users = _.map(pageInfo.users.words, function (item) {
            return {name: item.name, id: item.id};
        });


        $scope.model.restrictions = {
            searchQuery: '',
            advancedSearch: {
                therapeuticArea: {name: 'Therapeutic Area', field: 'therapeuticArea', condition: {name: 'contains'}, $$conditionList : [
                    {name: 'contains'}, {name: 'starts with'}, {name: 'ends with'}, {name: 'between'}
                ]},
                projectCode: {name: 'Project Code', field: 'projectCode', condition: {name: 'contains'}, $$conditionList : [
                    {name: 'contains'}, {name: 'starts with'}, {name: 'ends with'}, {name: 'between'}
                ]},
                batchYield: {name: 'Batch Yield%', field: 'batchYield', condition: {name: '>'}, $$conditionList : [
                    {name: 'contains'}, {name: 'starts with'}, {name: 'ends with'}, {name: 'between'}
                ]},
                batchPurity: {name: 'Batch Purity%', field: 'purity', condition: {name: '>'}, $$conditionList : [
                    {name: 'contains'}, {name: 'starts with'}, {name: 'ends with'}, {name: 'between'}
                ]},
                subject: {name: 'Subject/Title', field: 'name', condition: {name: 'contains'}, $$conditionList : [
                    {name: 'contains'}, {name: 'starts with'}, {name: 'ends with'}, {name: 'between'}
                ]},
                entityDescription: {name: 'Entity Description', field: 'description', condition: {name: 'contains'}, $$conditionList : [
                    {name: 'contains'}, {name: 'starts with'}, {name: 'ends with'}, {name: 'between'}
                ]},
                compoundId: {name: 'Compound ID', field: 'compoundId', condition: {name: 'contains'}, $$conditionList : [
                    {name: 'contains'}, {name: 'starts with'}, {name: 'ends with'}, {name: 'between'}
                ]},
                literatureRef: {name: 'Literature Ref', field: 'references', condition: {name: 'contains'}, $$conditionList : [
                    {name: 'contains'}, {name: 'starts with'}, {name: 'ends with'}, {name: 'between'}
                ]},
                entityKeywords: {name: 'Entity Keywords', field: 'keywords', condition: {name: 'contains'}, $$conditionList : [
                    {name: 'contains'}, {name: 'starts with'}, {name: 'ends with'}, {name: 'between'}
                ]},
                chemicalName: {name: 'Chemical Name', field: 'chemicalName', condition: {name: 'contains'}, $$conditionList : [
                    {name: 'contains'}, {name: 'starts with'}, {name: 'ends with'}, {name: 'between'}
                ]},
                entityTypeCriteria: {
                    name: 'Entity Type Criteria',
                    $$skipList: true,
                    field: 'kind',
                    condition: {name: 'in'},
                    value: []
                },

                entityDomain: {
                    name: 'Entity Searching Domain',
                    $$skipList: true,
                    field: 'author._id',
                    condition: {name: 'in'},
                    value: []
                },

                statusCriteria: {name: 'Status', $$skipList: true, field: 'status', condition: {name: 'in'}, value: []}


            },
            users : [],
            entityType: 'Project',
            structure: {
                name: 'Reaction Scheme',
                similarityCriteria: {name: 'equal'},
                similarityValue: null,
                image: null,
                type: {name: 'Product'}
            }
        };


        $scope.structureTypes = [{name:'Reaction'},{name:'Product'}];
        $scope.conditionSimilarity = [{name: 'equal'}, {name: 'substructure'}, {name: 'similarity'}];

        $scope.isAdvancedSearchFilled = function () {
            return SearchUtilService.isAdvancedSearchFilled($scope.model.restrictions.advancedSearch);
        };

        $scope.changeDomain = function () {
            $scope.model.restrictions.advancedSearch.entityDomain.value = [];
            if($scope.domainModel === OWN_ENTITY){
                $scope.model.restrictions.advancedSearch.entityDomain.value.push($scope.identity.id);
            }else if($scope.domainModel === USERS_ENTITIES){
                $scope.model.restrictions.advancedSearch.entityDomain.value = _.map($scope.selectedUsers, function(user){
                    return user.id;
                });
            }
        };

        $scope.selectedUsersChange = function () {
            if($scope.domainModel === USERS_ENTITIES){
                $scope.model.restrictions.advancedSearch.entityDomain.value = _.map($scope.selectedUsers, function(user){
                    return user.id;
                });
            }
        };

        $scope.selectedItemsFlags = {};

        $scope.selectItem = function (item) {
            if ($scope.selectedItemsFlags[item]) {
                $scope.model.restrictions.advancedSearch.statusCriteria.value.push(item)
            } else {
                var index = _.indexOf($scope.model.restrictions.advancedSearch.statusCriteria.value, item);
                if(index!= -1){
                    $scope.model.restrictions.advancedSearch.statusCriteria.value.splice(index, 1);
                }
            }
        };

        $scope.selectedEntitiesFlags = {};

        $scope.selectEntity = function (item) {
            if ($scope.selectedEntitiesFlags[item]) {
                $scope.model.restrictions.advancedSearch.entityTypeCriteria.value.push(item)
            } else {
                var index = _.indexOf($scope.model.restrictions.advancedSearch.entityTypeCriteria.value, item);
                if(index!= -1){
                    $scope.model.restrictions.advancedSearch.entityTypeCriteria.value.splice(index, 1);
                }
            }
        };



        $scope.columns = [
            {
                id: 'kind',
                name: 'Entity Type'
            },
            {
                id: 'name',
                name: 'Entity Name/Id'
            },
            {
                id: 'details',
                name: 'Details',
                type: 'html',
                format: function (val) {
                    var result = [];
                    if (val.creationDate) {
                        result.push('Creation date: ' + $filter('date')(val.creationDate, 'MMM DD, YYYY HH:mm:ss z'));
                    }
                    if (val.author) {
                        result.push('Owner: ' + val.author);
                    }
                    if (val.title) {
                        result.push('Subject\\Title: ' + val.title);
                    }
                    return $sce.trustAsHtml(result.join('<br/>'));
                }
            },
            {
                id: 'actions',
                name: 'Actions'
            }

        ];


        $scope.search = function () {
            var searchRequest = SearchUtilService.prepareSearchRequest($scope.model.restrictions);
            SearchService.searchAll(searchRequest, function (result) {
                $scope.searchResults = result;
            });
        };

    });