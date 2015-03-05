'use strict';

Jash.controller('InvoiceController', ['$scope', '$rootScope', '$state', '$popover', 'InvoiceService', 'DEFAULT_VALUES', function ($scope, $rootScope, $state, $popover, InvoiceService, DEFAULT_VALUES) {

    //Crédito seleccionado
    $scope.selectedItem = undefined;
    $scope.invoiceName = undefined;
    $scope.invoiceName = undefined;
    $scope.committedDate = undefined;

    $scope.query = '';

    $scope.$on('itemUpdated', function () {
        $scope.historyBack();
    });

    $scope.initController = function () {

        switch ($state.current.state) {
            case DEFAULT_VALUES.ITEM_STATES.NEW.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.NEW.title;
                $scope.createInvoice();
                break;
            case DEFAULT_VALUES.ITEM_STATES.EDIT.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.EDIT.title;
                if ($state.params) {
                    $scope.selectedItem = angular.copy(InvoiceService.getInvoiceById($state.params.id));
                }
                break;
            case DEFAULT_VALUES.ITEM_STATES.VIEW.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.VIEW.title;
                break;
            case DEFAULT_VALUES.ITEM_STATES.LIST.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.LIST.title;
                $scope.invoices = InvoiceService.getAllInvoices();
                break;
            default:
                break;
        }

    };

    $scope.isNewInvoice = function () {
        return $scope.titleState == DEFAULT_VALUES.ITEM_STATES.NEW.title;
    }

    $scope.createInvoice = function () {
        $scope.selectedItem = angular.copy(InvoiceService.createInvoice());
    };

    $scope.saveInvoice = function () {
        InvoiceService.saveInvoice($scope.selectedItem);
    };

    $scope.updateInvoice = function () {
        InvoiceService.updateInvoice($scope.selectedItem);
    };

    $scope.addDocument = function (documentName) {

        if ($scope.selectedItem && $scope.documentElement && documentName) {
            var file = $scope.documentElement.files[0];
            var document = {
                fileId: 0,
                name: file.name,
                title: documentName,
                url: undefined,
                file: file
            };

            $scope.selectedItem.documents.push(document);
            angular.element($scope.documentElement).val(null);
            $scope.documentElement = undefined;
            $scope.documentName = undefined;
        }
    };

    $scope.deleteDocument = function (event, document) {

        // Evitamos que el documento se abra
        event.preventDefault();

        if (document.fileId == 0) {
            // Es un archivo nuevo y aun no existe en el servidor, entonces se debe eliminar del arreglo de archivos
            $scope.selectedItem.documents.splice($scope.selectedItem.documents.indexOf(document), 1);
        } else {
            // Se le asigna removed 1 para marcar que es necesario borrar el documento y para evitar que se despliegue en el front
            document.removed = 1;
        }
    };

    $scope.documentFilesChanged = function (elem) {
        $scope.documentElement = (elem);
    };

    $scope.addFolio = function (folio) {
        if ($scope.selectedItem && folio) {
            $scope.selectedItem.folios.push(folio);
        }

        $scope.folio = undefined;
    };

    $scope.deleteFolio = function (event, folio) {

        // Evitamos que el documento se abra
        event.preventDefault();

        // Es un archivo nuevo y aun no existe en el servidor, entonces se debe eliminar del arreglo de archivos
        $scope.selectedItem.folios.splice($scope.selectedItem.folios.indexOf(folio), 1);
    };

    $scope.isValidForm = function (fields) {
        var isValidForm = true;
        if ($scope.selectedItem) {
            for (var indexField in fields) {
                var fieldName = fields[indexField];
                if (!$scope.selectedItem[fieldName]) {
                    isValidForm = false;
                    break;
                }
            }
        }

        return isValidForm;
    };

    $scope.initController();

}]);



