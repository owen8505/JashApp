'use strict';

Jash.controller('UserController', ['$scope', '$rootScope', '$state', 'UserService', 'DEFAULT_VALUES', function ($scope, $rootScope, $state, UserService, DEFAULT_VALUES) {

    $scope.selectedItem = undefined;

    $scope.$on('itemSaved', function () {
        $state.go('users.list');
    });

    $scope.$on('itemUpdated', function () {
        $state.go('users.list');
    });

    $scope.$on('itemDeleted', function () {
        $state.go('users.list');
    })

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

    $scope.initController = function () {        
        switch ($state.current.state) {
            case DEFAULT_VALUES.ITEM_STATES.NEW.code:
                $scope.selectedItem = angular.copy(UserService.createUser());                
                break;
            case DEFAULT_VALUES.ITEM_STATES.EDIT.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.EDIT.title;
                if ($state.params) {                    
                    $scope.selectedItem = angular.copy(UserService.getUserById($state.params.id));
                }                
                break;
            case DEFAULT_VALUES.ITEM_STATES.LIST.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.LIST.title;                
                break;
            default:                
                break;
        }
    };

    $scope.saveUser = function () {
        UserService.saveUser($scope.selectedItem);
    };

    $scope.updateUser = function () {        
        UserService.updateUser($scope.selectedItem);
    };

    $scope.deleteUser = function () {
        UserService.deleteUser($scope.selectedItem);
    };
    
    $scope.initController();

}]);