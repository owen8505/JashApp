Jash.factory('CertificateService', ["$http", "$q", "$rootScope", "$cookieStore", "ContextService", "DEFAULT_VALUES", function ($http, $q, $rootScope, $cookieStore, ContextService, DEFAULT_VALUES) {

    var certificates = [];
    var lastCertificates = [];
    var warningList = [];    
    var SPWeb, context, appContext, list, attachmentLibraryName, fileList, mailList;

    var getDeliveryDate = function (date) {
        var copyDate = angular.copy(date);
        return copyDate.add(DEFAULT_VALUES.DELIVERY_RANGES.CERTIFICATE, 'days');
    };

    var getCertificateById = function (certificateId) {        
        var certificate = undefined;
        for (var certificateIndex = 0; certificateIndex < lastCertificates.length; certificateIndex++) {
            if (lastCertificates[certificateIndex].id == certificateId) {
                certificate = lastCertificates[certificateIndex];
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
                         type: 'CERTIFICATE',
                         id: item.get_id(),
                         folio: item.get_item('Title'),
                         creationDate: new moment(item.get_item('Creacion')),
                         deliveryDate: new moment(item.get_item('Entrega')),
                         owner: item.get_item('Propietario'),
                         inscription: item.get_item('Inscripcion'),
                         description: item.get_item('Descripcion'),
                         status: (item.get_item('Estatus')) ? { id: item.get_item('Estatus').get_lookupId(), title: item.get_item('Estatus').get_lookupValue() } : undefined,
                         zone: (item.get_item('Region')) ? { id: item.get_item('Region').get_lookupId(), title: item.get_item('Region').get_lookupValue() } : undefined,
                         manager: (item.get_item('Gestor')) ? { id: item.get_item('Gestor').get_lookupId(), title: item.get_item('Gestor').get_lookupValue() } : undefined,
                         committedDate: (item.get_item('Comprometida')) ? new moment(item.get_item('Comprometida')) : undefined,
                         cost: (item.get_item('Costo')) ? item.get_item('Costo') : undefined,
                         payment: item.get_item('Pagado'),
                         parcel: (item.get_item('Paqueteria')) ? { id: item.get_item('Paqueteria').get_lookupId(), title: item.get_item('Region').get_lookupValue() } : undefined,
                         trackingNumber: (item.get_item('Guia')) ? item.get_item('Guia') : undefined,
                         documents: [],
                         invoices: [],
                         cashed: item.get_item('Cobrado')
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
                         type: 'CERTIFICATE',
                         id: item.get_id(),
                         folio: item.get_item('Title'),
                         creationDate: new moment(item.get_item('Creacion')),
                         deliveryDate: new moment(item.get_item('Entrega')),
                         owner: item.get_item('Propietario'),
                         inscription: item.get_item('Inscripcion'),
                         description: item.get_item('Descripcion'),
                         status: (item.get_item('Estatus')) ? { id: item.get_item('Estatus').get_lookupId(), title: item.get_item('Estatus').get_lookupValue() } : undefined,
                         zone: (item.get_item('Region')) ? { id: item.get_item('Region').get_lookupId(), title: item.get_item('Region').get_lookupValue() } : undefined,
                         manager: (item.get_item('Gestor')) ? { id: item.get_item('Gestor').get_lookupId(), title: item.get_item('Gestor').get_lookupValue() } : undefined,
                         committedDate: (item.get_item('Comprometida')) ? new moment(item.get_item('Comprometida')) : undefined,
                         cost: (item.get_item('Costo')) ? item.get_item('Costo') : undefined,
                         payment: item.get_item('Pagado'),
                         parcel: (item.get_item('Paqueteria')) ? { id: item.get_item('Paqueteria').get_lookupId(), title: item.get_item('Region').get_lookupValue() } : undefined,
                         trackingNumber: (item.get_item('Guia')) ? item.get_item('Guia') : undefined,
                         documents: [],
                         invoices: [],
                         cashed: item.get_item('Cobrado')
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

    var updateCertificate = function (certificate) {

        var item = list.getItemById(certificate.id);
        item.set_item('Title', certificate.folio);
        item.set_item('Creacion', certificate.creationDate.toISOString());
        item.set_item('Entrega', certificate.deliveryDate.toISOString());
        item.set_item('Propietario', certificate.owner);
        item.set_item('Descripcion', certificate.description);
        item.set_item('Inscripcion', certificate.inscription);
        item.set_item('Estatus', new SP.FieldLookupValue().set_lookupId(certificate.status.id));
        item.set_item('Region', new SP.FieldLookupValue().set_lookupId((certificate.zone ? certificate.zone.id : undefined )));
        item.set_item('Gestor', new SP.FieldLookupValue().set_lookupId((certificate.manager ? certificate.manager.id : undefined )));
        item.set_item('Comprometida', certificate.committedDate.toISOString());
        item.set_item('Costo', certificate.cost);
        item.set_item('Pagado', certificate.payment);
        item.set_item('Paqueteria', new SP.FieldLookupValue().set_lookupId((certificate.parcel ? certificate.parcel.id : undefined )));
        item.set_item('Guia', certificate.trackingNumber);
        item.set_item('Cobrado', certificate.cashed);
        item.update();

        context.load(item);
        context.executeQueryAsync(
            function () {
                var originalElement = getCertificateById(certificate.id);
                originalElement.folio = certificate.folio;
                originalElement.creationDate = certificate.creationDate;
                originalElement.deliveryDate = certificate.deliveryDate;
                originalElement.description = certificate.description;
                originalElement.inscription = certificate.inscription;
                originalElement.status = certificate.status;
                originalElement.zone = certificate.zone;
                originalElement.manager = certificate.manager;
                originalElement.committedDate = certificate.committedDate;
                originalElement.cost = certificate.cost;
                originalElement.payment = certificate.payment;
                originalElement.parcel = certificate.parcel;
                originalElement.trackingNumber = certificate.trackingNumber;
                originalElement.cashed = certificate.cashed;

                $rootScope.$broadcast('itemUpdated');
            },

            function (response, args) {
                console.log(args.get_message());
            }
        );
    };

    var sendMail = function (manager, subject, observations) {        
        var itemInfo = new SP.ListItemCreationInformation();
        var item = mailList.addItem(itemInfo);

        item.set_item('Title', subject);
        item.set_item('toEmail', manager.mail);
        item.set_item('bodyEmail', observations);
        item.update();

        context.load(item);
        context.executeQueryAsync(
            function () {
                console.log('ENVIE EL CORREO')
                $rootScope.$broadcast('mailSent');
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
        mailList = appContext.get_web().get_lists().getByTitle('Correos electronicos');
        
        attachmentLibraryName = 'Adjuntos de certificados';
    };

    init();

    return {
        createCertificate : createCertificate,
        getAllCertificates: getAllCertificates,
        getLastCertificates: getLastCertificates,
        getWarningCertificates: getWarningCertificates,
        getCertificateById: getCertificateById,
        updateCertificate: updateCertificate,
        saveCertificate: saveCertificate,
        sendMail: sendMail

    }

}]);

