 'use strict';

var Jash = angular.module('Jash');

Jash.controller('RootController', ['$scope', '$rootScope', '$state', '$timeout', 'ContextService', 'ManagerService', 'ParcelService', 'StatusService', 'ZoneService', 'CertificateService', 'usSpinnerService', 'DEFAULT_VALUES', function ($scope, $rootScope, $state, $timeout, ContextService, ManagerService, ParcelService, StatusService, ZoneService, CertificateService, usSpinnerService, DEFAULT_VALUES) {
    $scope.spWeb,
    $scope.manager, $scope.warningList, $scope.certificates, $scope.credits;

    $scope.CERTIFICATE_STATUS = DEFAULT_VALUES.CERTIFICATE_STATUS;

    // Catálogo de secciones de la aplicación
    $scope.SECTIONS = DEFAULT_VALUES.SECTIONS;

    // Nombre de usuario
    $scope.userName = 'ENTRE';

    // Función que determina si una sección está seleccionada
    $scope.isCurrentSection = function(section){
        return $scope.currentSection === section;
    };

    // Función que selecciona la sección enviada como parámetro
    $scope.setCurrentSection = function (section) {
        $scope.currentSection = section;
    };

    // Función que redirige a la última página visitada
    $scope.historyBack = function () {
        $state.go($rootScope.previousState);
    };

    // Listener que refresca la vista cuando cambian los arreglos de angular
    $scope.$on('applyChanges', function () {
        $scope.$apply();        
    });

    // Listener que revisa si toda la información inicial requerida ya fue obtenida
    $scope.$on('initDataLoaded', function () {
        if($scope.managers && $scope.parcels && $scope.zones && $scope.statuses) {
            usSpinnerService.stop('main-spinner');
        }

    });

    $scope.initController = function () {

        if (!$scope.spWeb) {
            $scope.spWeb = ContextService.getSpWeb();
        }
        
        // Sección seleccionada
        $scope.currentSection = $scope.SECTIONS[DEFAULT_VALUES.SECTION.DASHBOARD];

        // Catálogo de datos iniciales
        $scope.managers = ManagerService.getAllManagers();
        $scope.parcels = ParcelService.getAllParcels();
        $scope.zones = ZoneService.getAllZones();
        $scope.statuses = StatusService.getAllStatuses();

        $scope.warningList = CertificateService.getWarningCertificates();
        //$scope.credits = CreditService.getAllCredits();

        var context = SP.ClientContext.get_current();
        var user = context.get_web().get_currentUser();
        context.load(user);
   
        context.executeQueryAsync(
            Function.createDelegate(this, function (data) {
                $scope.userName = user.get_title();
                $scope.$apply();
            }),
            Function.createDelegate(this, function (response) {
                console.log(response)
            })
        );
        
    };  

    $(document).ready(function(){
        $timeout(function() {
            usSpinnerService.spin('main-spinner');
        },0);

        $scope.initController();
    });
                    
}]);