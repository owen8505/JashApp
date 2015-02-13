Jash.factory('ManagerService', ['$resource', 'ContextService', function ($resource, ContextService) {

    var managers = [];
    var SPWeb;

    var getAllManagers = function () {        
                     
        var context = new SP.ClientContext(SPWeb.appWebUrl);
        var appContext = new SP.AppContextSite(context, SPWeb.hostUrl);
        var queryCAML = '';

        var list = appContext.get_web().get_lists().getByTitle('Gestores');
        var items = list.getItems(queryCAML);

        context.load(items);
        //{id:0, name:'Ricardo Rosas', phone:'(55) 4354 8820', cellphone:'(55) 4354 8820', mail: 'luis.sanchez.franco@gmail.com', zone:{id:0, title:'Ciudad de México'}, score: 10},
        context.executeQueryAsync(
           function () {                             
               var listItemEnumerator = items.getEnumerator();               
                while (listItemEnumerator.moveNext()) {
                    var oListItem = listItemEnumerator.get_current();
                    console.log(oListItem.get_item('Region').get_lookupValue())
                    var manager = {
                        id: oListItem.get_id(),
                        name: oListItem.get_item('Title'),
                        phone: oListItem.get_item('Telefono'),
                        cellphone: oListItem.get_item('Celular'),
                        mail: oListItem.get_item('Correo_x0020_electronico'),
                        zone: { id: oListItem.get_item('Region')[0], title: oListItem.get_lookupValue()}
                        
                    };
                    console.log(manager)
                    
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