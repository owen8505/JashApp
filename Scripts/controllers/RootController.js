 'use strict';

var Jash = angular.module('Jash');

Jash.controller('RootController', ['$scope', '$rootScope', 'ContextService', 'ManagerService', 'ParcelService', 'ZoneService', 'CertificateService', 'DEFAULT_VALUES', function ($scope, $rootScope, ContextService, ManagerService, ParcelService, ZoneService, CertificateService, DEFAULT_VALUES) {
    $scope.spWeb,
    $scope.manager, $scope.warningList, $scope.certificates, $scope.credits;

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

    $scope.initController = function () {

        if (!$scope.spWeb) {
            $scope.spWeb = ContextService.getSpWeb();
        }
        
        // Sección seleccionada
        $scope.currentSection = $scope.SECTIONS[DEFAULT_VALUES.SECTION.DASHBOARD];

        // Catálogo de gestores
        $scope.managers = ManagerService.getAllManagers();
        $scope.parcels = ParcelService.getAllParcels();
        $scope.zones = ZoneService.getAllZones();
        $scope.warningList = CertificateService.getWarningCertificates();
        $scope.certificates = CertificateService.getAllCertificates();
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
    
    $scope.initController();
                    
}]);