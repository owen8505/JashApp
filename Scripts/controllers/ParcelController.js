'use strict';

Jash.controller('ParcelController', ['$scope', '$rootScope', '$state', 'ParcelService', 'DEFAULT_VALUES', function ($scope, $rootScope, $state, ParcelService, DEFAULT_VALUES) {

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
                $scope.selectedItem = angular.copy(ParcelService.createParcel());
                break;
            case DEFAULT_VALUES.ITEM_STATES.EDIT.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.EDIT.title;
                if ($state.params) {
                    $scope.selectedItem = angular.copy(ParcelService.getParcelById($state.params.id));
                }
                break;
        }
    };

    $scope.saveParcel = function () {
        ParcelService.saveParcel($scope.selectedItem);
    };

    $scope.updateParcel = function () {
        ParcelService.updateParcel($scope.selectedItem);
    };

    $scope.deleteParcel = function () {
        ParcelService.deleteParcel($scope.selectedItem);
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