Jash.factory('InvoiceService', ["$http", "$q", "$rootScope", "$cookieStore", "$state", "$timeout", "ContextService", "usSpinnerService", "DEFAULT_VALUES", function ($http, $q, $rootScope, $cookieStore, $state, $timeout, ContextService, usSpinnerService, DEFAULT_VALUES) {

    var invoices = [];
    var SPWeb, context, appContext, list, libraries, documentsTotal, documentsProcessed;

    var getInvoiceById = function (id) {
        var invoice = undefined;

        for (var invoiceIndex = 0; invoiceIndex < invoices.length; invoiceIndex++) {
            if (invoices[invoiceIndex].id == id) {
                invoice = invoices[invoiceIndex];
                break;
            }
        }
        return invoice;
    };

    var deleteInvoiceById = function (id) {
        var invoice = undefined;
        for (var invoiceIndex = 0; invoiceIndex < invoicesArray.length; invoiceIndex++) {

            if (invoices[invoiceIndex].id == id) {
                invoices.splice(invoiceIndex, 1);
                break;
            }
        }
    };

    var getAllInvoices = function (reload) {

        invoices = [];
        var queryCAML = '';
        var items = list.getItems(queryCAML);

        context.load(items);
        context.executeQueryAsync(
            function () {
                var listItemEnumerator = items.getEnumerator();
                while (listItemEnumerator.moveNext()) {
                    var item = listItemEnumerator.get_current();

                    var invoice = {
                        type: 'INVOICE',
                        id: item.get_id(),
                        folio: item.get_item('Title'),
                        requestIds: [],
                        cashed: item.get_item('Cobrado')
                    };

                    if (item.get_item('Folios')) {
                        invoice.requestIds = item.get_item('Folios').split(';')
                    }

                    invoice.documents = getDocuments(libraries.documents, invoice.id);
                    invoices.push(invoice);
                }

                $rootScope.$broadcast('invoicesLoaded', reload);
                $rootScope.$broadcast('applyChanges');
            },
            function (response, args) {
                console.log(args.get_message())
            }
        );

        return invoices;
    };

    var getDocuments = function (library, id) {

        var documents = [];

        var url = SPWeb.appWebUrl + "/_api/SP.AppContextSite(@target)" +
            "/web/lists/getbytitle('" + library.name + "')/items?" +
            "@target='" + SPWeb.hostUrl + "'" +
            "&$filter=Id_x0020_de_x0020_factura eq '" + id + "'" +
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

                },
                error: function (response) {
                    console.log(response);
                }
            });
        
        return documents;

    };

    var updateDocuments = function (invoice) {

        // Variable que lleva el conteo de cuantos documentos vamos a procesar
        documentsTotal = 0;

        // Variable que lleva el conteo de cuantos documentos han sido procesados
        documentsProcessed = 0;

        angular.forEach(invoice.documents, function(document){
            if (document.removed == 1) {
                documentsTotal++;
            } else if (document.fileId == 0) {
                documentsTotal++;
            }
        });

        if (documentsTotal == 0){
            isDocumentsProcessComplete();
        } else {

            angular.forEach(invoice.documents, function(document){
                if (document.removed == 1) {
                    deleteDocument(libraries.documents, invoice, document);
                } else if (document.fileId == 0) {
                    saveDocument(libraries.documents, invoice, document);
                }
            });
        }

    };

    var saveDocument = function(library, invoice, document) {

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
                                        'Id_x0020_de_x0020_factura': invoice.id.toString(),
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
                                            var originalElement = getInvoiceById(invoice.id);

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

    var deleteDocument = function (library, invoice, document) {

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
                            var originalElement = getInvoiceById(invoice.id);

                            for(var i=0; i<invoice[library.arrayName].length; i++){
                                if(invoice[library.arrayName][i].fileId == document.fileId){
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

    var isDocumentsProcessComplete = function() {
        if (documentsTotal == documentsProcessed){
            usSpinnerService.stop('main-spinner');

            $rootScope.$broadcast('applyChanges');
            $rootScope.$broadcast('itemUpdated');
        }
    };

    var createInvoice = function () {

        var invoice = {
            id: 0,
            type: 'INVOICE',
            folio: undefined,
            requestIds: [],
            cashed: false,
            documents: []
        };

        return invoice;
    };

    var saveInvoice = function (invoice) {

        $timeout(function() {
            usSpinnerService.spin('main-spinner');
        },0);

        var itemInfo = new SP.ListItemCreationInformation();
        var item = list.addItem(itemInfo);

        item.set_item('Title', invoice.folio);
        item.set_item('Folios', invoice.requestIds.join(';'));
        item.set_item('Cobrado', invoice.cashed);

        item.update();

        context.load(item);
        context.executeQueryAsync(
            function () {

                if (invoice.id == 0) {

                    invoice.id = item.get_id();
                    updateDocuments(invoice);

                    invoices.push(invoice);

                }

            },
            function (response, args) {
                console.log(args.get_message());
            }
        );

    };

    var updateInvoice = function (invoice) {

        $timeout(function() {
            usSpinnerService.spin('main-spinner');
        },0);

        var item = list.getItemById(invoice.id);
        item.set_item('Title', invoice.folio);
        item.set_item('Folios', invoice.requestIds.join(';'));
        item.set_item('Cobrado', invoice.cashed);
        item.update();

        context.load(item);
        context.executeQueryAsync(
            function () {
                var originalElement = getInvoiceById(invoice.id);
                originalElement.folio = invoice.folio;
                originalElement.requestIds = invoice.requestIds;
                originalElement.cashed = invoice.cashed;

                updateDocuments(invoice);

            },

            function (response, args) {
                console.log(args.get_message());
            }
        );
    };

    var deleteInvoice = function (invoice) {

        $timeout(function () {
            usSpinnerService.spin('main-spinner');
        }, 0);

        var item = list.getItemById(invoice.id);
        item.deleteObject();

        context.executeQueryAsync(
            function () {

                angular.forEach(invoice.documents, function (document) {
                    document.removed = 1;
                });

                updateDocuments(invoice);
                deleteInvoiceById(invoice.id);

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
        list = appContext.get_web().get_lists().getByTitle('Facturas');
        libraries = {
            documents: {
                type: 'document',
                name: 'Biblioteca de facturas',
                arrayName: 'documents'
            }
        }
    };

    init();

    return {
        createInvoice : createInvoice,
        getAllInvoices: getAllInvoices,
        getInvoiceById: getInvoiceById,
        updateInvoice: updateInvoice,
        saveInvoice: saveInvoice,
        deleteInvoice: deleteInvoice
    }

}]);

