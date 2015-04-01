Jash.factory('SeizureService', ["$http", "$q", "$rootScope", "$cookieStore", "$state", "$timeout", "ContextService", "StatusService", "usSpinnerService", "DEFAULT_VALUES", function ($http, $q, $rootScope, $cookieStore, $state, $timeout, ContextService, StatusService, usSpinnerService, DEFAULT_VALUES) {

    var seizures = [];
    var lastSeizures = [];
    var warningList = [];    
    var SPWeb, context, appContext, list, libraries, mailList, documentsTotal, documentsProcessed;

    var getDeliveryDate = function (date) {
        var copyDate = angular.copy(date);
        var days = DEFAULT_VALUES.DELIVERY_RANGES.SEIZURE;

        while (days > 0) {
            copyDate = copyDate.add(1, 'days');
            // decrease "days" only if it's a weekday.
            if (copyDate.isoWeekday() !== 6 && copyDate.isoWeekday() !== 7) {
                days -= 1;
            }
        }

        return copyDate;
    };

    var getSeizureById = function (seizureId, mode) {
        var seizure = undefined;
        var seizuresArray = [];

        switch(mode) {
            case 'all':
                seizuresArray = seizures;
                break;
            case 'last':
                seizuresArray = lastSeizures;
                break;
            default:
                break;
        }

        for (var seizureIndex = 0; seizureIndex < seizuresArray.length; seizureIndex++) {
            if (seizuresArray[seizureIndex].id == seizureId) {
                seizure = seizuresArray[seizureIndex];
                break;
            }
        }

        return seizure;
    };

    var deleteSeizureById = function (seizureId, mode) {
        var seizuresArray = [];

        switch (mode) {
            case 'all':
                seizuresArray = seizures;
                break;
            case 'last':
                seizuresArray = lastSeizures;
                break;
            default:
                break;
        }
        for (var seizureIndex = 0; seizureIndex < seizuresArray.length; seizureIndex++) {

            if (seizuresArray[seizureIndex].id == seizureId) {
                seizuresArray.splice(seizureIndex, 1);
                break;
            }
        }
    };

    var getLastSeizures = function (reload) {
        lastSeizures = [];

        var queryString = '<View><Query>' +
                            '<OrderBy>' +
                               '<FieldRef Name=\'ID\' Ascending="FALSE" />' +
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

                     var seizure = {
                         type: 'SEIZURE',
                         id: item.get_id(),
                         contractNumber: item.get_item('Title'),
                         defendant: item.get_item('Demandado'),
                         court: item.get_item('Juzgado'),
                         record: item.get_item('Expediente'),
                         lawyer: item.get_item('Abogado'),
                         municipality: item.get_item('Municipio'),
                         state: (item.get_item('Estado')) ? { id: item.get_item('Estado').get_lookupId(), name: item.get_item('Estado').get_lookupValue() } : undefined,
                         status: (item.get_item('Estatus')) ? { id: item.get_item('Estatus').get_lookupId(), name: item.get_item('Estatus').get_lookupValue() } : undefined,
                         realEstate: item.get_item('Inmueble'),
                         precedent: item.get_item('Antecedente'),
                         parcel: (item.get_item('Paqueteria')) ? { id: item.get_item('Paqueteria').get_lookupId(), name: item.get_item('Paqueteria').get_lookupValue() } : undefined,
                         trackingNumber: (item.get_item('Guia')) ? item.get_item('Guia') : undefined,
                         received: item.get_item('Recibido'),
                         deliveryDate: new moment(item.get_item('Entrega')),
                         realDeliveryDate: item.get_item('Entrega_x0020_real'),
                         delivered: item.get_item('Entregado'),
                         cashed: item.get_item('Cobrado'),
                         comments: item.get_item('Observaciones'),
                         creationDate: new moment(item.get_item('Creacion')),
                         cost: (item.get_item('Costo')) ? item.get_item('Costo') : undefined,
                         paymentApply: item.get_item('Aplica')
                     };
                     
                     var anomalyNowDate = moment().startOf('day');

                     if(seizure.deliveryDate && anomalyNowDate.diff(angular.copy(seizure.deliveryDate).startOf('day'), 'days') >= 1 && !seizure.delivered){
                         // Si ya se pasó la fecha de entrega y no hemos entregado el embargo
                         seizure.anomaly = {
                             status: DEFAULT_VALUES.ANOMALY_STATUS.ERROR,
                             message: 'La fecha de entrega expiró y el embargo no ha sido enviado.'
                         }
                     }

                     seizure.attachments = getDocuments(libraries.attachments, seizure);
                     seizure.documents = getDocuments(libraries.documents, seizure);
                     lastSeizures.push(seizure);
                 }

                 $rootScope.$broadcast('seizuresLoaded', reload);
                 $rootScope.$broadcast('applyChanges');

             },
            function (response, args) {
                console.log(args.get_message())
            }
        );

        return lastSeizures;
    };

    var getAllSeizures = function (reload) {

        seizures = [];
        var queryCAML = '';
        var items = list.getItems(queryCAML);

        context.load(items);        
        context.executeQueryAsync(
             function () {
                 var listItemEnumerator = items.getEnumerator();
                 while (listItemEnumerator.moveNext()) {
                     var item = listItemEnumerator.get_current();

                     var seizure = {
                         type: 'SEIZURE',
                         id: item.get_id(),
                         contractNumber: item.get_item('Title'),
                         defendant: item.get_item('Demandado'),
                         court: item.get_item('Juzgado'),
                         record: item.get_item('Expediente'),
                         lawyer: item.get_item('Abogado'),
                         municipality: item.get_item('Municipio'),
                         state: (item.get_item('Estado')) ? { id: item.get_item('Estado').get_lookupId(), name: item.get_item('Estado').get_lookupValue() } : undefined,
                         status: (item.get_item('Estatus')) ? { id: item.get_item('Estatus').get_lookupId(), name: item.get_item('Estatus').get_lookupValue() } : undefined,
                         realEstate: item.get_item('Inmueble'),
                         precedent: item.get_item('Antecedente'),
                         parcel: (item.get_item('Paqueteria')) ? { id: item.get_item('Paqueteria').get_lookupId(), name: item.get_item('Paqueteria').get_lookupValue() } : undefined,
                         trackingNumber: (item.get_item('Guia')) ? item.get_item('Guia') : undefined,
                         received: item.get_item('Recibido'),
                         deliveryDate: new moment(item.get_item('Entrega')),
                         realDeliveryDate: item.get_item('Entrega_x0020_real'),
                         delivered: item.get_item('Entregado'),
                         cashed: item.get_item('Cobrado'),
                         comments: item.get_item('Observaciones'),
                         creationDate: new moment(item.get_item('Creacion')),
                         cost: (item.get_item('Costo')) ? item.get_item('Costo') : undefined,
                         paymentApply: item.get_item('Aplica')
                     };

                     var anomalyNowDate = moment().startOf('day');

                     if(seizure.deliveryDate && anomalyNowDate.diff(angular.copy(seizure.deliveryDate).startOf('day'), 'days') >= 1 && !seizure.delivered){
                         // Si ya se pasó la fecha de entrega y no hemos entregado el embargo
                         seizure.anomaly = {
                             status: DEFAULT_VALUES.ANOMALY_STATUS.ERROR,
                             message: 'La fecha de entrega expiró y el embargo no ha sido enviado.'
                         }
                     }

                     seizure.attachments = getDocuments(libraries.attachments, seizure);
                     seizure.documents = getDocuments(libraries.documents, seizure);
                     seizures.push(seizure);
                 }

                 $rootScope.$broadcast('seizuresLoaded', reload);
                 $rootScope.$broadcast('applyChanges');
             },
            function (response, args) {
                console.log(args.get_message())
            }
        );

        return seizures;
    };

    var getDocuments = function (library, seizure) {

        var documents = [];

        var url = SPWeb.appWebUrl + "/_api/SP.AppContextSite(@target)" +
            "/web/lists/getbytitle('" + library.name + "')/items?" +
            "@target='" + SPWeb.hostUrl + "'" +
            "&$filter=Folio eq '" + seizure.id + "'" +
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

                    seizure[library.loadedName] = true;
                },
                error: function (response) {
                    console.log(response);
                }
            });

        return documents;

    };

    var processDocuments = function (seizure) {

        // Variable que lleva el conteo de cuantos documentos vamos a procesar
        documentsTotal = seizure.attachments.length + seizure.documents.length;

        // Variable que lleva el conteo de cuantos documentos han sido procesados
        documentsProcessed = 0;

        if (documentsTotal == 0) {
            isDocumentsProcessComplete();
        } else {
            angular.forEach(seizure.attachments, function(document){
                if (document.removed == 1) {
                    deleteDocument(libraries.attachments, seizure, document);
                } else if (document.fileId == 0) {
                    saveDocument(libraries.attachments, seizure, document);
                } else {
                    updateDocument(libraries.attachments, seizure, document);
                }
            });

            angular.forEach(seizure.documents, function(document){
                if (document.removed == 1) {
                    deleteDocument(libraries.documents, seizure, document);
                } else if (document.fileId == 0) {
                    saveDocument(libraries.documents, seizure, document);
                } else {
                    updateDocument(libraries.documents, seizure, document);
                }
            });
        }

    };

    var saveDocument = function(library, seizure, document) {

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
                                        'Folio': seizure.id.toString(),
                                        'Title': document.title,
                                        'Demandado': seizure.defendant
                                    }
                                } else {
                                    body = {
                                        '__metadata': {
                                            'type': 'SP.Data.' + libraryItem },
                                        'Folio': seizure.id.toString(),
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
                                            var originalElement = getSeizureById(seizure.id, mode);

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

    var deleteDocument = function (library, seizure, document) {

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
                            var originalElement = getSeizureById(seizure.id, mode);

                            for(var i=0; i<seizure[library.arrayName].length; i++){
                                if(seizure[library.arrayName][i].fileId == document.fileId){
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

    var updateDocument = function(library, seizure, document) {

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
                        'Demandado': seizure.defendant
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

    var getWarningSeizures = function () {
        return warningList;
    };

    var createSeizure = function () {

        var now = moment().locale('es');

        var seizure = {
            id: 0,
            type: 'SEIZURE',
            contractNumber: undefined,
            defendant: undefined,
            court: undefined,
            record: undefined,
            lawyer: undefined,
            municipality: undefined,
            status: DEFAULT_VALUES.SEIZURE_STATUS.NEW,
            state: undefined,
            attachments: [],
            realEstate: undefined,
            precedent: undefined,
            parcel: undefined,
            trackingNumber: undefined,
            received: false,
            documents: [],
            deliveryDate: getDeliveryDate(now),
            realDeliveryDate: undefined,
            delivered: false,
            cashed: false,
            comments: undefined,
            creationDate: now,
            cost: undefined,
            paymentApply: false
        };

        return seizure;
    };

    var saveSeizure = function (seizure) {
        
        $timeout(function() {
            usSpinnerService.spin('main-spinner');
        },0);

        var itemInfo = new SP.ListItemCreationInformation();
        var item = list.addItem(itemInfo);

        item.set_item('Title', seizure.contractNumber);
        item.set_item('Demandado', seizure.defendant);
        item.set_item('Juzgado', seizure.court);
        item.set_item('Expediente', seizure.record);
        item.set_item('Municipio', seizure.municipality);
        item.set_item('Estado', new SP.FieldLookupValue().set_lookupId(seizure.state.id));
        item.set_item('Estatus', new SP.FieldLookupValue().set_lookupId(StatusService.getStatusByCode(seizure.status.code).id));
        item.set_item('Abogado', seizure.lawyer);
        item.set_item('Entrega', seizure.deliveryDate.toISOString());
        item.set_item('Creacion', seizure.creationDate.toISOString());
        item.update();

        context.load(item);
        context.executeQueryAsync(
            function () {

                if (seizure.id == 0) {

                    seizure.id = item.get_id();
                    processDocuments(seizure);

                    if (lastSeizures.length > 4) {
                        lastSeizures.splice(1, 1);
                    }
                    lastSeizures.push(seizure);
                    seizures.push(seizure);
                    
                }

            },
            function (response, args) {
                console.log(args.get_message());
            }
      );
               
    };

    var updateSeizure = function (seizure) {

        $timeout(function() {
            usSpinnerService.spin('main-spinner');
        },0);

        var newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.SEIZURE_STATUS.NEW.code);

        if (seizure.cashed) {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.SEIZURE_STATUS.CASHED.code);
        } else if (seizure.delivered) {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.SEIZURE_STATUS.DELIVERED.code);
        } else {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.SEIZURE_STATUS.NEW.code);
        }

        var item = list.getItemById(seizure.id);
        item.set_item('Title', seizure.contractNumber);
        item.set_item('Demandado', seizure.defendant);
        item.set_item('Juzgado', seizure.court);
        item.set_item('Expediente', seizure.record);
        item.set_item('Municipio', seizure.municipality);
        item.set_item('Estado', new SP.FieldLookupValue().set_lookupId(seizure.state.id));
        item.set_item('Estatus', new SP.FieldLookupValue().set_lookupId(newStatus.id));
        item.set_item('Abogado', seizure.lawyer);
        item.set_item('Inmueble', seizure.realEstate);
        item.set_item('Antecedente', seizure.precedent);
        item.set_item('Paqueteria', new SP.FieldLookupValue().set_lookupId((seizure.parcel ? seizure.parcel.id : undefined )));
        item.set_item('Guia', seizure.trackingNumber);
        item.set_item('Recibido', seizure.received);
        item.set_item('Entrega_x0020_real', seizure.realDeliveryDate);
        item.set_item('Entregado', seizure.delivered);
        item.set_item('Cobrado', seizure.cashed);
        item.set_item('Observaciones', seizure.comments);
        item.set_item('Costo', seizure.cost);
        item.set_item('Aplica', seizure.paymentApply);
        item.update();

        context.load(item);
        context.executeQueryAsync(
            function () {
                var originalElement = getSeizureById(seizure.id, $state.params.mode);

                originalElement.contractNumber = seizure.contractNumber;
                originalElement.defendant = seizure.defendant;
                originalElement.court = seizure.court;
                originalElement.record = seizure.record;
                originalElement.lawyer = seizure.lawyer;
                originalElement.municipality = seizure.municipality;
                originalElement.state = seizure.state;
                originalElement.status = newStatus;
                originalElement.realEstate = seizure.realEstate;
                originalElement.precedent = seizure.precedent;
                originalElement.parcel = seizure.parcel;
                originalElement.trackingNumber = seizure.trackingNumber;
                originalElement.received = seizure.received;
                originalElement.realDeliveryDate = seizure.realDeliveryDate;
                originalElement.delivered = seizure.delivered;
                originalElement.cashed = seizure.cashed;
                originalElement.comments = seizure.comments;
                originalElement.cost = seizure.cost;
                originalElement.paymentApply = seizure.paymentApply;

                processDocuments(seizure);

            },

            function (response, args) {
                console.log(args.get_message());
            }
        );
    };

    var deleteSeizure = function (seizure) {

        $timeout(function () {
            usSpinnerService.spin('main-spinner');
        }, 0);

        var item = list.getItemById(seizure.id);
        item.deleteObject();

        context.executeQueryAsync(
           function () {
               angular.forEach(seizure.attachments, function (document) {
                   document.removed = 1;
               });

               angular.forEach(seizure.documents, function (document) {
                   document.removed = 1;
               });

               processDocuments(seizure);
               deleteSeizureById(seizure.id);

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
        list = appContext.get_web().get_lists().getByTitle('Embargos');
        mailList = appContext.get_web().get_lists().getByTitle('Correos electronicos');
        libraries = {
            attachments: {
                type: 'attachment',
                name: 'Adjuntos de embargos',
                arrayName: 'attachments',
                loadedName: 'attachmentsLoaded'
            },
            documents: {
                type: 'document',
                name: 'Biblioteca de embargos',
                arrayName: 'documents',
                loadedName: 'documentsLoaded'
            }
        }
    };

    init();

    return {
        createSeizure : createSeizure,
        getAllSeizures: getAllSeizures,
        getLastSeizures: getLastSeizures,
        getWarningSeizures: getWarningSeizures,
        getSeizureById: getSeizureById,
        updateSeizure: updateSeizure,
        saveSeizure: saveSeizure,
        deleteSeizure: deleteSeizure,
        sendMail: sendMail
    }

}]);

