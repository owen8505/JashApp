'use strict';

Jash.controller('CertificateController', ['$scope', '$rootScope', '$state', '$popover', '$interval', 'CertificateService', 'ManagerService', 'StatusService', 'DEFAULT_VALUES', function ($scope, $rootScope, $state, $popover, $interval, CertificateService, ManagerService, StatusService, DEFAULT_VALUES) {

    //Certificado seleccionado
    $scope.selectedItem = undefined;    
    $scope.attachmentElement = undefined;
    $scope.attachmentName = undefined;
    $scope.documentName = undefined;
    $scope.invoiceName = undefined;
    $scope.committedDate = undefined;

    $scope.parcelsDropdown = [];
    $scope.managersDropdown = [];
    $scope.zonesDropdown = [];

    $scope.query = '';

    $scope.itemsLoaded = false;

    // Cuando cargue la inforamción necesaria en rootScope
    $scope.$on('initDataComplete', function(){
        $scope.initController();
    });

    $scope.$on('certificatesLoaded', function ($event, reload) {
        $rootScope.certificatesLoaded = true;

        if (reload){
            $scope.initController();
        }
    });

    $scope.$on('itemUpdated', function () {
        $scope.historyBack('certificates.list');
    });

    $scope.initController = function(){

        $rootScope.currentSection = DEFAULT_VALUES.SECTIONS[DEFAULT_VALUES.SECTION.DASHBOARD];

        switch ($state.current.state){
            case DEFAULT_VALUES.ITEM_STATES.NEW.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.NEW.title;
                $scope.createCertificate();
                break;
            case DEFAULT_VALUES.ITEM_STATES.EDIT.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.EDIT.title;

                if ($rootScope.certificatesLoaded){
                    if ($state.params) {

                        var interval = $interval(function(){
                            var selectedItem =  angular.copy(CertificateService.getCertificateById($state.params.id, $state.params.mode));

                            if(selectedItem.documentsLoaded && selectedItem.attachmentsLoaded){
                                $scope.selectedItem = angular.copy(CertificateService.getCertificateById($state.params.id, $state.params.mode));

                                if ($scope.selectedItem.zone) {
                                    $scope.setZoneById($scope.selectedItem.zone.id);
                                }
                                $interval.cancel(interval);
                            }
                        }, 100);
                    }
                } else {
                    switch($state.params.mode) {
                        case 'all':
                            $scope.certificates = CertificateService.getAllCertificates(true);
                            break;
                        case 'last':
                            $scope.lastCertificates = CertificateService.getLastCertificates(true);
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
                $scope.certificates = CertificateService.getAllCertificates();
                break;
            default :
                break;
        }

        angular.forEach($scope.zones, function (zone, index) {            
            $scope.zonesDropdown.push({
                text: zone.name,
                click: 'setZone('+index+')'
            });
        });

        angular.forEach($scope.parcels, function (parcel, index) {
            $scope.parcelsDropdown.push({
                text: parcel.name,
                click: 'setParcel('+index+')'
            });
        });

    };

    $scope.createCertificate = function () {
        $scope.selectedItem = angular.copy(CertificateService.createCertificate());
    };

    $scope.saveCertificate = function(){
        CertificateService.saveCertificate($scope.selectedItem);
    };

    $scope.updateCertificate = function () {
        CertificateService.updateCertificate($scope.selectedItem);
    };

    $scope.deleteCertificate = function () {
        CertificateService.deleteCertificate($scope.selectedItem);
    };

    $scope.setZone = function(zoneIndex){
        if ($scope.selectedItem) {
            
            $scope.selectedItem.zone = $scope.zones[zoneIndex];
            $scope.managersDropdown = [];
            
            angular.forEach($scope.managers, function (manager, index) {                
                if ($scope.selectedItem.zone.id == manager.zone.id) {
                    
                    $scope.managersDropdown.push({
                        text: manager.name,
                        click: 'setManager('+index+')'
                    });
                }
            });

            //Si ya está seleccionado un gestor y el gestor no pertenece a la región seleccionada lo reseteamos
            if($scope.selectedItem.manager && ManagerService.getManagerById($scope.selectedItem.manager.id).zone.id != $scope.selectedItem.zone.id){
                $scope.selectedItem.manager = undefined;
            }
        }
    };

    $scope.setZoneById = function(){
        var zoneIndex = 0;

        angular.forEach($scope.zones, function(zone, index){
           if ($scope.selectedItem.zone.id == zone.id) {
               zoneIndex = index;
           }
        });

        $scope.setZone(zoneIndex);
    }

    $scope.setManager = function (managerIndex) {
        if($scope.selectedItem){
            $scope.selectedItem.manager = $scope.managers[managerIndex];
        }
    };

    $scope.setParcel = function (parcelIndex) {
        if($scope.selectedItem){
            $scope.selectedItem.parcel = $scope.parcels[parcelIndex];
        }
    };

    $scope.isManagerSelected = function(){
        var isManagerSelected = false;
        if($scope.selectedItem){
            if($scope.selectedItem.manager){
                isManagerSelected = true;
            }
        }
        return isManagerSelected;
    };

    $scope.isCurrentStatus = function (status, minStatus) {
        if(status && StatusService.getStatusById(status.id).code >= minStatus.code){
            return true;
        }
        return false;
    };

    $scope.sendMail = function (subject, observations) {
        var manager = ManagerService.getManagerById($scope.selectedItem.manager.id);
        observations = 'Folio: ' + $scope.selectedItem.folio + "\n" +
                        'Incripción: ' + $scope.selectedItem.inscription + "\n" +
                        'Propietario: ' + $scope.selectedItem.owner + "\n\n" +
                        observations;
        CertificateService.sendMail(manager, subject, observations);
    };

    $scope.setCommittedDate = function(committedDate){
        if($scope.selectedItem){
            $scope.selectedItem.committedDate = new moment(committedDate).locale('es');
        }
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

    $scope.addAttachment = function(){

        if($scope.selectedItem && $scope.attachmentElement && $scope.attachmentName){
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

    $scope.deleteAttachment = function(event, attachment){

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

    $scope.addDocument = function(){

        if($scope.selectedItem && $scope.documentElement && $scope.documentName){
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

    $scope.deleteDocument = function(event, document){

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

    $scope.addInvoice = function(invoiceName){

        if($scope.selectedItem && $scope.invoiceElement && invoiceName){
            var file = $scope.invoiceElement.files[0];
            var invoice = {
                fileId: 0,
                name: $scope.getFileBasename(file.name) + '_' + moment().valueOf() + '_' + Math.round(Math.random()*10000) + '.' + $scope.getFileExtension(file.name),
                title: invoiceName,
                url: undefined,
                file: file
            };

            $scope.selectedItem.invoices.push(invoice);
            angular.element($scope.invoiceElement).val(null);
            $scope.invoiceElement = undefined;
            $scope.invoiceName = undefined;
        }
    };

    $scope.deleteInvoice = function(event, invoice){

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

    $scope.isValidEmailForm = function (fields) {
        var isValidForm = true;
        if ($scope.selectedItem) {
            for (var indexField in fields) {
                var field = fields[indexField];
                if (!field) {
                    isValidForm = false;
                    break;
                }
            }
        }
        return isValidForm;
    };

    // Si entramos al controlador y ya está cargada la información inicial podemos continuar, si no esperamos al broadcast del rootScope
    if($rootScope.initDataLoaded){
        $scope.initController();
    }

}]);



