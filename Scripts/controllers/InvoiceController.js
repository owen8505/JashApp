'use strict';

Jash.controller('InvoiceController', ['$scope', '$rootScope', '$state', '$popover', '$interval', 'InvoiceService', 'DEFAULT_VALUES', function ($scope, $rootScope, $state, $popover, $interval, InvoiceService, DEFAULT_VALUES) {

    $scope.REQUEST_TYPE = DEFAULT_VALUES.REQUEST_TYPE;

    $scope.selectedItem = undefined;
    $scope.documentName = undefined;
    $scope.committedDate = undefined;
    $scope.requestTypeDropdown = [];
    $scope.invoiceDate = undefined;

    $scope.query = '';

    $scope.$on('invoicesLoaded', function ($event, reload) {
        $rootScope.invoicesLoaded = true;

        if (reload){
            $scope.initController();
        }
    });

    $scope.$on('itemUpdated', function () {
        $scope.historyBack('invoices.list');
    });

    $scope.initController = function () {
        
        $rootScope.currentSection = DEFAULT_VALUES.SECTIONS[DEFAULT_VALUES.SECTION.INVOICES];                        
        switch ($state.current.state) {
            case DEFAULT_VALUES.ITEM_STATES.NEW.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.NEW.title;
                $scope.createInvoice();
                break;
            case DEFAULT_VALUES.ITEM_STATES.EDIT.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.EDIT.title;

                if ($rootScope.invoicesLoaded){
                    if ($state.params) {
                        var interval = $interval(function(){
                            var selectedItem =  angular.copy(InvoiceService.getInvoiceById($state.params.id));

                            if(selectedItem.documentsLoaded){
                                $scope.selectedItem = angular.copy(InvoiceService.getInvoiceById($state.params.id));
                                $interval.cancel(interval);
                            }
                        }, 100);

                    }                    
                } else {
                    $scope.invoices = InvoiceService.getAllInvoices(true);
                }
                break;
            case DEFAULT_VALUES.ITEM_STATES.VIEW.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.VIEW.title;
                break;
            case DEFAULT_VALUES.ITEM_STATES.LIST.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.LIST.title;
                $scope.invoices = InvoiceService.getAllInvoices(false);
                break;
            default:
                break;
        }

        if ($scope.selectedItem) {
            if ($scope.selectedItem.invoiceDate) {
                $scope.invoiceDate = $scope.selectedItem.invoiceDate._d.toTimeString();                
            }
            
        }

        angular.forEach($scope.REQUEST_TYPE, function (requestType, index) {
            $scope.requestTypeDropdown.push({
                text: requestType.name,
                click: 'setRequestType(' + index + ')'
            });
        });

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

    $scope.deleteInvoice = function () {
        InvoiceService.deleteInvoice($scope.selectedItem);
    };

    $scope.setRequestType = function (requestTypeIndex) {
        if ($scope.selectedItem) {
            $scope.selectedItem.requestType = $scope.REQUEST_TYPE[requestTypeIndex];
        }
    };

    $scope.setInvoiceDate = function (invoiceDate) {        
        if ($scope.selectedItem) {
            $scope.selectedItem.invoiceDate = new moment(invoiceDate).locale('es');
        }
    };

    $scope.addDocument = function () {
        if ($scope.selectedItem && $scope.documentElement && $scope.documentName) {
            var file = $scope.documentElement.files[0];
            var document = {
                fileId: 0,
                name: $scope.getFileBasename(file.name) + '_' + moment().valueOf() + '_' + Math.round(Math.random()*10000) + '.' + $scope.getFileExtension(file.name),
                title: $scope.documentName,
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

    $scope.addRequest = function () {
        if ($scope.selectedItem && $scope.requestId) {
            var request = {
                id: $scope.requestId,
                removed: 0,
                new: 1
            };

            $scope.selectedItem.requests.push(request);
            $scope.requestId = undefined;
        }
    };

    $scope.deleteRequest = function (event, request) {
        if (request.new) {
            // Es un request nuevo y aun no existe en el servidor, entonces se debe eliminar del arreglo de requests
            $scope.selectedItem.requests.splice($scope.selectedItem.requests.indexOf(request), 1);
        } else {
            // Se le asigna removed 1 para marcar que es necesario borrar el request y para evitar que se despliegue en el front
            request.removed = 1;
        }
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



