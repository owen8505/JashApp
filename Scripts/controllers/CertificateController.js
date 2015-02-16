'use strict';

Jash.controller('CertificateController',['$scope','$rootScope', '$state', 'CertificateService', 'DEFAULT_VALUES' ,function($scope, $rootScope, $state, CertificateService, DEFAULT_VALUES){

    //Certificado seleccionado
    $scope.selectedItem = undefined;
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

    $scope.initController = function(){

        switch ($state.current.state){
            case DEFAULT_VALUES.ITEM_STATES.NEW.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.NEW.title;
                $scope.createCertificate();
                break;

            case DEFAULT_VALUES.ITEM_STATES.EDIT.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.EDIT.title;
                if($state.params){
                    $scope.selectedItem = angular.copy(CertificateService.getCertificateById($state.params.id));
                }

                break;

            case DEFAULT_VALUES.ITEM_STATES.VIEW.code:
                $scope.titleState = DEFAULT_VALUES.ITEM_STATES.VIEW.title;
                break;

            default :
                break;
        }

        angular.forEach($scope.zones, function (zone, index) {
            $scope.zonesDropdown.push({
                text: zone.title,
                click: 'setZone('+index+')'
            });
        });

        angular.forEach($scope.parcels, function (parcel, index) {
            $scope.parcelsDropdown.push({
                text: parcel.title,
                click: 'setParcel('+index+')'
            });
        });

    };


    $scope.createCertificate = function () {
        $scope.selectedItem = angular.copy(CertificateService.createCertificate());
    };

    $scope.saveCertificate = function(){
        CertificateService.updateCertificate($scope.selectedItem);
        $scope.selectedItem = undefined;        
    };

    $scope.setZone = function(zoneIndex){
        if($scope.selectedItem){
            $scope.selectedItem.zone = $scope.zones[zoneIndex];
            $scope.managersDropdown = [];

            angular.forEach($scope.managers, function (manager, index) {
                if($scope.selectedItem.zone.id == manager.zone.id){
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

    $scope.isValidForm = function(){
        var isValidForm = false;
        if($scope.selectedItem){
            switch($scope.selectedItem.status.code){
                case 1:
                    if($scope.selectedItem.owner && $scope.selectedItem.inscription && $scope.selectedItem.description && $scope.selectedItem.folio){
                        isValidForm = true;
                    }
                    break;
                case 2:
                    isValidForm = true;
                    break;
                case 3:
                    isValidForm = true;
                    break;
                case 4:
                    isValidForm = true;
                    break;
                case 5:
                    isValidForm = true;
                    break;
            }
        }
        return isValidForm;
    }

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

    $scope.sendMail = function(observations){
        console.log(observations)
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

            var attachment = {
                name: attachmentName,
                attachmentFile: $scope.attachmentElement.files[0]
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

    $scope.initController();

}]);



