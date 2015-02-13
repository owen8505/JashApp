'use strict';

var Jash = angular.module('Jash');

Jash.controller('RootController', ['$scope', '$rootScope', 'ContextService', 'ManagerService', 'CertificateService', 'CreditService', 'DEFAULT_VALUES', function ($scope, $rootScope, ContextService, ManagerService, CertificateService, CreditService, DEFAULT_VALUES) {

    // Catálogo de secciones de la aplicación
    $scope.SECTIONS = DEFAULT_VALUES.SECTIONS;

    // Nombre de usuario
    $scope.userName = 'ENTRE';

    // Catálogo de Regiones
    $scope.zones = [
        {id:0, title:'Ciudad de méxico'},
        {id:1, title:'Toluca'}
    ];

    $scope.parcels = [
        { id: 0, title: 'DHL' },
        { id: 1, title: 'Fedex' },
        { id: 2, title: 'Estafeta' }
    ];    

    // Función que determina si una sección está seleccionada
    $scope.isCurrentSection = function(section){
        return $scope.currentSection === section;
    };

    // Función que selecciona la sección enviada como parámetro
    $scope.setCurrentSection = function (section) {
        $scope.currentSection = section;
    };

    $scope.initController = function() {
        // Sección seleccionada
        $scope.currentSection = $scope.SECTIONS[DEFAULT_VALUES.SECTION.DASHBOARD];

        // Catálogo de gestores
        $scope.managers = ManagerService.getAllManagers();
        $scope.warningList = CertificateService.getWarningCertificates();
        $scope.certificates = CertificateService.getAllCertificates();
        $scope.credits = CreditService.getAllCredits();

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

    $scope.$on('initRootController', function () {
        $scope.initController();
    });   

}]);