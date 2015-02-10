'use strict';

Jash.controller('DashboardController',['$scope','$rootScope',  'DEFAULT_VALUES' ,function($scope, $rootScope,  DEFAULT_VALUES){

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

        // Susección actual
        $scope.currentSubsection = $scope.SUBSECTIONS[DEFAULT_VALUES.SUBSECTION.ALL];
    };

    $scope.initController();

}]);



