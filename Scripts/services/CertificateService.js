Jash.factory('CertificateService', ["$http", "$q", "$rootScope", "ContextService", "DEFAULT_VALUES", function($http, $q, $rootScope, ContextService, DEFAULT_VALUES){

    var certificates = [];
    var lastCertificates = [];
    var warningList = [];    
    var SPWeb, context, appContext, list, attachmentLibraryName, fileList;

    var getDeliveryDate = function (date) {
        var copyDate = angular.copy(date);
        return copyDate.add(DEFAULT_VALUES.DELIVERY_RANGES.CERTIFICATE, 'days');
    };

    var getCertificateById = function(certificateId){
        var certificate = undefined;
        for(var certificateIndex=0; certificateIndex<certificates.length; certificateIndex++){
            if(certificates[certificateIndex].id == certificateId){
                certificate = certificates[certificateIndex];
                break;
            }
        }

        for(var certificateIndex=0; certificateIndex<warningList.length; certificateIndex++){
            if(warningList[certificateIndex].id == certificateId){
                certificate = warningList[certificateIndex];
                break;
            }
        }

        return certificate;
    };

    var deleteCertificateById = function (certificateId, certificatesArray) {
        var certificate = undefined;
        for (var certificateIndex = 0; certificateIndex < certificatesArray.length; certificateIndex++) {

            if (certificatesArray[certificateIndex].id == certificateId) {
                certificatesArray.splice(certificateIndex, 1);
                break;
            }
        }
    };

    var getLastCertificates = function () {
        lastCertificates = [];

        var queryString = '<View><Query>' +
                            '<OrderBy>' +
                               '<FieldRef Name=\'ID\' Ascending="FALSE" /><FieldRef Name=\'Folio\' Ascending="FALSE" />' +
                            '</OrderBy>' +
                          '</Query><RowLimit>5</RowLimit></View></View>';
        var queryCAML = new SP.CamlQuery();
        queryCAML.set_viewXml(queryString);

        var items = list.getItems(queryCAML);
        context.load(items);
        context.executeQueryAsync(
             function () {
                 var listItemEnumerator = items.getEnumerator();
                 while (listItemEnumerator.moveNext()) {
                     var item = listItemEnumerator.get_current();

                     var certificate = {
                         id: item.get_id(),
                         folio: item.get_item('Title'),
                         creationDate: new moment(item.get_item('Creacion')),
                         deliveryDate: new moment(item.get_item('Entrega')),
                         owner: item.get_item('Propietario'),
                         inscription: item.get_item('Inscripcion'),
                         description: item.get_item('Descripcion'),
                         status: (item.get_item('Estatus')) ? { id: item.get_item('Estatus').get_lookupId(), title: item.get_item('Estatus').get_lookupValue() } : undefined
                     };

                     certificate.attachments = getDocuments(attachmentLibraryName, certificate.folio);
                     lastCertificates.push(certificate);
                 }

                 $rootScope.$broadcast('applyChanges');

             },
            function (response, args) {
                console.log(args.get_message())
            }
        );

        return lastCertificates;
    };

    var getAllCertificates = function () {

        certificates = [];
        var queryCAML = '';
        var items = list.getItems(queryCAML);

        context.load(items);        
        context.executeQueryAsync(
             function () {
                 var listItemEnumerator = items.getEnumerator();
                 while (listItemEnumerator.moveNext()) {
                     var item = listItemEnumerator.get_current();

                     var certificate = {
                         id: item.get_id(),
                         folio: item.get_item('Title'),
                         creationDate: new moment(item.get_item('Creacion')),
                         deliveryDate: new moment(item.get_item('Entrega')),
                         owner: item.get_item('Propietario'),
                         inscription: item.get_item('Inscripcion'),
                         description: item.get_item('Descripcion'),
                         status: (item.get_item('Estatus')) ? { id: item.get_item('Estatus').get_lookupId(), title: item.get_item('Estatus').get_lookupValue() } : undefined,
                     };                     

                     certificate.attachments = getDocuments(attachmentLibraryName, certificate.folio);
                     certificates.push(certificate);
                 }

                 $rootScope.$broadcast('applyChanges');
             },
            function (response, args) {
                console.log(args.get_message())
            }
        );

        return certificates;
    }

    var getDocuments = function (libraryName, folio) {

        var documents = [];

        var library = appContext.get_web().get_lists().getByTitle(libraryName);
        var queryString = '<View Scope=\'RecursiveAll\'><Query>' +
                            '<Where>' +
                               '<Eq><FieldRef Name=\'Folio\' /><Value Type=\'Text\'>' + folio + '</Value></Eq>' +
                            '</Where>' +
                          '</Query></View>';        
        var queryCAML = new SP.CamlQuery();        
        queryCAML.set_viewXml(queryString);
        
        var items = library.getItems(queryCAML);
        
        context.load(items);
        context.executeQueryAsync(
             function () {
                 
                 var listItemEnumerator = items.getEnumerator();
                 while (listItemEnumerator.moveNext()) {
                     var item = listItemEnumerator.get_current();                     
                     var file = item.get_file();

                     context.load(file);
                     context.executeQueryAsync(
                         function () {

                             var document = {
                                 folio: item.get_item('Folio'),
                                 name: file.get_name(),
                                 title: file.get_title(),
                                 url: file.get_linkingUrl()
                             };

                             documents.push(document);
                         },
                         function (response, args) {
                             console.log(args.get_message());
                         }
                     );
                     
                 }

             },
            function (response, args) {               
                console.log(args.get_message());
            }
        );
        
        return documents;

    };

    var saveDocuments = function (libraryName, folio, documentsArray) {

        angular.forEach(documentsArray, function (document) {
            var reader = new FileReader();
            reader.onload = function () {
                var library = appContext.get_web().get_lists().getByTitle(libraryName);

                var fileCreateInfo = new SP.FileCreationInformation();
                fileCreateInfo.set_url(document.attachmentFile.name);
                fileCreateInfo.set_overwrite(true);
                fileCreateInfo.set_content(new SP.Base64EncodedByteArray());

                var arr = convertDataURIToBinary(this.result);
                for (var i = 0; i < arr.length; ++i) {
                    fileCreateInfo.get_content().append(arr[i]);                    
                }

                var newFile = library.get_rootFolder().get_files().add(fileCreateInfo);

                context.load(newFile, 'ListItemAllFields');
                context.executeQueryAsync(
                    function () {
                        var fileList = appContext.get_web().get_lists().getByTitle(libraryName);
                        var item = fileList.getItemById(newFile.get_listItemAllFields().get_id());

                        item.set_item('Folio', folio);
                        item.update();

                        context.load(item);
                        context.executeQueryAsync(
                            function () {
                                console.log('Success');
                            },
                            function (response, args) {
                                console.log(args.get_message());
                            }
                        );

                    },
                    function (response, args) {
                        console.log(args.get_message());
                    }
                );
            };

            reader.readAsDataURL(document.attachmentFile);
            
        });
    };

    var convertDataURIToBinary = function(dataURI){
        var BASE64_MARKER = ';base64,';
        var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
        var base64 = dataURI.substring(base64Index);
        var raw = window.atob(base64);
        var rawLength = raw.length;
        var array = new Uint8Array(new ArrayBuffer(rawLength));
 
        for (i = 0; i < rawLength; i++){
            array[i] = raw.charCodeAt(i);
        }
        return array;
    }

    var getWarningCertificates = function () {
        return warningList;
    };

    var createCertificate = function () {

        var now = moment().locale('es');

        var certificate = {
            id: 0,
            type: 'CERTIFICATE',            
            folio: undefined,
            creationDate: now,
            deliveryDate: getDeliveryDate(now),
            owner: undefined,
            description: undefined,
            inscription: undefined,
            attachments: [],
            status: {id:1, title:'Nuevo'},
            zone: undefined,
            manager: undefined,
            committedDate: undefined,
            cost: undefined,
            payment: false,
            parcel: undefined,
            trackingNumber: undefined,
            documents: [],
            invoices: [],
            cashed: false,            

        };        

        return certificate;
    };

    var saveCertificate = function (certificate) {

        var itemInfo = new SP.ListItemCreationInformation();
        var item = list.addItem(itemInfo);

        item.set_item('Title', certificate.folio);
        item.set_item('Creacion', certificate.creationDate.toISOString());
        item.set_item('Entrega', certificate.deliveryDate.toISOString());
        item.set_item('Propietario', certificate.owner);
        item.set_item('Descripcion', certificate.description);
        item.set_item('Inscripcion', certificate.inscription);
        item.set_item('Estatus', new SP.FieldLookupValue().set_lookupId(certificate.status.id));        
        item.update();

        context.load(item);
        context.executeQueryAsync(
            function () {

                if (certificate.id == 0) {

                    certificate.id = item.get_id();
                    certificate.attachments = saveDocuments(attachmentLibraryName, certificate.folio, certificate.attachments);

                    if (lastCertificates.length > 4) {
                        lastCertificates.splice(1, 1);
                    }
                    lastCertificates.push(certificate);
                    certificates.push(certificate);
                    
                }

                $rootScope.$broadcast('itemSaved');
                

            },
            function (response, args) {
                console.log(args.get_message());
            }
      );
               
    };

    var init = function () {
        SPWeb = ContextService.getSpWeb();
        context = new SP.ClientContext(SPWeb.appWebUrl);
        appContext = new SP.AppContextSite(context, SPWeb.hostUrl);
        list = appContext.get_web().get_lists().getByTitle('Certificados');

        attachmentLibraryName = 'Adjuntos de certificados';
    };


    var updateCertificate = function (certificate) {
        var originalCertificate = getCertificateById(certificate.id);

        originalCertificate.folio = certificate.folio;
        originalCertificate.owner = certificate.owner;
        originalCertificate.description = certificate.description;
        originalCertificate.inscription = certificate.inscription;
        originalCertificate.attachments = certificate.attachments;
        originalCertificate.status = certificate.attachments;
        originalCertificate.zone = certificate.zone;
        originalCertificate.manager = certificate.manager;
        originalCertificate.committedDate = certificate.committedDate;
        originalCertificate.cost = certificate.cost;
        originalCertificate.payment = certificate.payment;
        originalCertificate.parcel = certificate.parcel;
        originalCertificate.trackingNumber = certificate.trackingNumber;
        originalCertificate.documents = certificate.documents;
        originalCertificate.invoices = certificate.invoices;
        originalCertificate.cashed = certificate.cashed;

        return certificates;
    };

    init();

    return {
        createCertificate : createCertificate,
        getAllCertificates: getAllCertificates,
        getLastCertificates: getLastCertificates,
        getWarningCertificates: getWarningCertificates,
        getCertificateById: getCertificateById,
        updateCertificate: updateCertificate,
        saveCertificate: saveCertificate

    }

}]);

