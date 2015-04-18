'use strict';

Jash.controller('CreditController', ['$scope', '$rootScope', '$state', '$popover', '$interval', 'CreditService', 'StatusService', 'DEFAULT_VALUES', function ($scope, $rootScope, $state, $popover, $interval, CreditService, StatusService, DEFAULT_VALUES) {

    //Crédito seleccionado
    $scope.selectedItem = undefined;
    $scope.attachmentElement = undefined;
    $scope.attachmentName = undefined;
    $scope.documentName = undefined;
    $scope.invoiceName = undefined;

    $scope.parcelsDropdown = [];

    $scope.query = '';

    $scope.itemsLoaded = false;

    // Cuando cargue la inforamción necesaria en rootScope
    $scope.$on('initDataComplete', function(){
       $scope.initController();
    });

    $scope.$on('creditsLoaded', function ($event, reload) {
        $rootScope.creditsLoaded = true;

        if (reload){
            $scope.initController();
        }
    });

    $scope.$on('itemUpdated', function () {
        $scope.historyBack('credits.list');
    });

    $scope.initController = function () {

        $rootScope.currentSection = DEFAULT_VALUES.SECTIONS[DEFAULT_VALUES.SECTION.DASHBOARD];

        switch ($state.current.state) {
            case DEFAULT_VALUES.ITEM_STATES.NEW.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.NEW.title;
                $scope.createCredit();
                break;
            case DEFAULT_VALUES.ITEM_STATES.EDIT.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.EDIT.title;

                if ($rootScope.creditsLoaded){
                    if ($state.params) {

                        var interval = $interval(function(){
                            var selectedItem =  angular.copy(CreditService.getCreditById($state.params.id, $state.params.mode));

                            if(selectedItem.documentsLoaded && selectedItem.attachmentsLoaded){
                                $scope.selectedItem = angular.copy(CreditService.getCreditById($state.params.id, $state.params.mode));

                                $interval.cancel(interval);
                            }
                        }, 100);
                    }
                } else {
                    switch($state.params.mode) {
                        case 'all':
                            $scope.credits = CreditService.getAllCredits(true);
                            break;
                        case 'last':
                            $scope.lastCredits = CreditService.getLastCredits(true);
                            break;
                        default:
                            break;
                    }
                }
                break;
            case DEFAULT_VALUES.ITEM_STATES.VIEW.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.VIEW.title;
                break;
            case DEFAULT_VALUES.ITEM_STATES.LIST.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.LIST.title;
                $scope.credits = CreditService.getAllCredits();
                break;
            default:
                break;
        }

        angular.forEach($scope.parcels, function (parcel, index) {
            $scope.parcelsDropdown.push({
                text: parcel.name,
                click: 'setParcel(' + index + ')'
            });
        });

    };

    $scope.isNewCredit = function () {
        return $scope.titleState == DEFAULT_VALUES.ITEM_STATES.NEW.title;
    };

    $scope.createCredit = function () {
        $scope.selectedItem = angular.copy(CreditService.createCredit());
    };

    $scope.saveCredit = function () {
        CreditService.saveCredit($scope.selectedItem);
    };

    $scope.updateCredit = function () {
        CreditService.updateCredit($scope.selectedItem);
    };

    $scope.deleteCredit = function () {
        CreditService.deleteCredit($scope.selectedItem);
    };

    $scope.setParcel = function (parcelIndex) {
        if ($scope.selectedItem) {
            $scope.selectedItem.parcel = $scope.parcels[parcelIndex];
        }
    };

    $scope.isCurrentStatus = function (status, minStatus) {
        if (status && StatusService.getStatusById(status.id).code >= minStatus.code) {
            return true;
        }
        return false;
    };

    $scope.setRealDeliveryDate = function (realDeliveryDate) {
        if ($scope.selectedItem) {
            $scope.selectedItem.realDeliveryDate = new moment(realDeliveryDate).locale('es');
        }
    };

    $scope.onlyFutureDate = function (date) {
        var today = new Date();
        today.setDate(today.getDate() - 1);

        return date > today;
    };

    $scope.attachmentFilesChanged = function (elem) {
        $scope.attachmentElement = (elem);
    };

    $scope.addAttachment = function () {

        if ($scope.selectedItem && $scope.attachmentElement && $scope.attachmentName) {
            var file = $scope.attachmentElement.files[0];
            var attachment = {
                fileId: 0,
                name: $scope.getFileBasename(file.name) + '_' + moment().valueOf() + '_' + Math.round(Math.random()*10000) + '.' + $scope.getFileExtension(file.name),
                title: $scope.attachmentName,
                url: undefined,
                file: file
            };

            $scope.selectedItem.attachments.push(attachment);
            angular.element($scope.attachmentElement).val(null);
            $scope.attachmentElement = undefined;
            $scope.attachmentName = undefined;
        }
    };

    $scope.deleteAttachment = function (event, attachment) {

        // Evitamos que el documento se abra
        event.preventDefault();

        if (attachment.fileId == 0) {
            // Es un archivo nuevo y aun no existe en el servidor, entonces se debe eliminar del arreglo de archivos
            $scope.selectedItem.attachments.splice($scope.selectedItem.attachments.indexOf(attachment), 1);
        } else {
            // Se le asigna removed 1 para marcar que es necesario borrar el documento y para evitar que se despliegue en el front
            attachment.removed = 1;
        }
    };

    $scope.documentFilesChanged = function (elem) {
        $scope.documentElement = (elem);
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

    $scope.invoiceFilesChanged = function (elem) {
        $scope.invoiceElement = (elem);
    };

    $scope.addInvoice = function () {

        if ($scope.selectedItem && $scope.invoiceElement && $scope.invoiceName) {
            var file = $scope.invoiceElement.files[0];
            var invoice = {
                fileId: 0,
                name: $scope.getFileBasename(file.name) + '_' + moment().valueOf() + '_' + Math.round(Math.random()*10000) + '.' + $scope.getFileExtension(file.name),
                title: $scope.invoiceName,
                url: undefined,
                file: file
            };

            $scope.selectedItem.invoices.push(invoice);
            angular.element($scope.invoiceElement).val(null);
            $scope.invoiceElement = undefined;
            $scope.invoiceName = undefined;
        }
    };

    $scope.deleteInvoice = function (event, invoice) {

        // Evitamos que el documento se abra
        event.preventDefault();

        if (invoice.fileId == 0) {
            // Es un archivo nuevo y aun no existe en el servidor, entonces se debe eliminar del arreglo de archivos
            $scope.selectedItem.invoices.splice($scope.selectedItem.invoices.indexOf(invoice), 1);
        } else {
            // Se le asigna removed 1 para marcar que es necesario borrar el documento y para evitar que se despliegue en el front
            invoice.removed = 1;
        }

    };

    $scope.openRequestInfo = function () {

    };

    $scope.isValidForm = function (requiredFields, optionalFields) {
        var isValidForm = true;
        var isOptionalForm = true;
        if ($scope.selectedItem) {
            for (var indexField in requiredFields) {
                var fieldName = requiredFields[indexField];
                if (!$scope.selectedItem[fieldName]) {
                    isValidForm = false;
                    break;
                }
            }

            if (optionalFields && optionalFields.length){
                isOptionalForm = false;

                for (var indexField in optionalFields) {
                    var fieldName = optionalFields[indexField];
                    isOptionalForm = isOptionalForm || $scope.selectedItem[fieldName];
                }
            }
        }

        return isValidForm && isOptionalForm;
    };

    // Si entramos al controlador y ya está cargada la información inicial podemos continuar, si no esperamos al broadcast del rootScope
    if($rootScope.initDataLoaded){
        $scope.initController();
    }

}]);



