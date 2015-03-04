'use strict';

Jash.controller('CertificateController', ['$scope', '$rootScope', '$state', '$popover', 'CertificateService', 'ManagerService', 'StatusService', 'DEFAULT_VALUES', function ($scope, $rootScope, $state, $popover, CertificateService, ManagerService, StatusService, DEFAULT_VALUES) {

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


    $scope.$on('itemSaved', function () {
        $scope.historyBack();
    });

    $scope.$on('itemUpdated', function () {
        $scope.historyBack();
    });

    $scope.$on('itemDeleted', function () {
        $scope.historyBack();
    });

    $scope.initController = function(){

        switch ($state.current.state){
            case DEFAULT_VALUES.ITEM_STATES.NEW.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.NEW.title;
                $scope.createCertificate();
                break;
            case DEFAULT_VALUES.ITEM_STATES.EDIT.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.EDIT.title;
                if ($state.params) {
                    $scope.selectedItem = angular.copy(CertificateService.getCertificateById($state.params.id, $state.params.mode));

                    if ($scope.selectedItem.zone) {
                        $scope.setZoneById($scope.selectedItem.zone.id);
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

    $scope.isNewCertificate = function () {
        return $scope.titleState == DEFAULT_VALUES.ITEM_STATES.NEW.title;
    }

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
        if(StatusService.getStatusById(status.id).code >= minStatus.CODE){
            return true;
        }
        return false;
    };

    $scope.sendMail = function (subject, observations) {
        var manager = ManagerService.getManagerById($scope.selectedItem.manager.id);        
        CertificateService.sendMail(manager, subject, observations);
    };

    $scope.setCommittedDate = function(committedDate){
        if($scope.selectedItem){
            $scope.selectedItem.committedDate = new moment(committedDate).locale('es');
        }
    };

    $scope.attachmentFilesChanged = function (elem) {
        $scope.attachmentElement = (elem);
    };

    $scope.addAttachment = function(attachmentName){
                
        if($scope.selectedItem && $scope.attachmentElement && attachmentName){
            var file = $scope.attachmentElement.files[0];
            var attachment = {
                fileId: 0,
                name: file.name,
                title: attachmentName,
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

    $scope.addDocument = function(documentName){

        if($scope.selectedItem && $scope.documentElement && documentName){
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
                name: file.name,
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

    $scope.initController();

}]);



