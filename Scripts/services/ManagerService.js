Jash.factory('ManagerService', ['$resource', 'ContextService', function ($resource, ContextService) {

    var managers = [];
    var SPWeb;

    var getAllManagers = function () {        
        
        // Obtenemos el contexto de sitio
        var context = new SP.ClientContext(SPWeb.appWebUrl);
        // Obtenemos el contexto de la aplicación
        var appContext = new SP.AppContextSite(context, SPWeb.hostUrl);
        // Variable del query CAML
        var queryCAML = '';
        // Variable que almacena la lista de SP
        var list = appContext.get_web().get_lists().getByTitle('Gestores');
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

    var init = function () {
        SPWeb = ContextService.getSpWeb();
    };

    init();

    return {
        getAllManagers: getAllManagers
    }

}]);