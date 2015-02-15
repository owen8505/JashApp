'use strict';

Jash.controller('ZoneController', ['$scope', '$rootScope', '$state', 'ZoneService', 'DEFAULT_VALUES', function ($scope, $rootScope, $state, ZoneService, DEFAULT_VALUES) {

    $scope.selectedItem = undefined;

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
                $scope.selectedItem = angular.copy(ZoneService.createZone());
                break;
            case DEFAULT_VALUES.ITEM_STATES.EDIT.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.EDIT.title;
                if ($state.params) {
                    $scope.selectedItem = angular.copy(ZoneService.getZoneById($state.params.id));
                }
                break;
        }
    };

    $scope.saveZone = function () {
        ZoneService.saveZone($scope.selectedItem);
    };

    $scope.updateZone = function () {
        ZoneService.updateZone($scope.selectedItem);
    };

    $scope.deleteZone = function () {
        ZoneService.deleteZone($scope.selectedItem);
    };

    $scope.isValidForm = function (fields) {
        var isValidForm = true;
        for (var indexField in fields) {
            var fieldName = fields[indexField];
            if (!$scope.selectedItem[fieldName]) {
                isValidForm = false;
                break;
            }
        }
        return isValidForm;
    };

    $scope.initController();

}]);