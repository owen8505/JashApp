(function () {

    'use strict';
    var Jash = angular.module('Jash');

    Jash.config(function ($provide) {
        $provide.decorator('$exceptionHandler', ['$delegate', 'config', 'logger', extendExceptionHandler]);
    });

    var extendExceptionHandler = function ($delegate,config,logger) {
        var appErrorPrefix = config.appErrorPrefix;

        return function(exception, cause){
            $delegate(exception, cause);
            if (appErrorPrefix && exception.message.indexOf(appErrorPrefix) === 0) {
                return;
            }

            var errorData = {
                exception: exception,
                cause: cause
            };

            var message = appErrorPrefix + exception.message;
            logger.logError(message, errorData, true);
        };
    }

})();