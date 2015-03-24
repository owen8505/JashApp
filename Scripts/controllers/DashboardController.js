'use strict';

Jash.controller('DashboardController',['$scope','$rootScope', 'CertificateService', 'CreditService', 'PetitionService', 'DEFAULT_VALUES' ,function($scope, $rootScope, CertificateService, CreditService, PetitionService, DEFAULT_VALUES){

    // Catálogo de subsecciones de la aplicación
    $scope.SUBSECTIONS = DEFAULT_VALUES.SUBSECTIONS;
    $scope.SUBSECTION = DEFAULT_VALUES.SUBSECTION;

    // Función que determina si una subsección está seleccionada
    $scope.isCurrentSubsection = function(subsection){
        return $scope.currentSubsection === subsection;
    };

    $scope.isCertificate = function(type){
      return  type === 'CERTIFICATE';
    };

    // Función que selecciona la subsección enviada como parámetro
    $scope.setCurrentSubsection = function(subsection){
        $scope.currentSubsection = subsection;
    };

    $scope.initController = function() {

        // Sección actual
        $rootScope.currentSection = DEFAULT_VALUES.SECTIONS[DEFAULT_VALUES.SECTION.DASHBOARD];

        // Subsección actual
        $scope.currentSubsection = $scope.SUBSECTIONS[DEFAULT_VALUES.SUBSECTION.ALL];
        $scope.lastCertificates = [];
        $scope.lastCertificates = CertificateService.getLastCertificates();

        $scope.lastCredits = [];
        $scope.lastCredits = CreditService.getLastCredits();

        $scope.lastPetitions = [];
        $scope.lastPetitions = PetitionService.getLastPetitions();
    };

    $scope.initController();

}]);



