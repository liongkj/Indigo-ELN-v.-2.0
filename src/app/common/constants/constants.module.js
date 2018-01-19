var appUnits = require('./app-units.constant');
var modelRestrictions = require('./model-restrictions.constant');
var userPermissions = require('./user-permissions.constant');
var formatValidation = require('./format-validation.constant');

module.exports = angular
    .module('indigoeln.common.constants', [])

    .constant('appUnits', appUnits)
    .constant('modelRestrictions', modelRestrictions)
    .constant('userPermissions', userPermissions)
    .constant('formatValidation', formatValidation)

    .name;