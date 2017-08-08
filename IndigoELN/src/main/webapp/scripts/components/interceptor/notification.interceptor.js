angular
    .module('indigoeln')
    .factory('notificationInterceptor', notificationInterceptor);

/* @ngInject */
function notificationInterceptor($injector) {
    var SUCCESS_ALERT = 'X-indigoeln-success-alert',
        ERROR_ALERT = 'X-indigoeln-error-alert',
        WARNING_ALERT = 'X-indigoeln-warning-alert',
        INFO_ALERT = 'X-indigoeln-info-alert',
        ALERT_PARAMS = 'X-indigoeln-params';

    return {
        responseHandler: responseHandler
    };

    function responseHandler(response) {
        var Alert = $injector.get('Alert');
        if (_.isString(response.headers(SUCCESS_ALERT))) {
            Alert.success(response.headers(SUCCESS_ALERT), {
                param: response.headers(ALERT_PARAMS)
            });
        } else if (_.isString(response.headers(ERROR_ALERT))) {
            Alert.error(response.headers(ERROR_ALERT), {
                param: response.headers(ALERT_PARAMS)
            });
        } else if (_.isString(response.headers(WARNING_ALERT))) {
            Alert.warning(response.headers(WARNING_ALERT), {
                param: response.headers(ALERT_PARAMS)
            });
        } else if (_.isString(response.headers(INFO_ALERT))) {
            Alert.info(response.headers(INFO_ALERT), {
                param: response.headers(ALERT_PARAMS)
            });
        }

        return response;
    }
}
