'use strict';

Jash.controller('CertificateController', ['$scope', '$rootScope', '$state', '$popover', 'CertificateService', 'DEFAULT_VALUES', function ($scope, $rootScope, $state, $popover, CertificateService, DEFAULT_VALUES) {

    //Certificado seleccionado
    $scope.selectedItem = undefined;
    $scope.subject = undefined;
    $scope.observations = undefined;
    $scope.attachmentElement = undefined;
    $scope.attachmentName = undefined
    $scope.documentName = undefined;
    $scope.invoiceName = undefined;
    $scope.committedDate = undefined;

    $scope.parcelsDropdown = [];
    $scope.managersDropdown = [];
    $scope.zonesDropdown = [];    


    $scope.$on('itemSaved', function () {
        $state.go('dashboard');
    });

    $scope.$on('mailSent', function () {
        var popoverElement = angular.element('#request-info-trigger');        
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
                    $scope.selectedItem = angular.copy(CertificateService.getCertificateById($state.params.id));
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
        $scope.selectedItem = undefined;        
    };

    $scope.updateCertificate = function () {
        CertificateService.updateCertificate($scope.selectedItem);
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
        }
    };

    $scope.setManager = function (managerIndex) {
        if($scope.selectedItem){
            $scope.selectedItem.manager = $scope.managers[managerIndex];
        }
    };

    $scope.setParcel = function (parcelIndex) {
        if($scope.selectedItem){
            $scope.selectedItem.parcel = $scope.parcels[parcelIndex];
            console.log($scope.selectedItem.parcel)
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

    $scope.isCurrentStatus = function (status) {
      return true;
    };

    $scope.sendMail = function (subject,observations) {        
        CertificateService.sendMail($scope.selectedItem.manager, subject, observations);
    };

    $scope.setCommittedDate = function(committedDate){
        if($scope.selectedItem){
            $scope.selectedItem.committedDate = new moment(committedDate).locale('es');
        }
        console.log( $scope.selectedItem)
    };

    $scope.attachmentFilesChanged = function (elem) {
        $scope.attachmentElement = (elem);
    };

    $scope.addAttachment = function(attachmentName){
                
        if($scope.selectedItem){
            var file = $scope.attachmentElement.files[0];
            var attachment = {
                folio: 0,
                name: file.name,
                title: attachmentName,
                url: undefined,
                attachmentFile: file
            };
            
            $scope.selectedItem.attachments.push(attachment)            
            angular.element($scope.attachmentElement).val(null);
            $scope.attachmentElement = undefined;
            $scope.attachmentName = undefined;
        }
    };

    $scope.addDocument = function(documentName){

        if($scope.selectedItem){

            var document = {
                name: documentName,
                attachmentFile: ($scope.attachmentElement) ? $scope.attachmentElement.files[0] : undefined
            };

            $scope.selectedItem.documents.push(document)
            $scope.documentName = undefined;
            angular.element($scope.attachmentElement).val(null);
            $scope.attachmentElement = undefined;


        }
    };

    $scope.addInvoice = function(invoiceName){

        if($scope.selectedItem){

            var invoice = {
                name: invoiceName,
                attachmentFile: ($scope.attachmentElement) ? $scope.attachmentElement.files[0] : undefined
            };

            $scope.selectedItem.invoices.push(invoice)
            $scope.invoiceName = undefined;
            angular.element($scope.attachmentElement).val(null);
            $scope.attachmentElement = undefined;
            console.log(invoice)

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



