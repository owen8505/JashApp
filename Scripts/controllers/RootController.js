'use strict';

var Jash = angular.module('Jash');

Jash.controller('RootController',['$scope','$rootScope', 'ContextService', 'CertificateService', 'CreditService', 'DEFAULT_VALUES' ,function($scope, $rootScope, ContextService, CertificateService, CreditService, DEFAULT_VALUES){

    // Catálogo de secciones de la aplicación
    $scope.SECTIONS = DEFAULT_VALUES.SECTIONS;

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

    // Catálogo de gestores
    $scope.managers = [
        {id:0, name:'Ricardo Rosas', phone:'(55) 4354 8820', cellphone:'(55) 4354 8820', mail: 'luis.sanchez.franco@gmail.com', zone:{id:0, title:'Ciudad de México'}, score: 10},
        {id:1, name:'Erik López', phone:'(55) 4354 8820', cellphone:'(55) 4354 8820', mail: 'luis.sanchez.franco@gmail.com', zone:{id:1, title:'Toluca'}, score: 8},
    ];

    $scope.warningList = CertificateService.getWarningCertificates();

    $scope.certificates = CertificateService.getAllCertificates();
    $scope.credits = CreditService.getAllCredits();

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
        //var url = ContextService.getSpWeb().url + '/_api/sp.userprofiles.peoplemanager';
        
        
    };

    $scope.initController();

}]);