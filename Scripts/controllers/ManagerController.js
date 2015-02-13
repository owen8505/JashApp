'use strict';

Jash.controller('ManagerController', ['$scope', '$rootScope', '$state', 'ManagerService', 'DEFAULT_VALUES', function ($scope, $rootScope, $state, ManagerService, DEFAULT_VALUES) {

    $scope.selectedItem = undefined;

    $scope.zonesDropdown = [];

    $scope.initController = function () {

        switch ($state.current.state) {
            case DEFAULT_VALUES.ITEM_STATES.NEW.code:
                $scope.selectedItem = angular.copy(ManagerService.createManager());
                console.log($scope.selectedItem);
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

    $scope.setZone = function (zoneIndex) {
        if ($scope.selectedItem) {
            $scope.selectedItem.zone = $scope.zones[zoneIndex];
        }
    };

    $scope.initController();



}]);