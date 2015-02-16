'use strict';

Jash.factory('ParcelService', ['$rootScope', '$resource', 'ContextService', function ($rootScope, $resource, ContextService) {

    var parcels = [];
    var SPWeb, context, appContext, list;

    var getParcelById = function (parcelId) {
        var parcel = undefined;
        for (var parcelIndex = 0; parcelIndex < parcels.length; parcelIndex++) {

            if (parcels[parcelIndex].id == parcelId) {
                parcel = parcels[parcelIndex];
                break;
            }
        }
        return parcel;
    };

    var deleteParcelById = function (parcelId) {
        var parcel = undefined;
        for (var parcelIndex = 0; parcelIndex < parcels.length; parcelIndex++) {

            if (parcels[parcelIndex].id == parcelId) {
                parcels.splice(parcelIndex, 1);
                break;
            }
        }
    };

    var getAllParcels = function () {

        // Variable del query CAML
        var queryCAML = '';
        // Variable que almacena los elementos de la lista de SP
        var items = list.getItems(queryCAML);
        // Cargamos y ejecutamos la lista
        context.load(items);
        context.executeQueryAsync(
           function () {
               var listItemEnumerator = items.getEnumerator();
               while (listItemEnumerator.moveNext()) {
                   var item = listItemEnumerator.get_current();

                   var parcel = {
                       id: item.get_id(),
                       name: item.get_item('Title')
                   };

                   parcels.push(parcel);
               }

           },
            function (response, args) {
                console.log(args.get_message())
            }
        );

        return parcels;
    };

    var createParcel = function () {

        var parcel = {
            id: 0,
            name: undefined
        };

        return parcel;
    };

    var saveParcel = function (parcel) {
        var itemInfo = new SP.ListItemCreationInformation();
        var item = list.addItem(itemInfo);
        item.set_item('Title', parcel.name);
        item.update();

        context.load(item);

        context.executeQueryAsync(
           function () {

               if (parcel.id == 0) {
                   parcel.id = item.get_id();
                   parcels.push(parcel);
               }

               $rootScope.$broadcast('itemSaved');

           },
            function (response, args) {
                console.log(args.get_message())
            }
        );

    };

    var updateParcel = function (parcel) {

        var item = list.getItemById(parcel.id);
        item.set_item('Title', parcel.name);
        item.update();

        context.load(item);
        context.executeQueryAsync(
            function () {
                var originalElement = getParcelById(parcel.id);
                originalElement.name = parcel.name;

                $rootScope.$broadcast('itemUpdated');
            },

            function (response, args) {
                console.log(args.get_message());
            }
        );
    };

    var deleteParcel = function (parcel) {
        var item = list.getItemById(parcel.id);
        item.deleteObject();

        context.executeQueryAsync(
            function () {
                deleteParcelById(parcel.id);
                $rootScope.$broadcast('itemDeleted');
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
        list = appContext.get_web().get_lists().getByTitle('Paqueterias');
    };

    init();

    return {
        getParcelById: getParcelById,
        getAllParcels: getAllParcels,
        createParcel: createParcel,
        saveParcel: saveParcel,
        updateParcel: updateParcel,
        deleteParcel: deleteParcel
    }

}]);