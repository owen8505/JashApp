(function () {
    'use strict';
    var Jash = angular.module('Jash');

    //Eventos monitoreados por la app
    var events = {
        controllerActivateSucess: 'controler.activateSuccess'
    };

    //Objeto de configuración de la app que contiene constantes globales
    var config = {
        //Decorador de exceptionHandler
        appErrorPrefix: '[SYS_ERR]',
        //Eventos de la app
        event: event,
        //Versión de la app
        version: '1.0.0.0',
        // Configuración de las notificaciones de prueba
        showDebugNotiSetting: true
    };

    //Creación de la variable global para la configuración de la app: Config
    Jash.value('config', config);

    //Configuración del servicio de LOG antes de iniciar la app
    Jash.config(['$logProvider', function ($logProvider) {
        //Prender/apagar el modo de debug
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
    }]);

    //Referencia al config
    /*Jash.config(['commonConfigProvider', function (cfg) {
        cfg.config.controllerActivateSucessEvent = config.events.controllerActivateSucess;
    }]);*/

})();