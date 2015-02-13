Jash.factory('ManagerService', ['$resource', 'ContextService', function ($resource, ContextService) {

    var managers = [];
    var SPWeb, context, appContext, list;    

    var getAllManagers = function () {        
                
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
                    var oListItem = listItemEnumerator.get_current();

                    var manager = {
                        id: oListItem.get_id(),
                        name: oListItem.get_item('Title'),
                        phone: oListItem.get_item('Telefono'),
                        cellphone: oListItem.get_item('Celular'),
                        mail: oListItem.get_item('Correo_x0020_electronico'),
                        zone: { id: oListItem.get_item('Region').get_lookupId(), title: oListItem.get_item('Region').get_lookupValue() },
                        score: oListItem.get_item('Calificacion'),
                        active: oListItem.get_item('Activa')
                    };                    
                    
                    managers.push(manager);
                }
                
            },
            function (response, args) {
                console.log(args.get_message())
            }
        );                   

        return managers;
    };

    var createManager = function () {

        var manager = {
            id: 0,
            name: undefined,
            mail: undefined,
            phone: undefined,
            cellphone: undefined,
            zone: undefined,
            score: undefined,
            active: true
        };

        return manager;
    };

    var saveManager = function (manager) {
        console.log(manager)
        var itemInfo = new SP.ListItemCreationInformation();
        var item = itemInfo.addItem(itemInfo);
        item.set_item('Title', manager.name);
        item.set_item('Correo_x0020_electronico', manager.mail);
        item.set_item('Celular', manager.cellphone);
        item.set_item('Telefono', manager.phone);
        item.set_item('Calificacion', manager.score);
        item.set_item('Active', manager.active);
        item.update();

        context.load(item);

        context.executeQueryAsync(
           function () {
               console.log(item);

           },
            function (response, args) {
                console.log(args.get_message())
            }
        );

        //manager.push(manager);
        //return managers;
    };

    var init = function () {
        SPWeb = ContextService.getSpWeb();
        context = new SP.ClientContext(SPWeb.appWebUrl);        
        appContext = new SP.AppContextSite(context, SPWeb.hostUrl);        
        list = appContext.get_web().get_lists().getByTitle('Gestores');
    };

    init();

    return {
        getAllManagers: getAllManagers,
        createManager: createManager
    }

}]);