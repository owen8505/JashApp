Jash.factory('CreditService', ["$http", "$q", "$rootScope", "$cookieStore", "$state", "$timeout", "ContextService", "StatusService", "usSpinnerService", "DEFAULT_VALUES", function ($http, $q, $rootScope, $cookieStore, $state, $timeout, ContextService, StatusService, usSpinnerService, DEFAULT_VALUES) {

    var credits = [];
    var lastCredits = [];
    var warningList = [];
    var SPWeb, context, appContext, list, libraries, documentsTotal, documentsProcessed;

    var getDeliveryDate = function (date) {
        var dateCopy = angular.copy(date);
        var days = DEFAULT_VALUES.DELIVERY_RANGES.CREDIT;

        while (days > 0) {
            dateCopy = dateCopy.add(1, 'days');
            // decrease "days" only if it's a weekday.
            if (dateCopy.isoWeekday() !== 6 && dateCopy.isoWeekday() !== 7) {
                days -= 1;
            }
        }

        return dateCopy;
    };

    var getCreditById = function (creditId, mode) {
        var credit = undefined;
        var creditsArray = [];

        switch(mode) {
            case 'all':
                creditsArray = credits;
                break;
            case 'last':
                creditsArray = lastCredits;
                break;
            default:
                break;
        }

        for (var creditIndex = 0; creditIndex < creditsArray.length; creditIndex++) {
            if (creditsArray[creditIndex].id == creditId) {
                credit = creditsArray[creditIndex];
                break;
            }
        }
        return credit;
    };

    var deleteCreditById = function (creditId, mode) {
        var credit = undefined;
        var creditsArray = [];

        switch (mode) {
            case 'all':
                creditsArray = credits;
                break;
            case 'last':
                creditsArray = lastCredits;
                break;
            default:
                break;
        }

        for (var creditIndex = 0; creditIndex < creditsArray.length; creditIndex++) {

            if (creditsArray[creditIndex].id == creditId) {
                creditsArray.splice(creditIndex, 1);
                break;
            }
        }
    };

    var getLastCredits = function (reload) {

        lastCredits = [];
        var queryCAML = '';
        var items = list.getItems(queryCAML);

        context.load(items);
        context.executeQueryAsync(
            function () {
                var listItemEnumerator = items.getEnumerator();
                while (listItemEnumerator.moveNext()) {
                    var item = listItemEnumerator.get_current();

                    var credit = {
                        type: 'CREDIT',
                        id: item.get_id(),
                        lawyer: item.get_item('Abogado'),
                        creationDate: new moment(item.get_item('Creacion')),
                        deliveryDate: new moment(item.get_item('Entrega')),
                        owner: item.get_item('Propietario'),
                        status: (item.get_item('Estatus')) ? { id: item.get_item('Estatus').get_lookupId(), name: item.get_item('Estatus').get_lookupValue() } : undefined,
                        received: item.get_item('Recibido'),
                        realDeliveryDate: (item.get_item('Entrega_x0020_real')) ? new moment(item.get_item('Entrega_x0020_real')) : undefined,
                        delivered: item.get_item('Entregado'),
                        comments: item.get_item('Observaciones'),
                        cashed: item.get_item('Cobrado'),
                        parcel: (item.get_item('Paqueteria')) ? { id: item.get_item('Paqueteria').get_lookupId(), name: item.get_item('Paqueteria').get_lookupValue() } : undefined,
                        trackingNumber: (item.get_item('Guia')) ? item.get_item('Guia') : undefined,
                        invoiceDate: (item.get_item('Fecha_x0020_de_x0020_facturacion')) ? new moment(item.get_item('Fecha_x0020_de_x0020_facturacion')) : undefined,
                        invoiceFolio: item.get_item('Folio_x0020_de_x0020_factura')
                    };

                    var anomalyNowDate = moment().startOf('day');

                    if(credit.deliveryDate && anomalyNowDate.diff(angular.copy(credit.deliveryDate).startOf('day'), 'days') >= 1 && !credit.delivered){
                        // Si ya se pasó la fecha de entrega y no hemos generado el crédito
                        credit.anomaly = {
                            status: DEFAULT_VALUES.ANOMALY_STATUS.ERROR,
                            message: 'La fecha de entrega expiró y el crédito no ha sido generado.'
                        }
                    } else if(credit.deliveryDate && anomalyNowDate.diff(angular.copy(credit.deliveryDate).startOf('day'), 'days') >= -5 && !credit.delivered){
                        // Si faltan cinco días o menos para la fecha de entrega y no hemos generado el crédito
                        credit.anomaly = {
                            status: DEFAULT_VALUES.ANOMALY_STATUS.ERROR,
                            message: 'La fecha de entrega está próxima y el crédito no ha sido generado.'
                        }
                    }

                    credit.attachments = getDocuments(libraries.attachments, credit);
                    credit.documents = getDocuments(libraries.documents, credit);
                    lastCredits.push(credit);
                }

                $rootScope.$broadcast('creditsLoaded', reload);
                $rootScope.$broadcast('applyChanges');
            },
            function (response, args) {
                console.log(args.get_message())
            }
        );

        return lastCredits;
    };

    var getAllCredits = function (reload) {

        credits = [];
        var queryCAML = '';
        var items = list.getItems(queryCAML);

        context.load(items);
        context.executeQueryAsync(
            function () {
                var listItemEnumerator = items.getEnumerator();
                while (listItemEnumerator.moveNext()) {
                    var item = listItemEnumerator.get_current();

                    var credit = {
                        type: 'CREDIT',
                        id: item.get_id(),
                        lawyer: item.get_item('Abogado'),
                        creationDate: new moment(item.get_item('Creacion')),
                        deliveryDate: new moment(item.get_item('Entrega')),
                        owner: item.get_item('Propietario'),
                        status: (item.get_item('Estatus')) ? { id: item.get_item('Estatus').get_lookupId(), name: item.get_item('Estatus').get_lookupValue() } : undefined,
                        received: item.get_item('Recibido'),
                        realDeliveryDate: (item.get_item('Entrega_x0020_real')) ? new moment(item.get_item('Entrega_x0020_real')) : undefined,
                        delivered: item.get_item('Entregado'),
                        comments: item.get_item('Observaciones'),
                        cashed: item.get_item('Cobrado'),
                        parcel: (item.get_item('Paqueteria')) ? { id: item.get_item('Paqueteria').get_lookupId(), name: item.get_item('Paqueteria').get_lookupValue() } : undefined,
                        trackingNumber: (item.get_item('Guia')) ? item.get_item('Guia') : undefined,
                        invoiceDate: (item.get_item('Fecha_x0020_de_x0020_facturacion')) ? new moment(item.get_item('Fecha_x0020_de_x0020_facturacion')) : undefined,
                        invoiceFolio: item.get_item('Folio_x0020_de_x0020_factura')
                    };

                    var anomalyNowDate = moment().startOf('day');

                    if(credit.deliveryDate && anomalyNowDate.diff(angular.copy(credit.deliveryDate).startOf('day'), 'days') >= 1 && !credit.delivered){
                        // Si ya se pasó la fecha de entrega y no hemos generado el crédito
                        credit.anomaly = {
                            status: DEFAULT_VALUES.ANOMALY_STATUS.ERROR,
                            message: 'La fecha límite de entrega expiró y el crédito no ha sido generado.'
                        }
                    } else if(credit.deliveryDate && anomalyNowDate.diff(angular.copy(credit.deliveryDate).startOf('day'), 'days') >= -5 && !credit.delivered){
                        // Si faltan cinco días o menos para la fecha de entrega y no hemos generado el crédito
                        credit.anomaly = {
                            status: DEFAULT_VALUES.ANOMALY_STATUS.ERROR,
                            message: 'La fecha límite de entrega está próxima y el crédito no ha sido generado.'
                        }
                    }

                    credit.attachments = getDocuments(libraries.attachments, credit);
                    credit.documents = getDocuments(libraries.documents, credit);
                    credits.push(credit);
                }

                $rootScope.$broadcast('creditsLoaded', reload);
                $rootScope.$broadcast('applyChanges');
            },
            function (response, args) {
                console.log(args.get_message())
            }
        );

        return credits;
    };

    var getDocuments = function (library, credit) {

        var documents = [];

        var url = SPWeb.appWebUrl + "/_api/SP.AppContextSite(@target)" +
            "/web/lists/getbytitle('" + library.name + "')/items?" +
            "@target='" + SPWeb.hostUrl + "'" +
            "&$filter=Folio eq '" + credit.id + "'" +
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

                    credit[library.loadedName] = true;
                },
                error: function (response) {
                    console.log(response);
                }
            });

        return documents;

    };

    var processDocuments = function (credit) {

        // Variable que lleva el conteo de cuantos documentos vamos a procesar
        documentsTotal = credit.attachments.length + credit.documents.length;

        // Variable que lleva el conteo de cuantos documentos han sido procesados
        documentsProcessed = 0;

        if (documentsTotal == 0){
            isDocumentsProcessComplete();
        } else {
            angular.forEach(credit.attachments, function(document){
                if (document.removed == 1) {
                    deleteDocument(libraries.attachments, credit, document);
                } else if (document.fileId == 0) {
                    saveDocument(libraries.attachments, credit, document);
                } else {
                    updateDocument(libraries.attachments, credit, document);
                }
            });

            angular.forEach(credit.documents, function(document){
                if (document.removed == 1) {
                    deleteDocument(libraries.documents, credit, document);
                } else if (document.fileId == 0) {
                    saveDocument(libraries.documents, credit, document);
                } else {
                    updateDocument(libraries.documents, credit, document);
                }
            });
        }

    };

    var saveDocument = function(library, credit, document) {

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
                        "/web/lists/getbytitle('" + library.name + "')/rootfolder/files/add(url='" + document.name + "',overwrite=true)?" +
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
                                        'Folio': credit.id.toString(),
                                        'Title': document.title,
                                        'Propietario': credit.owner
                                    }
                                } else {
                                    body = {
                                        '__metadata': {
                                            'type': 'SP.Data.' + libraryItem },
                                        'Folio': credit.id.toString(),
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
                                            var originalElement = getCreditById(credit.id, mode);

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

    var deleteDocument = function (library, credit, document) {

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
                            var originalElement = getCreditById(credit.id, mode);

                            for(var i=0; i<credit[library.arrayName].length; i++){
                                if(credit[library.arrayName][i].fileId == document.fileId){
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

    var updateDocument = function(library, credit, document) {

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
                        'Propietario': credit.owner
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

    var getWarningCredits = function () {
        return warningList;
    };

    var createCredit = function () {

        var now = moment().locale('es');

        var credit = {
            id: 0,
            type: 'CREDIT',
            lawyer: undefined,
            creationDate: now,
            deliveryDate: getDeliveryDate(now),
            owner: undefined,
            attachments: [],
            status: DEFAULT_VALUES.CREDIT_STATUS.NEW,
            received: false,
            realDeliveryDate: undefined,
            delivered: false,
            comments: undefined,
            cashed: false,
            parcel: undefined,
            trackingNumber: undefined,
            documents: []
        };

        return credit;
    };

    var saveCredit = function (credit) {

        $timeout(function() {
            usSpinnerService.spin('main-spinner');
        },0);

        var itemInfo = new SP.ListItemCreationInformation();
        var item = list.addItem(itemInfo);

        item.set_item('Abogado', credit.lawyer);
        item.set_item('Creacion', credit.creationDate.toISOString());
        item.set_item('Entrega', credit.deliveryDate.toISOString());
        item.set_item('Propietario', credit.owner);
        item.set_item('Estatus', new SP.FieldLookupValue().set_lookupId(StatusService.getStatusByCode(credit.status.code).id));
        item.update();

        context.load(item);
        context.executeQueryAsync(
            function () {

                if (credit.id == 0) {

                    credit.id = item.get_id();
                    processDocuments(credit);

                    if (lastCredits.length > 4) {
                        lastCredits.splice(1, 1);
                    }
                    lastCredits.push(credit);
                    credits.push(credit);

                }

            },
            function (response, args) {
                console.log(args.get_message());
            }
        );

    };

    var updateCredit = function (credit) {

        $timeout(function() {
            usSpinnerService.spin('main-spinner');
        },0);

        var newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.CREDIT_STATUS.NEW.code);

        if (credit.cashed) {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.CREDIT_STATUS.CASHED.code);
        } else if (credit.delivered) {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.CREDIT_STATUS.DELIVERED.code);
        } else if (credit.received) {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.CREDIT_STATUS.DOCS_RECEIVED.code);
        } else if (credit.trackingNumber) {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.CREDIT_STATUS.WAITING_DOCS.code);
        } else {
            newStatus = StatusService.getStatusByCode(DEFAULT_VALUES.CREDIT_STATUS.NEW.code);
        }

        var item = list.getItemById(credit.id);
        item.set_item('Abogado', credit.lawyer);
        item.set_item('Propietario', credit.owner);
        item.set_item('Estatus', new SP.FieldLookupValue().set_lookupId(newStatus.id));
        item.set_item('Recibido', credit.received);
        item.set_item('Entrega_x0020_real', (credit.realDeliveryDate ? credit.realDeliveryDate.toISOString() : undefined ));
        item.set_item('Entregado', credit.delivered);
        item.set_item('Observaciones', credit.comments);
        item.set_item('Cobrado', credit.cashed);
        item.set_item('Paqueteria', new SP.FieldLookupValue().set_lookupId((credit.parcel ? credit.parcel.id : undefined )));
        item.set_item('Guia', credit.trackingNumber);
        item.update();

        context.load(item);
        context.executeQueryAsync(
            function () {
                var originalElement = getCreditById(credit.id, $state.params.mode);
                originalElement.lawyer = credit.lawyer;
                originalElement.owner = credit.owner;
                originalElement.status = newStatus;
                originalElement.received = credit.received;
                originalElement.realDeliveryDate = credit.realDeliveryDate;
                originalElement.delivered = credit.delivered;
                originalElement.comments = credit.comments;
                originalElement.cashed = credit.cashed;
                originalElement.parcel = credit.parcel;
                originalElement.trackingNumber = credit.trackingNumber;

                processDocuments(credit);

            },

            function (response, args) {
                console.log(args.get_message());
            }
        );
    };

    var deleteCredit = function (credit) {

        $timeout(function () {
            usSpinnerService.spin('main-spinner');
        }, 0);

        var item = list.getItemById(credit.id);
        item.deleteObject();

        context.executeQueryAsync(
            function () {
                angular.forEach(credit.attachments, function (document) {
                    document.removed = 1;
                });

                angular.forEach(credit.documents, function (document) {
                    document.removed = 1;
                });

                processDocuments(credit);
                deleteCreditById(credit.id);

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
        list = appContext.get_web().get_lists().getByTitle('Creditos');
        libraries = {
            attachments: {
                type: 'attachment',
                name: 'Adjuntos de creditos',
                arrayName: 'attachments',
                loadedName: 'attachmentsLoaded'
            },
            documents: {
                type: 'document',
                name: 'Biblioteca de creditos',
                arrayName: 'documents',
                loadedName: 'documentsLoaded'
            }
        }
    };

    init();

    return {
        createCredit : createCredit,
        getAllCredits: getAllCredits,
        getLastCredits: getLastCredits,
        getWarningCredits: getWarningCredits,
        getCreditById: getCreditById,
        updateCredit: updateCredit,
        saveCredit: saveCredit,
        deleteCredit: deleteCredit
    }

}]);

