'use strict';

Jash.controller('CatalogController', ['$scope', '$rootScope', 'DEFAULT_VALUES', function ($scope, $rootScope, DEFAULT_VALUES) {

    $scope.initController = function () {
        $rootScope.currentSection = DEFAULT_VALUES.SECTIONS[DEFAULT_VALUES.SECTION.CATALOGS];
    };

    $scope.initController();

}]);