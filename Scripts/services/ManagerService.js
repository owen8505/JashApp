Jash.factory('ManagerService', ['$resource', 'ContextService', function ($resource, ContextService) {

    var managers = [];
    var SPWeb;

    var getAllManagers = function () {

        this.deferred = $.Deferred();

        var context = new SP.ClientContext(SPWeb.appWebUrl);
        var appContext = new SP.AppContextSite(context, SPWeb.hostUrl);
        var list = appContext.get_web().get_lists().getByTitle('Gestores');
        context.load(list);

        context.executeQueryAsync(
            function (data) {
                console.log(data)
            },
            function (response) {
                console.log(response)
            }
        );
            
        /*console.log(SPWeb)
        var serviceUrl = SPWeb.hostUrl + '/_api/web/lists/getByTitle(\'Gestores\')/items';
        
        $resource(serviceUrl).get({}, function (data) {
            console.log(data)
        });*/

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