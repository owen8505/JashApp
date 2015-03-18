 'use strict';

var Jash = angular.module('Jash');

Jash.controller('RootController', ['$scope', '$rootScope', '$state', '$timeout', 'ContextService', 'ManagerService', 'ParcelService', 'StatusService', 'ZoneService', 'SearchService', 'UserService', 'CertificateService', 'usSpinnerService', 'DEFAULT_VALUES', function ($scope, $rootScope, $state, $timeout, ContextService, ManagerService, ParcelService, StatusService, ZoneService, SearchService, UserService, CertificateService, usSpinnerService, DEFAULT_VALUES) {
    $scope.spWeb,
    $scope.manager, $scope.warningList, $scope.certificates, $scope.credits;
    $scope.searchParams = '';
    $scope.searchResults = undefined;

    $rootScope.initDataLoaded = false;
    $rootScope.certificatesLoaded = false;
    $rootScope.creditsLoaded = false;
    $rootScope.invoicesLoaded = false;

    $rootScope.managersLoaded = false;
    $rootScope.parcelsLoaded = false;
    $rootScope.zonesLoaded = false;
    $rootScope.statusesLoaded = false;

    $scope.CERTIFICATE_STATUS = DEFAULT_VALUES.CERTIFICATE_STATUS;
    $scope.CREDIT_STATUS = DEFAULT_VALUES.CREDIT_STATUS;

    // Catálogo de secciones de la aplicación
    $scope.SECTIONS = DEFAULT_VALUES.SECTIONS;

    // Nombre de usuario
    $scope.userName = '';

    // Función que determina si una sección está seleccionada
    $scope.isCurrentSection = function(section){
        return $rootScope.currentSection === section;
    };

    // Función que selecciona la sección enviada como parámetro
    $scope.setCurrentSection = function (section) {
        $scope.currentSection = section;
    };

    // Función que redirige a la última página visitada
    $scope.historyBack = function (defaulState) {
        if($rootScope.previousState){
            $state.go($rootScope.previousState);
        } else {
            $state.go(defaulState)
        }
    };

    $scope.search = function (searchParams) {
        if (searchParams) {
            SearchService.search(searchParams);
        }
    };

    $scope.resetSearchParams = function () {
        $scope.searchResults = undefined;        
    };

    $scope.getFileBasename = function(str) {
        var base = new String(str).substring(str.lastIndexOf('/') + 1);
        if(base.lastIndexOf(".") != -1)
            base = base.substring(0, base.lastIndexOf("."));
        return base;
    };

    $scope.getFileExtension = function(str) {
        return str.split('.').pop()
    };

    $scope.$on('itemsFound', function () {
        $scope.searchResults = SearchService.getSearchResults();
        $scope.$apply();
    });

    // Listener que refresca la vista cuando cambian los arreglos de angular
    $scope.$on('applyChanges', function () {
        $scope.$apply();        
    });

    // Listener que revisa si toda la información inicial requerida ya fue obtenida
    $scope.$on('initDataLoaded', function () {
        if($rootScope.managersLoaded && $rootScope.parcelsLoaded && $rootScope.zonesLoaded && $rootScope.statusesLoaded) {
            $rootScope.initDataLoaded = true;
            usSpinnerService.stop('main-spinner');

            $rootScope.$broadcast('initDataComplete');
        }

    });

    $scope.initController = function () {

        if (!$scope.spWeb) {
            $scope.spWeb = ContextService.getSpWeb();
        }

        // Catálogo de datos iniciales
        $scope.managers = ManagerService.getAllManagers();
        $scope.parcels = ParcelService.getAllParcels();
        $scope.zones = ZoneService.getAllZones();
        $scope.statuses = StatusService.getAllStatuses();
        $scope.users = UserService.getAllUsers();
        $scope.warningList = CertificateService.getWarningCertificates();

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