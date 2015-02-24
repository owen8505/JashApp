Jash.factory('ManagerService', ['$rootScope', '$resource', 'ContextService', function ($rootScope, $resource, ContextService) {

    var managers = [];
    var SPWeb, context, appContext, list;

    var getManagerById = function (managerId) {        
        var manager = undefined;
        for (var managerIndex = 0; managerIndex < managers.length; managerIndex++) {
            
            if (managers[managerIndex].id == managerId) {
                manager = managers[managerIndex];
                break;
            }
        }
        return manager;
    };

    var deleteManagerById = function (managerId) {
        var manager = undefined;
        for (var managerIndex = 0; managerIndex < managers.length; managerIndex++) {
            
            if (managers[managerIndex].id == managerId) {
                managers.splice(managerIndex,1);
                break;
            }
        }
    };

    var getAllManagers = function () {        
        managers = [];
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

                    var manager = {
                        id: item.get_id(),
                        name: item.get_item('Title'),
                        phone: (item.get_item('Telefono')) ? item.get_item('Telefono') : undefined,
                        cellphone: (item.get_item('Celular')) ? item.get_item('Celular') : undefined,
                        mail: item.get_item('Correo_x0020_electronico'),
                        zone: (item.get_item('Region')) ? { id: item.get_item('Region').get_lookupId(), title: item.get_item('Region').get_lookupValue() } : undefined,
                        score: (item.get_item('Calificacion')) ? item.get_item('Calificacion') : undefined,
                        active: (item.get_item('Activa')) ? item.get_item('Activa') : false
                    };                    
                    
                    managers.push(manager);
                }

               $rootScope.$broadcast('initDataLoaded');
                
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

        var itemInfo = new SP.ListItemCreationInformation();
        var item = list.addItem(itemInfo);
        item.set_item('Title', manager.name);
        item.set_item('Correo_x0020_electronico', manager.mail);
        item.set_item('Celular', manager.cellphone);
        item.set_item('Telefono', manager.phone);
        item.set_item('Region', new SP.FieldLookupValue().set_lookupId(manager.zone.id));
        item.set_item('Calificacion', manager.score);
        item.set_item('Activa', manager.active);
        item.update();

        context.load(item);
        context.executeQueryAsync(
           function () {

               if (manager.id == 0) {
                   manager.id = item.get_id();
                   managers.push(manager);
               }                                  
                               
               $rootScope.$broadcast('itemSaved');

           },
            function (response, args) {
                console.log(args.get_message());
            }
        );        
                
    };

    var updateManager = function (manager) {
       
        var item = list.getItemById(manager.id);
        item.set_item('Title', manager.name);
        item.set_item('Correo_x0020_electronico', manager.mail);
        item.set_item('Celular', manager.cellphone);
        item.set_item('Telefono', manager.phone);
        item.set_item('Calificacion', manager.score);
        item.set_item('Activa', manager.active);
        item.update();

        context.load(item);
        context.executeQueryAsync(
           function () {
               var originalElement = getManagerById(manager.id);
               originalElement.name = manager.name;
               originalElement.mail = manager.mail;
               originalElement.phone = manager.phone;
               originalElement.cellphone = manager.cellphone;
               originalElement.zone = manager.zone;
               originalElement.score = manager.score;
               originalElement.active = manager.active;

               $rootScope.$broadcast('itemUpdated');
           },

            function (response, args) {
                console.log(args.get_message());
            }
        );
    };

    var deleteManager = function (manager) {
        var item = list.getItemById(manager.id);
        item.deleteObject();

        context.executeQueryAsync(
          function () {      
              deleteManagerById(manager.id);              
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
        list = appContext.get_web().get_lists().getByTitle('Gestores');        
    };

    init();

    return {
        getManagerById: getManagerById,
        getAllManagers: getAllManagers,
        createManager: createManager,
        saveManager: saveManager,
        updateManager: updateManager,
        deleteManager: deleteManager
    }

}]);