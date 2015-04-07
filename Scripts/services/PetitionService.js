Jash.factory('PetitionService', ["$http", "$q", "$rootScope", "$cookieStore", "$state", "$timeout", "ContextService", "StatusService", "usSpinnerService", "DEFAULT_VALUES", function ($http, $q, $rootScope, $cookieStore, $state, $timeout, ContextService, StatusService, usSpinnerService, DEFAULT_VALUES) {

    var petitions = [];
    var lastPetitions = [];
    var warningList = [];    
    var SPWeb, context, appContext, list, libraries, mailList, documentsTotal, documentsProcessed;

    var getDeliveryDate = function (date) {
        var copyDate = angular.copy(date);
        var days = DEFAULT_VALUES.DELIVERY_RANGES.PETITION;

        while (days > 0) {
            copyDate = copyDate.add(1, 'days');
            // decrease "days" only if it's a weekday.
            if (copyDate.isoWeekday() !== 6 && copyDate.isoWeekday() !== 7) {
                days -= 1;
            }
        }

        return copyDate;
    };

    var getPetitionById = function (petitionId, mode) {
        var petition = undefined;
        var petitionsArray = [];

        switch(mode) {
            case 'all':
                petitionsArray = petitions;
                break;
            case 'last':
                petitionsArray = lastPetitions;
                break;
            default:
                break;
        }

        for (var petitionIndex = 0; petitionIndex < petitionsArray.length; petitionIndex++) {
            if (petitionsArray[petitionIndex].id == petitionId) {
                petition = petitionsArray[petitionIndex];
                break;
            }
        }

        return petition;
    };

    var deletePetitionById = function (petitionId, mode) {
        var petitionsArray = [];

        switch (mode) {
            case 'all':
                petitionsArray = petitions;
                break;
            case 'last':
                petitionsArray = lastPetitions;
                break;
            default:
                break;
        }
        for (var petitionIndex = 0; petitionIndex < petitionsArray.length; petitionIndex++) {

            if (petitionsArray[petitionIndex].id == petitionId) {
                petitionsArray.splice(petitionIndex, 1);
                break;
            }
        }
    };

    var getLastPetitions = function (reload) {
        lastPetitions = [];

        var queryString = '<View>' +
                            '<Query>' +
                                '<Where>' +
                                    '<Eq>' +
                                        '<FieldRef Name=\'Cobrado\'/>' +
                                        '<Value Type=\'Boolean\'>FALSE</Value>'+
                                    '</Eq>' +
                                '</Where>' +
                                '<OrderBy>' +
                                    '<FieldRef Name=\'ID\' Ascending="FALSE" />' +
                                '</OrderBy>' +
                            '</Query>' +
                            '<RowLimit>5</RowLimit>' +
                        '</View>';
        var queryCAML = new SP.CamlQuery();
        queryCAML.set_viewXml(queryString);

        var items = list.getItems(queryCAML);
        context.load(items);
        context.executeQueryAsync(
             function () {
                 var listItemEnumerator = items.getEnumerator();
                 while (listItemEnumerator.moveNext()) {
                     var item = listItemEnumerator.get_current();

                     var petition = {
                         type: 'PETITION',
                         id: item.get_id(),
                         contractNumber: item.get_item('Title'),
                         defendant: item.get_item('Demandado'),
                         court: item.get_item('Juzgado'),
                         record: item.get_item('Expediente'),
                         lawyer: item.get_item('Abogado'),
                         municipality: item.get_item('Municipio'),
                         state: (item.get_item('Estado')) ? { id: item.get_item('Estado').get_lookupId(), name: item.get_item('Estado').get_lookupValue() } : undefined,
                         status: (item.get_item('Estatus')) ? { id: item.get_item('Estatus').get_lookupId(), name: item.get_item('Estatus').get_lookupValue() } : undefined,
                         presentationDate: (item.get_item('Presentacion')) ? new moment(item.get_item('Presentacion')) : undefined,
                         assignedCourt: item.get_item('Juzgado_x0020_asignado'),
                         petitionNumber: item.get_item('Numero_x0020_de_x0020_exhorto'),
                         parcel: (item.get_item('Paqueteria')) ? { id: item.get_item('Paqueteria').get_lookupId(), name: item.get_item('Paqueteria').get_lookupValue() } : undefined,
                         trackingNumber: (item.get_item('Guia')) ? item.get_item('Guia') : undefined,
                         received: item.get_item('Recibido'),
                         deliveryDate: new moment(item.get_item('Entrega')),
                         realDeliveryDate: (item.get_item('Entrega_x0020_real')) ? new moment(item.get_item('Entrega_x0020_real')) : undefined,
                         delivered: item.get_item('Entregado'),
                         cashed: item.get_item('Cobrado'),
                         committedDate: (item.get_item('Comprometida')) ? new moment(item.get_item('Comprometida')) : undefined,
                         comments: item.get_item('Observaciones'),
                         creationDate: new moment(item.get_item('Creacion')),
                         invoiceDate: (item.get_item('Fecha_x0020_de_x0020_facturacion')) ? new moment(item.get_item('Fecha_x0020_de_x0020_facturacion')) : undefined,
                         invoiceFolio: item.get_item('Folio_x0020_de_x0020_factura')
                     };

                     var anomalyNowDate = moment().startOf('day');

                     if(petition.deliveryDate && anomalyNowDate.diff(angular.copy(petition.deliveryDate).startOf('day'), 'days') >= 1 && !petition.delivered){
                         // Si ya se pasó la fecha de entrega y no hemos entregado el exhorto
                         petition.anomaly = {
                             status: DEFAULT_VALUES.ANOMALY_STATUS.ERROR,
                             message: 'La fecha de entrega expiró y el exhorto no ha sido enviado.'
                         }
                     }  else if(petition.creationDate && anomalyNowDate.diff(angular.copy(petition.creationDate).startOf('day'), 'days') >= 5 && !petition.committedDate){
                         // Si ya pasaron cinco días y no hemos asignado una fecha de diligencia

                         petition.anomaly = {
                             status: DEFAULT_VALUES.ANOMALY_STATUS.WARNING,
                             message: 'El exhorto aun no tiene ninguna fecha de diligencia asignada.'
                         }
                     }

                     petition.attachments = getDocuments(libraries.attachments, petition);
                     petition.documents = getDocuments(libraries.documents, petition);
                     lastPetitions.push(petition);
                 }

                 $rootScope.$broadcast('petitionsLoaded', reload);
                 $rootScope.$broadcast('applyChanges');

             },
            function (response, args) {
                console.log(args.get_message())
            }
        );

        return lastPetitions;
    };

    var getAllPetitions = function (reload) {

        petitions = [];
        var queryCAML = '';
        var items = list.getItems(queryCAML);

        context.load(items);        
        context.executeQueryAsync(
             function () {
                 var listItemEnumerator = items.getEnumerator();
                 while (listItemEnumerator.moveNext()) {
                     var item = listItemEnumerator.get_current();

                     var petition = {
                         type: 'PETITION',
                         id: item.get_id(),
                         contractNumber: item.get_item('Title'),
                         defendant: item.get_item('Demandado'),
                         court: item.get_item('Juzgado'),
                         record: item.get_item('Expediente'),
                         lawyer: item.get_item('Abogado'),
                         municipality: item.get_item('Municipio'),
                         state: (item.get_item('Estado')) ? { id: item.get_item('Estado').get_lookupId(), name: item.get_item('Estado').get_lookupValue() } : undefined,
                         status: (item.get_item('Estatus')) ? { id: item.get_item('Estatus').get_lookupId(), name: item.get_item('Estatus').get_lookupValue() } : undefined,
                         presentationDate: (item.get_item('Presentacion')) ? new moment(item.get_item('Presentacion')) : undefined,
                         assignedCourt: item.get_item('Juzgado_x0020_asignado'),
                         petitionNumber: item.get_item('Numero_x0020_de_x0020_exhorto'),
                         parcel: (item.get_item('Paqueteria')) ? { id: item.get_item('Paqueteria').get_lookupId(), name: item.get_item('Paqueteria').get_lookupValue() } : undefined,
                         trackingNumber: (item.get_item('Guia')) ? item.get_item('Guia') : undefined,
                         received: item.get_item('Recibido'),
                         deliveryDate: new moment(item.get_item('Entrega')),
                         realDeliveryDate: (item.get_item('Entrega_x0020_real')) ? new moment(item.get_item('Entrega_x0020_real')) : undefined,
                         delivered: item.get_item('Entregado'),
                         cashed: item.get_item('Cobrado'),
                         committedDate: (item.get_item('Comprometida')) ? new moment(item.get_item('Comprometida')) : undefined,
                         comments: item.get_item('Observaciones'),
                         creationDate: new moment(item.get_item('Creacion')),
                         invoiceDate: (item.get_item('Fecha_x0020_de_x0020_facturacion')) ? new moment(item.get_item('Fecha_x0020_de_x0020_facturacion')) : undefined,
                         invoiceFolio: item.get_item('Folio_x0020_de_x0020_factura')
                     };

                     var anomalyNowDate = moment().startOf('day');

                     if(petition.deliveryDate && anomalyNowDate.diff(angular.copy(petition.deliveryDate).startOf('day'), 'days') >= 1 && !petition.delivered){
                         // Si ya se pasó la fecha de entrega y no hemos entregado el exhorto
                         petition.anomaly = {
                             status: DEFAULT_VALUES.ANOMALY_STATUS.ERROR,
                             message: 'La fecha de entrega expiró y el exhorto no ha sido enviado.'
                         }
                     }  else if(petition.creationDate && anomalyNowDate.diff(angular.copy(petition.creationDate).startOf('day'), 'days') >= 5 && !petition.committedDate){
                         // Si ya pasaron cinco días y no hemos asignado una fecha de diligencia

                         petition.anomaly = {
                             status: DEFAULT_VALUES.ANOMALY_STATUS.WARNING,
                             message: 'El exhorto aun no tiene ninguna fecha de diligencia asignada.'
                         }
                     }

                     petition.attachments = getDocuments(libraries.attachments, petition);
                     petition.documents = getDocuments(libraries.documents, petition);
                     petitions.push(petition);
                 }

                 $rootScope.$broadcast('petitionsLoaded', reload);
                 $rootScope.$broadcast('applyChanges');
             },
            function (response, args) {
                console.log(args.get_message())
            }
        );

        return petitions;
    };

    var getDocuments = function (library, petition) {

        var documents = [];

        var url = SPWeb.appWebUrl + "/_api/SP.AppContextSite(@target)" +
            "/web/lists/getbytitle('" + library.name + "')/items?" +
            "@target='" + SPWeb.hostUrl + "'" +
            "&$filter=Folio eq '" + petition.id + "'" +
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

                    petition[library.loadedName] = true;
                },
                error: function (response) {
                    console.log(response);
                }
            });

        return documents;

    };

    var processDocuments = function (petition) {

        // Variable que lleva el conteo de cuantos documentos vamos a procesar
        documentsTotal = petition.attachments.length + petition.documents.length;

        // Variable que lleva el conteo de cuantos documentos han sido procesados
        documentsProcessed = 0;

        if (documentsTotal == 0) {
            isDocumentsProcessComplete();
        } else {
            angular.forEach(petition.attachments, function(document){
                if (document.removed == 1) {
                    deleteDocument(libraries.attachments, petition, document);
                } else if (document.fileId == 0) {
                    saveDocument(libraries.attachments, petition, document);
                } else {
                    updateDocument(libraries.attachments, petition, document);
                }
            });

            angular.forEach(petition.documents, function(document){
                if (document.removed == 1) {
                    deleteDocument(libraries.documents, petition, document);
                } else if (document.fileId == 0) {
                    saveDocument(libraries.documents, petition, document);
                } else {
                    updateDocument(libraries.documents, petition, document);
                }
            });
        }

    };

    var saveDocument = function(library, petition, document) {

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
                                        'Folio': petition.id.toString(),
                                        'Title': document.title,
                                        'Demandado': petition.defendant
                                    }
                                } else {
                                    body = {
                                        '__metadata': {
                                            'type': 'SP.Data.' + libraryItem },
                                        'Folio': petition.id.toString(),
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
                                            var originalElement = getPetitionById(petition.id, mode);

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

    var deleteDocument = function (library, petition, document) {

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
                            var originalElement = getPetitionById(petition.id, mode);

                            for(var i=0; i<petition[library.arrayName].length; i++){
                                if(petition[library.arrayName][i].fileId == document.fileId){
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

    var updateDocument = function(library, petition, document) {

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
                        'Demandado': petition.defendant
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

    var getWarningPetitions = function () {
        return warningList;
    };

    var createPetition = function () {

        var now = moment().locale('es');

        var petition = {
            id: 0,
            type: 'PETITION',
            contractNumber: undefined,
            defendant: undefined,
            court: undefined,
            record: undefined,
            lawyer: undefined,
            municipality: undefined,
            status: DEFAULT_VALUES.PETITION_STATUS.NEW,
            state: undefined,
            attachments: [],
            presentationDate: undefined,
            assignedCourt: undefined,
            petitionNumber: undefined,
            parcel: undefined,
            trackingNumber: undefined,
            received: false,
            documents: [],
            deliveryDate: getDeliveryDate(now),
            realDeliveryDate: undefined,
            delivered: false,
            cashed: false,
            committedDate: undefined,
            comments: undefined,
            creationDate: now
        };

        return petition;
    };

    var savePetition = function (petition) {

        $timeout(function() {
            usSpinnerService.spin('main-spinner');
        },0);

        var itemInfo = new SP.ListItemCreationInformation();
        var item = list.addItem(itemInfo);

        item.set_item('Title', petition.contractNumber);
        item.set_item('Demandado', petition.defendant);
        item.set_item('Juzgado', petition.court);
        item.set_item('Expediente', petition.record);
        item.set_item('Municipio', petition.municipality);
        item.set_item('Estado', new SP.FieldLookupValue().set_lookupId(petition.state.id));
        item.set_item('Estatus', new SP.FieldLookupValue().set_lookupId(StatusService.getStatusByCode(petition.status.code).id));
        item.set_item('Abogado', petition.lawyer);
        item.set_item('Entrega', petition.deliveryDate.toISOString());
        item.set_item('Creacion', petition.creationDate.toISOString());
        item.update();

        context.load(item);
        context.executeQueryAsync(
            function () {

                if (petition.id == 0) {

                    petition.id = item.get_id();
                    processDocuments(petition);

                    if (lastPetitions.length > 4) {
                        lastPetitions.splice(1, 1);
                    }
                    lastPetitions.push(petition);
                    petitions.push(petition);
                    
                }

            },
            function (response, args) {
                console.log(args.get_message());
            }
      );
               
    };

    var updatePetition = function (petition) {

        $timeout(function() {
            usSpinnerService.spin('main-spinner');
        },0);

        var newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.PETITION_STATUS.NEW.code);

        if (petition.cashed) {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.PETITION_STATUS.CASHED.code);
        } else if (petition.delivered) {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.PETITION_STATUS.DELIVERED.code);
        } else if (petition.committedDate) {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.PETITION_STATUS.WAITING_COMMITED_DATE.code);
        } else {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.PETITION_STATUS.NEW.code);
        }

        var item = list.getItemById(petition.id);
        item.set_item('Title', petition.contractNumber);
        item.set_item('Demandado', petition.defendant);
        item.set_item('Juzgado', petition.court);
        item.set_item('Expediente', petition.record);
        item.set_item('Municipio', petition.municipality);
        item.set_item('Estado', new SP.FieldLookupValue().set_lookupId(petition.state.id));
        item.set_item('Estatus', new SP.FieldLookupValue().set_lookupId(newStatus.id));
        item.set_item('Abogado', petition.lawyer);
        item.set_item('Presentacion', (petition.presentationDate ? petition.presentationDate.toISOString() : undefined ));
        item.set_item('Juzgado_x0020_asignado', petition.assignedCourt);
        item.set_item('Numero_x0020_de_x0020_exhorto', petition.petitionNumber);
        item.set_item('Paqueteria', new SP.FieldLookupValue().set_lookupId((petition.parcel ? petition.parcel.id : undefined )));
        item.set_item('Guia', petition.trackingNumber);
        item.set_item('Recibido', petition.received);
        item.set_item('Entrega_x0020_real', (petition.realDeliveryDate ? petition.realDeliveryDate.toISOString() : undefined ));
        item.set_item('Entregado', petition.delivered);
        item.set_item('Cobrado', petition.cashed);
        item.set_item('Comprometida', (petition.committedDate ? petition.committedDate.toISOString() : undefined ));
        item.set_item('Observaciones', petition.comments);
        item.update();

        context.load(item);
        context.executeQueryAsync(
            function () {
                var originalElement = getPetitionById(petition.id, $state.params.mode);

                originalElement.contractNumber = petition.contractNumber;
                originalElement.defendant = petition.defendant;
                originalElement.court = petition.court;
                originalElement.record = petition.record;
                originalElement.lawyer = petition.lawyer;
                originalElement.municipality = petition.municipality;
                originalElement.state = petition.state;
                originalElement.status = newStatus;
                originalElement.presentationDate = petition.presentationDate;
                originalElement.assignedCourt = petition.assignedCourt;
                originalElement.petitionNumber = petition.petitionNumber;
                originalElement.parcel = petition.parcel;
                originalElement.trackingNumber = petition.trackingNumber;
                originalElement.received = petition.received;
                originalElement.realDeliveryDate = petition.realDeliveryDate;
                originalElement.delivered = petition.delivered;
                originalElement.cashed = petition.cashed;
                originalElement.committedDate = petition.committedDate;
                originalElement.comments = petition.comments;

                processDocuments(petition);

            },

            function (response, args) {
                console.log(args.get_message());
            }
        );
    };

    var deletePetition = function (petition) {

        $timeout(function () {
            usSpinnerService.spin('main-spinner');
        }, 0);

        var item = list.getItemById(petition.id);
        item.deleteObject();

        context.executeQueryAsync(
           function () {
               angular.forEach(petition.attachments, function (document) {
                   document.removed = 1;
               });

               angular.forEach(petition.documents, function (document) {
                   document.removed = 1;
               });

               processDocuments(petition);
               deletePetitionById(petition.id);

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
        list = appContext.get_web().get_lists().getByTitle('Exhortos');
        mailList = appContext.get_web().get_lists().getByTitle('Correos electronicos');
        libraries = {
            attachments: {
                type: 'attachment',
                name: 'Adjuntos de exhortos',
                arrayName: 'attachments',
                loadedName: 'attachmentsLoaded'
            },
            documents: {
                type: 'document',
                name: 'Biblioteca de exhortos',
                arrayName: 'documents',
                loadedName: 'documentsLoaded'
            }
        }
    };

    init();

    return {
        createPetition : createPetition,
        getAllPetitions: getAllPetitions,
        getLastPetitions: getLastPetitions,
        getWarningPetitions: getWarningPetitions,
        getPetitionById: getPetitionById,
        updatePetition: updatePetition,
        savePetition: savePetition,
        deletePetition: deletePetition,
        sendMail: sendMail
    }

}]);

