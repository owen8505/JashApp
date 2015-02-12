Jash.factory('ManagerService', ['$resource', 'ContextService', function ($resource, ContextService) {

    var managers = [];
    var SPWeb;

    var getAllManagers = function () {
        /*console.log(SPWeb)
        var serviceUrl = SPWeb.hostUrl + '/_api/lists/getByTitle(\'Gestores\')/items';
        
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