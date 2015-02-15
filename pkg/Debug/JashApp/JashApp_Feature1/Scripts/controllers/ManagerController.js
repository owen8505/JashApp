'use strict';

Jash.controller('ManagerController', ['$scope', '$rootScope', '$state', 'ManagerService', 'DEFAULT_VALUES', function ($scope, $rootScope, $state, ManagerService, DEFAULT_VALUES) {

    $scope.selectedItem = undefined;
    $scope.zonesDropdown = [];

    $scope.$on('itemSaved', function () {
        $state.go('catalogs');
    });

    $scope.$on('itemUpdated', function () {
        $state.go('catalogs');
    });

    $scope.$on('itemDeleted', function () {
        $state.go('catalogs');
    });

    $scope.initController = function () {
        
        switch ($state.current.state) {
            case DEFAULT_VALUES.ITEM_STATES.NEW.code:
                $scope.selectedItem = angular.copy(ManagerService.createManager());                
                break;
            case DEFAULT_VALUES.ITEM_STATES.EDIT.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.EDIT.title;
                if ($state.params) {                    
                    $scope.selectedItem = angular.copy(ManagerService.getManagerById($state.params.id));
                }
                break;
        }

        angular.forEach($scope.zones, function (zone, index) {
            $scope.zonesDropdown.push({
                text: zone.title,
                click: 'setZone(' + index + ')'
            });
        });

    };

    $scope.saveManager = function () {        
        ManagerService.saveManager($scope.selectedItem);
    };

    $scope.updateManager = function () {        
        ManagerService.updateManager($scope.selectedItem);
    };

    $scope.deleteManager = function () {
        ManagerService.deleteManager($scope.selectedItem);
    };

    $scope.setZone = function (zoneIndex) {
        if ($scope.selectedItem) {
            $scope.selectedItem.zone = $scope.zones[zoneIndex];
        }
    };

    $scope.isValidForm = function (fields) {        
        var isValidForm = true;
        for (var indexField in fields) {
            var fieldName = fields[indexField];            
            if (!$scope.selectedItem[fieldName]){
                isValidForm = false;
                break;
            }
        }   
        return isValidForm;
    };

    $scope.initController();



}]);