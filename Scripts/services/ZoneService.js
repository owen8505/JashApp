Jash.factory('ZoneService', ['$rootScope', '$resource', 'ContextService', function ($rootScope, $resource, ContextService) {

    var zones = [];
    var SPWeb, context, appContext, list;

    var getZoneById = function (zoneId) {
        var zone = undefined;
        for (var zoneIndex = 0; zoneIndex < zones.length; zoneIndex++) {

            if (zones[zoneIndex].id == zoneId) {
                zone = zones[zoneIndex];
                break;
            }
        }
        return zone;
    };

    var deleteZoneById = function (zoneId) {
        var zone = undefined;
        for (var zoneIndex = 0; zoneIndex < zones.length; zoneIndex++) {

            if (zones[zoneIndex].id == zoneId) {
                zones.splice(zoneIndex,1);
                break;
            }
        }
    };

    var getAllZones = function () {
                
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

                    var zone = {
                        id: item.get_id(),
                        name: item.get_item('Title'),
                        active: (item.get_item('Activa')) ? item.get_item('Activa') : false
                    };

                    zones.push(zone);
                }
                
            },
            function (response, args) {
                console.log(args.get_message())
            }
        );                   

        return zones;
    };

    var createZone = function () {

        var zone = {
            id: 0,
            name: undefined,
            active: true
        };

        return zone;
    };

    var saveZone = function (zone) {
        var itemInfo = new SP.ListItemCreationInformation();
        var item = list.addItem(itemInfo);
        item.set_item('Title', zone.name);
        item.set_item('Activa', zone.active);
        item.update();

        context.load(item);

        context.executeQueryAsync(
           function () {

               if(zone.id == 0){
                   zone.id = item.get_id();
                   zones.push(zone);
               }

               $rootScope.$broadcast('itemSaved');

           },
            function (response, args) {
                console.log(args.get_message())
            }
        );
        
    };

    var updateZone = function (zone) {

        var item = list.getItemById(zone.id);
        item.set_item('Title', zone.name);
        item.set_item('Activa', zone.active);
        item.update();

        context.load(item);
        context.executeQueryAsync(
            function () {
                var originalElement = getZoneById(zone.id);
                originalElement.name = zone.name;
                originalElement.active = zone.active;

                $rootScope.$broadcast('itemUpdated');
            },

            function (response, args) {
                console.log(args.get_message());
            }
        );
    };

    var deleteZone = function (zone) {
        var item = list.getItemById(zone.id);
        item.deleteObject();

        context.executeQueryAsync(
            function () {
                deleteZoneById(zone.id);
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
        list = appContext.get_web().get_lists().getByTitle('Regiones');
    };

    init();

    return {
        getZoneById: getZoneById,
        getAllZones: getAllZones,
        createZone: createZone,
        saveZone: saveZone,
        updateZone: updateZone,
        deleteZone: deleteZone
    }

}]);