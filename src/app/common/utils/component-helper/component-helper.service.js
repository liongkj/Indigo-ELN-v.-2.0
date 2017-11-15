/* @ngInject */
function commonHelperService(dictionaryService) {
    var loadExperimentsPromise;
    var experimentsPromise;

    return {
        getExperiments: getExperiments
    };

    function loadExperiments() {
        if (loadExperimentsPromise) {
            return loadExperimentsPromise;
        }

        loadExperimentsPromise = dictionaryService
            .get({id: 'experiments'})
            .$promise.then(function(dictionary) {
                return dictionary.words;
            });

        return loadExperimentsPromise;
    }

    function getExperiments() {
        if (experimentsPromise) {
            return experimentsPromise;
        }

        experimentsPromise = loadExperiments();

        return experimentsPromise;
    }
}

module.exports = commonHelperService;