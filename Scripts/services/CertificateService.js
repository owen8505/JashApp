Jash.factory('CertificateService', ["$http", "$q", "$rootScope", "$cookieStore", "$state", "$timeout", "ContextService", "StatusService", "usSpinnerService", "DEFAULT_VALUES", function ($http, $q, $rootScope, $cookieStore, $state, $timeout, ContextService, StatusService, usSpinnerService, DEFAULT_VALUES) {

    var certificates = [];
    var lastCertificates = [];
    var warningList = [];    
    var SPWeb, context, appContext, list, libraries, mailList, documentsTotal, documentsProcessed;

    var getDeliveryDate = function (date) {
        var copyDate = angular.copy(date);
        var days = DEFAULT_VALUES.DELIVERY_RANGES.CERTIFICATE;

        while (days > 0) {
            copyDate = copyDate.add(1, 'days');
            // decrease "days" only if it's a weekday.
            if (copyDate.isoWeekday() !== 6 && copyDate.isoWeekday() !== 7) {
                days -= 1;
            }
        }

        return copyDate;
    };

    var getCertificateById = function (certificateId, mode) {
        var certificate = undefined;
        var certificatesArray = [];

        switch(mode) {
            case 'all':
                certificatesArray = certificates;
                break;
            case 'last':
                certificatesArray = lastCertificates;
                break;
            default:
                break;
        }

        for (var certificateIndex = 0; certificateIndex < certificatesArray.length; certificateIndex++) {
            if (certificatesArray[certificateIndex].id == certificateId) {
                certificate = certificatesArray[certificateIndex];
                break;
            }
        }
        return certificate;
    };

    var deleteCertificateById = function (certificateId, mode) {
        var certificate = undefined;
        var certificatesArray = [];

        switch (mode) {
            case 'all':
                certificatesArray = certificates;
                break;
            case 'last':
                certificatesArray = lastCertificates;
                break;
            default:
                break;
        }
        for (var certificateIndex = 0; certificateIndex < certificatesArray.length; certificateIndex++) {

            if (certificatesArray[certificateIndex].id == certificateId) {
                certificatesArray.splice(certificateIndex, 1);
                break;
            }
        }
    };

    var getLastCertificates = function (reload) {

        lastCertificates = [];
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
                        lawyer: item.get_item('Abogado'),
                        status: (item.get_item('Estatus')) ? { id: item.get_item('Estatus').get_lookupId(), name: item.get_item('Estatus').get_lookupValue() } : undefined,
                        zone: (item.get_item('Region')) ? { id: item.get_item('Region').get_lookupId(), name: item.get_item('Region').get_lookupValue() } : undefined,
                        manager: (item.get_item('Gestor')) ? { id: item.get_item('Gestor').get_lookupId(), name: item.get_item('Gestor').get_lookupValue() } : undefined,
                        committedDate: (item.get_item('Comprometida')) ? new moment(item.get_item('Comprometida')) : undefined,
                        cost: (item.get_item('Costo')) ? item.get_item('Costo') : undefined,
                        payment: item.get_item('Pagado'),
                        paymentComments: item.get_item('Observaciones_x0020_pagado'),
                        received: item.get_item('Recibido'),
                        realDeliveryDate: (item.get_item('Entrega_x0020_real')) ? new moment(item.get_item('Entrega_x0020_real')) : undefined,
                        delivered: item.get_item('Entregado'),
                        cashed: item.get_item('Cobrado'),
                        parcel: (item.get_item('Paqueteria')) ? { id: item.get_item('Paqueteria').get_lookupId(), name: item.get_item('Paqueteria').get_lookupValue() } : undefined,
                        trackingNumber: (item.get_item('Guia')) ? item.get_item('Guia') : undefined,
                        invoiceDate: (item.get_item('Fecha_x0020_de_x0020_facturacion')) ? new moment(item.get_item('Fecha_x0020_de_x0020_facturacion')) : undefined,
                        invoiceFolio: item.get_item('Folio_x0020_de_x0020_factura')
                    };

                    var anomalyNowDate = moment().startOf('day');

                    if(certificate.deliveryDate && anomalyNowDate.diff(angular.copy(certificate.deliveryDate).startOf('day'), 'days') >= 1 && !certificate.delivered){
                        // Si ya se pasó la fecha de entrega y no hemos generado el certificado
                        certificate.anomaly = {
                            status: DEFAULT_VALUES.ANOMALY_STATUS.ERROR,
                            message: 'La fecha de entrega expiró y el certificado no ha sido generado.'
                        }
                    } else if(certificate.deliveryDate && anomalyNowDate.diff(angular.copy(certificate.deliveryDate).startOf('day'), 'days') >= -5 && !certificate.delivered){
                        // Si faltan cinco días o menos para la fecha de entrega y no hemos generado el certificado
                        certificate.anomaly = {
                            status: DEFAULT_VALUES.ANOMALY_STATUS.ERROR,
                            message: 'La fecha de entrega está próxima y el certificado no ha sido generado.'
                        }
                    } else if(certificate.creationDate && anomalyNowDate.diff(angular.copy(certificate.creationDate).startOf('day'), 'days') >= 1 && !certificate.manager){
                        // Si ya pasó un día y no hemos asignado un gestor

                        certificate.anomaly = {
                            status: DEFAULT_VALUES.ANOMALY_STATUS.WARNING,
                            message: 'El certificado aun no tiene ningún gestor asignado.'
                        }
                    } else if(certificate.creationDate && anomalyNowDate.diff(angular.copy(certificate.creationDate).startOf('day'), 'days') >= 2 && !certificate.committedDate){
                        // Si ya pasaron dos días y aun no asignamos una fecha comprometida

                        certificate.anomaly = {
                            status: DEFAULT_VALUES.ANOMALY_STATUS.WARNING,
                            message: 'El certificado aun no tiene una fecha comprometida.'
                        }
                    } else if(certificate.committedDate && anomalyNowDate.diff(angular.copy(certificate.committedDate).startOf('day'), 'days') >= 0 && !certificate.trackingNumber){
                        // Si ya es la fecha comprometida y no hay datos de envío

                        certificate.anomaly = {
                            status: DEFAULT_VALUES.ANOMALY_STATUS.WARNING,
                            message: 'Aun no se cuenta con una guía de envío de los documentos.'
                        }
                    }

                    certificate.attachments = getDocuments(libraries.attachments, certificate);
                    certificate.documents = getDocuments(libraries.documents, certificate);
                    lastCertificates.push(certificate);
                }

                $rootScope.$broadcast('lastCertificatesLoaded', reload);
                $rootScope.$broadcast('applyChanges');
            },
            function (response, args) {
                console.log(args.get_message())
            }
        );

        return lastCertificates;
    };

    var getAllCertificates = function (reload) {

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
                         lawyer: item.get_item('Abogado'),
                         status: (item.get_item('Estatus')) ? { id: item.get_item('Estatus').get_lookupId(), name: item.get_item('Estatus').get_lookupValue() } : undefined,
                         zone: (item.get_item('Region')) ? { id: item.get_item('Region').get_lookupId(), name: item.get_item('Region').get_lookupValue() } : undefined,
                         manager: (item.get_item('Gestor')) ? { id: item.get_item('Gestor').get_lookupId(), name: item.get_item('Gestor').get_lookupValue() } : undefined,
                         committedDate: (item.get_item('Comprometida')) ? new moment(item.get_item('Comprometida')) : undefined,
                         cost: (item.get_item('Costo')) ? item.get_item('Costo') : undefined,
                         payment: item.get_item('Pagado'),
                         paymentComments: item.get_item('Observaciones_x0020_pagado'),
                         received: item.get_item('Recibido'),
                         realDeliveryDate: (item.get_item('Entrega_x0020_real')) ? new moment(item.get_item('Entrega_x0020_real')) : undefined,
                         delivered: item.get_item('Entregado'),
                         cashed: item.get_item('Cobrado'),
                         parcel: (item.get_item('Paqueteria')) ? { id: item.get_item('Paqueteria').get_lookupId(), name: item.get_item('Paqueteria').get_lookupValue() } : undefined,
                         trackingNumber: (item.get_item('Guia')) ? item.get_item('Guia') : undefined,
                         invoiceDate: (item.get_item('Fecha_x0020_de_x0020_facturacion')) ? new moment(item.get_item('Fecha_x0020_de_x0020_facturacion')) : undefined,
                         invoiceFolio: item.get_item('Folio_x0020_de_x0020_factura')
                     };

                     var anomalyNowDate = moment().startOf('day');

                     if(certificate.deliveryDate && anomalyNowDate.diff(angular.copy(certificate.deliveryDate).startOf('day'), 'days') >= 1 && !certificate.delivered){
                         // Si ya se pasó la fecha de entrega y no hemos generado el certificado
                         certificate.anomaly = {
                             status: DEFAULT_VALUES.ANOMALY_STATUS.ERROR,
                             message: 'La fecha de entrega expiró y el certificado no ha sido generado.'
                         }
                     } else if(certificate.deliveryDate && anomalyNowDate.diff(angular.copy(certificate.deliveryDate).startOf('day'), 'days') >= -5 && !certificate.delivered){
                         // Si faltan cinco días o menos para la fecha de entrega y no hemos generado el certificado
                         certificate.anomaly = {
                             status: DEFAULT_VALUES.ANOMALY_STATUS.ERROR,
                             message: 'La fecha de entrega está próxima y el certificado no ha sido generado.'
                         }
                     } else if(certificate.creationDate && anomalyNowDate.diff(angular.copy(certificate.creationDate).startOf('day'), 'days') >= 1 && !certificate.manager){
                         // Si ya pasó un día y no hemos asignado un gestor

                         certificate.anomaly = {
                             status: DEFAULT_VALUES.ANOMALY_STATUS.WARNING,
                             message: 'El certificado aun no tiene ningún gestor asignado.'
                         }
                     } else if(certificate.creationDate && anomalyNowDate.diff(angular.copy(certificate.creationDate).startOf('day'), 'days') >= 2 && !certificate.committedDate){
                         // Si ya pasaron dos días y aun no asignamos una fecha comprometida

                         certificate.anomaly = {
                             status: DEFAULT_VALUES.ANOMALY_STATUS.WARNING,
                             message: 'El certificado aun no tiene una fecha comprometida.'
                         }
                     } else if(certificate.committedDate && anomalyNowDate.diff(angular.copy(certificate.committedDate).startOf('day'), 'days') >= 0 && !certificate.trackingNumber){
                         // Si ya es la fecha comprometida y no hay datos de envío

                         certificate.anomaly = {
                             status: DEFAULT_VALUES.ANOMALY_STATUS.WARNING,
                             message: 'Aun no se cuenta con una guía de envío de los documentos.'
                         }
                     }

                     certificate.attachments = getDocuments(libraries.attachments, certificate);
                     certificate.documents = getDocuments(libraries.documents, certificate);
                     certificates.push(certificate);
                 }

                 $rootScope.$broadcast('certificatesLoaded', reload);
                 $rootScope.$broadcast('applyChanges');
             },
            function (response, args) {
                console.log(args.get_message())
            }
        );

        return certificates;
    };

    var getDocuments = function (library, certificate) {

        var documents = [];

        var url = SPWeb.appWebUrl + "/_api/SP.AppContextSite(@target)" +
            "/web/lists/getbytitle('" + library.name + "')/items?" +
            "@target='" + SPWeb.hostUrl + "'" +
            "&$filter=Folio eq '" + certificate.id + "'" +
            "&$expand=File";

        var executor = new SP.RequestExecutor(SPWeb.appWebUrl);
        executor.executeAsync(
            {
                url: url,
                method: "GET",
                headers: {
                    "Accept": "application/json; odata=verbose"
                },
                contentType: "application/json;odata=verbose",
                success: function (data) {
                    var results = eval(JSON.parse(data.body));

                    angular.forEach(results.d.results, function(item){
                        var document = {
                            fileId: item.ID,
                            name: item.File.Name,
                            title: item.Title,
                            url: item.File.ServerRelativeUrl
                        };

                        documents.push(document);
                    });

                    certificate[library.loadedName] = true;
                },
                error: function (response) {
                    console.log(response);
                }
            });

        return documents;

    };

    var processDocuments = function (certificate) {

        // Variable que lleva el conteo de cuantos documentos vamos a procesar
        documentsTotal = certificate.attachments.length + certificate.documents.length;

        // Variable que lleva el conteo de cuantos documentos han sido procesados
        documentsProcessed = 0;

        if (documentsTotal == 0) {
            isDocumentsProcessComplete();
        } else {
            angular.forEach(certificate.attachments, function(document){
                if (document.removed == 1) {
                    deleteDocument(libraries.attachments, certificate, document);
                } else if (document.fileId == 0) {
                    saveDocument(libraries.attachments, certificate, document);
                } else {
                    updateDocument(libraries.attachments, certificate, document);
                }
            });

            angular.forEach(certificate.documents, function(document){
                if (document.removed == 1) {
                    deleteDocument(libraries.documents, certificate, document);
                } else if (document.fileId == 0) {
                    saveDocument(libraries.documents, certificate, document);
                } else {
                    updateDocument(libraries.documents, certificate, document);
                }
            });
        }

    };

    var saveDocument = function(library, certificate, document) {

        var mode = angular.copy($state.params.mode);

        $.ajax({
            url: SPWeb.appWebUrl + "/_api/contextinfo",
            method: "POST",
            headers: { "Accept": "application/json; odata=verbose"},
            success: function (data) {
                var requestDigest = data.d.GetContextWebInformation.FormDigestValue;
                var reader = new FileReader();

                reader.onload = function (result) {

                    var url = SPWeb.appWebUrl + "/_api/SP.AppContextSite(@target)" +
                        "/web/lists/getbytitle('" + library.name + "')/rootfolder/files/add(url='" + document.name + "',overwrite=false)?" +
                        "@target='" + SPWeb.hostUrl + "'" +
                        '&$expand=ListItemAllFields';

                    var fileData = '';
                    var byteArray = new Uint8Array(result.target.result);
                    for (var i = 0; i < byteArray.byteLength; i++) {
                        fileData += String.fromCharCode(byteArray[i])
                    }

                    var executor = new SP.RequestExecutor(SPWeb.appWebUrl);
                    executor.executeAsync(
                        {
                            url: url,
                            method: "POST",
                            headers: {
                                "Accept": "application/json; odata=verbose",
                                "X-RequestDigest": requestDigest
                            },
                            contentType: "application/json;odata=verbose",
                            binaryStringRequestBody: true,
                            body: fileData,
                            success: function (data) {

                                var fileId = JSON.parse(data.body).d.ListItemAllFields.ID;
                                var fileUrl = JSON.parse(data.body).d.ServerRelativeUrl;
                                var libraryItem = library.name.split(' ').join('_x0020_') + 'Item';

                                var body = undefined;
                                if(library.type == 'document'){
                                    body = {
                                        '__metadata': {
                                            'type': 'SP.Data.' + libraryItem },
                                        'Folio': certificate.id.toString(),
                                        'Title': document.title,
                                        'Propietario': certificate.owner,
                                        'Inscripcion': certificate.inscription,
                                        'Descripcion': certificate.description
                                    }
                                } else {
                                    body = {
                                        '__metadata': {
                                            'type': 'SP.Data.' + libraryItem },
                                        'Folio': certificate.id.toString(),
                                        'Title': document.title
                                    }
                                }

                                var url = SPWeb.appWebUrl + "/_api/SP.AppContextSite(@target)" +
                                    "/web/lists/getbytitle('" + library.name + "')/items(" + fileId + ")?" +
                                    "@target='" + SPWeb.hostUrl + "'";

                                executor.executeAsync(
                                    {
                                        url: url,
                                        method: "POST",
                                        body: JSON.stringify(body),
                                        headers: {
                                            "Accept": "application/json; odata=verbose",
                                            "X-RequestDigest": requestDigest,
                                            "IF-MATCH": "*",
                                            "X-HTTP-Method": "MERGE",
                                            "content-type": "application/json;odata=verbose"
                                        },
                                        success: function (data) {
                                            var originalElement = getCertificateById(certificate.id, mode);

                                            var newDocument = {
                                                fileId: fileId,
                                                name: document.name,
                                                title: document.title,
                                                url: fileUrl
                                            };

                                            originalElement[library.arrayName].push(newDocument);

                                            documentsProcessed++;
                                            isDocumentsProcessComplete();
                                        },
                                        error: function (response) {
                                            console.log(response);

                                            documentsProcessed++;
                                            isDocumentsProcessComplete();
                                        }
                                    });


                            },
                            error: function (response) {
                                console.log(response);

                                documentsProcessed++;
                                isDocumentsProcessComplete();
                            }
                        });

                };

                reader.readAsArrayBuffer(document.file);

            },
            error: function (data, errorCode, errorMessage) {
                console.log(errorMessage);

                documentsProcessed++;
                isDocumentsProcessComplete();
            }
        });
    };

    var deleteDocument = function (library, certificate, document) {

        var mode = angular.copy($state.params.mode);

        $.ajax({
            url: SPWeb.appWebUrl + "/_api/contextinfo",
            method: "POST",
            headers: { "Accept": "application/json; odata=verbose"},
            success: function (data) {
                var requestDigest = data.d.GetContextWebInformation.FormDigestValue;

                var url = SPWeb.appWebUrl + "/_api/SP.AppContextSite(@target)" +
                    "/web/lists/getbytitle('" + library.name + "')/items('" +  document.fileId + "')?" +
                    "@target='" + SPWeb.hostUrl + "'";

                var executor = new SP.RequestExecutor(SPWeb.appWebUrl);
                executor.executeAsync(
                    {
                        url: url,
                        method: "POST",
                        headers: {
                            "Accept": "application/json; odata=verbose",
                            "X-RequestDigest": requestDigest,
                            "IF-MATCH": "*",
                            "X-HTTP-Method": "DELETE",
                            "content-type": "application/json;odata=verbose"
                        },
                        success: function (data) {
                            var originalElement = getCertificateById(certificate.id, mode);

                            for(var i=0; i<certificate[library.arrayName].length; i++){
                                if(certificate[library.arrayName][i].fileId == document.fileId){
                                    originalElement[library.arrayName].splice(i, 1);
                                    break;
                                }
                            }

                            documentsProcessed++;
                            isDocumentsProcessComplete()
                        },
                        error: function (response) {
                            console.log(response);

                            documentsProcessed++;
                            isDocumentsProcessComplete()
                        }
                    });
            },
            error: function (data, errorCode, errorMessage) {
                console.log(errorMessage);

                documentsProcessed++;
                isDocumentsProcessComplete();
            }
        });
    };

    var updateDocument = function(library, certificate, document) {

        var mode = angular.copy($state.params.mode);

        $.ajax({
            url: SPWeb.appWebUrl + "/_api/contextinfo",
            method: "POST",
            headers: { "Accept": "application/json; odata=verbose"},
            success: function (data) {
                var requestDigest = data.d.GetContextWebInformation.FormDigestValue;

                var libraryItem = library.name.split(' ').join('_x0020_') + 'Item';

                var body = undefined;
                if(library.type == 'document'){
                    body = {
                        '__metadata': {
                            'type': 'SP.Data.' + libraryItem },
                        'Title': document.title,
                        'Propietario': certificate.owner,
                        'Inscripcion': certificate.inscription,
                        'Descripcion': certificate.description
                    }
                } else {
                    body = {
                        '__metadata': {
                            'type': 'SP.Data.' + libraryItem },
                        'Title': document.title
                    }
                }

                var url = SPWeb.appWebUrl + "/_api/SP.AppContextSite(@target)" +
                    "/web/lists/getbytitle('" + library.name + "')/items(" + document.fileId + ")?" +
                    "@target='" + SPWeb.hostUrl + "'";


                var executor = new SP.RequestExecutor(SPWeb.appWebUrl);
                executor.executeAsync(
                    {
                        url: url,
                        method: "POST",
                        body: JSON.stringify(body),
                        headers: {
                            "Accept": "application/json; odata=verbose",
                            "X-RequestDigest": requestDigest,
                            "IF-MATCH": "*",
                            "X-HTTP-Method": "MERGE",
                            "content-type": "application/json;odata=verbose"
                        },
                        success: function (data) {
                            documentsProcessed++;
                            isDocumentsProcessComplete();
                        },
                        error: function (response) {
                            console.log(response);

                            documentsProcessed++;
                            isDocumentsProcessComplete();
                        }
                    });
            },
            error: function (data, errorCode, errorMessage) {
                console.log(errorMessage);

                documentsProcessed++;
                isDocumentsProcessComplete();
            }
        });

    };

    var isDocumentsProcessComplete = function() {
        if (documentsTotal == documentsProcessed){
            usSpinnerService.stop('main-spinner');

            $rootScope.$broadcast('applyChanges');
            $rootScope.$broadcast('itemUpdated');
        }
    };

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
            inscription: undefined,
            description: undefined,
            lawyer: undefined,
            attachments: [],
            status: DEFAULT_VALUES.CERTIFICATE_STATUS.NEW,
            zone: undefined,
            manager: undefined,
            committedDate: undefined,
            cost: undefined,
            payment: false,
            paymentComments: false,
            received: false,
            realDeliveryDate: undefined,
            delivered: false,
            cashed: false,
            parcel: undefined,
            trackingNumber: undefined,
            documents: [],
            invoiceDate: undefined,
            invoiceFolio: undefined
        };        

        return certificate;
    };

    var saveCertificate = function (certificate) {

        $timeout(function() {
            usSpinnerService.spin('main-spinner');
        },0);

        var itemInfo = new SP.ListItemCreationInformation();
        var item = list.addItem(itemInfo);

        item.set_item('Title', certificate.folio);
        item.set_item('Creacion', certificate.creationDate.toISOString());
        item.set_item('Entrega', certificate.deliveryDate.toISOString());
        item.set_item('Propietario', certificate.owner);
        item.set_item('Descripcion', certificate.description);
        item.set_item('Abogado', certificate.lawyer);
        item.set_item('Inscripcion', certificate.inscription);
        item.set_item('Estatus', new SP.FieldLookupValue().set_lookupId(StatusService.getStatusByCode(certificate.status.code).id));
        item.update();

        context.load(item);
        context.executeQueryAsync(
            function () {

                if (certificate.id == 0) {

                    certificate.id = item.get_id();
                    processDocuments(certificate);

                    if (lastCertificates.length > 4) {
                        lastCertificates.splice(1, 1);
                    }
                    lastCertificates.push(certificate);
                    certificates.push(certificate);
                    
                }

            },
            function (response, args) {
                console.log(args.get_message());
            }
      );
               
    };

    var updateCertificate = function (certificate) {

        $timeout(function() {
            usSpinnerService.spin('main-spinner');
        },0);

        var newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.CERTIFICATE_STATUS.NEW.code);

        if (certificate.cashed) {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.CERTIFICATE_STATUS.CASHED.code);
        } else if (certificate.delivered) {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.CERTIFICATE_STATUS.DELIVERED.code);
        } else if (certificate.received) {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.CERTIFICATE_STATUS.DOCS_RECEIVED.code);
        } else if (certificate.trackingNumber) {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.CERTIFICATE_STATUS.WAITING_DOCS.code);
        } else if (certificate.committedDate) {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.CERTIFICATE_STATUS.WAITING_SHIPPING.code);
        } else if (certificate.manager) {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.CERTIFICATE_STATUS.WAITING_CONFIRMATION.code);
        } else {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.CERTIFICATE_STATUS.NEW.code);
        }

        var item = list.getItemById(certificate.id);
        item.set_item('Title', certificate.folio);
        item.set_item('Propietario', certificate.owner);
        item.set_item('Inscripcion', certificate.inscription);
        item.set_item('Descripcion', certificate.description);
        item.set_item('Abogado', certificate.lawyer);
        item.set_item('Estatus', new SP.FieldLookupValue().set_lookupId(newStatus.id));
        item.set_item('Region', new SP.FieldLookupValue().set_lookupId((certificate.zone ? certificate.zone.id : undefined )));
        item.set_item('Gestor', new SP.FieldLookupValue().set_lookupId((certificate.manager ? certificate.manager.id : undefined )));
        item.set_item('Comprometida', (certificate.committedDate ? certificate.committedDate.toISOString() : undefined ));
        item.set_item('Costo', (certificate.cost ? certificate.cost : undefined ));
        item.set_item('Pagado', certificate.payment);
        item.set_item('Observaciones_x0020_pagado', certificate.paymentComments);
        item.set_item('Recibido', certificate.received);
        item.set_item('Entrega_x0020_real', (certificate.realDeliveryDate ? certificate.realDeliveryDate.toISOString() : undefined ));
        item.set_item('Entregado', certificate.delivered);
        item.set_item('Cobrado', certificate.cashed);
        item.set_item('Paqueteria', new SP.FieldLookupValue().set_lookupId((certificate.parcel ? certificate.parcel.id : undefined )));
        item.set_item('Guia', certificate.trackingNumber);        
        item.update();

        context.load(item);
        context.executeQueryAsync(
            function () {
                var originalElement = getCertificateById(certificate.id, $state.params.mode);
                originalElement.folio = certificate.folio;
                originalElement.owner = certificate.owner;
                originalElement.inscription = certificate.inscription;
                originalElement.description = certificate.description;
                originalElement.lawyer = certificate.lawyer;
                originalElement.status = newStatus;
                originalElement.zone = certificate.zone;
                originalElement.manager = certificate.manager;
                originalElement.committedDate = certificate.committedDate;
                originalElement.cost = certificate.cost;
                originalElement.payment = certificate.payment;
                originalElement.paymentComments = certificate.paymentComments;
                originalElement.received = certificate.received;
                originalElement.realDeliveryDate = certificate.realDeliveryDate;
                originalElement.delivered = certificate.delivered;
                originalElement.cashed = certificate.cashed;
                originalElement.parcel = certificate.parcel;
                originalElement.trackingNumber = certificate.trackingNumber;

                processDocuments(certificate);

            },

            function (response, args) {
                console.log(args.get_message());
            }
        );
    };

    var deleteCertificate = function (certificate) {

        $timeout(function () {
            usSpinnerService.spin('main-spinner');
        }, 0);

        var item = list.getItemById(certificate.id);
        item.deleteObject();

        context.executeQueryAsync(
           function () {
               angular.forEach(certificate.attachments, function (document) {
                   document.removed = 1;
               });

               angular.forEach(certificate.documents, function (document) {
                   document.removed = 1;
               });

               processDocuments(certificate);
               deleteCertificateById(certificate.id);

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
        libraries = {
            attachments: {
                type: 'attachment',
                name: 'Adjuntos de certificados',
                arrayName: 'attachments',
                loadedName: 'attachmentsLoaded'
            },
            documents: {
                type: 'document',
                name: 'Biblioteca de certificados',
                arrayName: 'documents',
                loadedName: 'documentsLoaded'
            }
        }
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
        deleteCertificate: deleteCertificate,
        sendMail: sendMail
    }

}]);

