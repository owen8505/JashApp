Jash.factory('StatusService', ["$http", "$q", "$rootScope", "$cookieStore", "ContextService", "DEFAULT_VALUES", function ($http, $q, $rootScope, $cookieStore, ContextService, DEFAULT_VALUES) {

    var statuses = [];
    var SPWeb, context, appContext, list;

    var getStatusById = function (statusId) {
        var status = undefined;
        for (var statusIndex = 0; statusIndex < statuses.length; statusIndex++) {
            if (statuses[statusIndex].id == statusId) {
                status = statuses[statusIndex];
                break;
            }
        }
        return status;
    };

    var getStatusByCode = function (statusCode) {
        var status = undefined;
        for (var statusIndex = 0; statusIndex < statuses.length; statusIndex++) {
            if (statuses[statusIndex].code == statusCode) {
                status = statuses[statusIndex];
                break;
            }
        }
        return status;
    };

    var getAllStatuses = function () {

        statuses = [];
        var queryCAML = '';
        var items = list.getItems(queryCAML);

        context.load(items);        
        context.executeQueryAsync(
            function () {
                var listItemEnumerator = items.getEnumerator();
                while (listItemEnumerator.moveNext()) {
                    var item = listItemEnumerator.get_current();

                    var status = {
                        id: item.get_id(),
                        name: item.get_item('Title'),
                        code: item.get_item('Code')
                    };

                    statuses.push(status);
                 }

                $rootScope.$broadcast('initDataLoaded');
             },
            function (response, args) {
                console.log(args.get_message())
            }
        );

        return statuses;
    }

    var init = function () {
        SPWeb = ContextService.getSpWeb();
        context = new SP.ClientContext(SPWeb.appWebUrl);
        appContext = new SP.AppContextSite(context, SPWeb.hostUrl);
        list = appContext.get_web().get_lists().getByTitle('Estatus');
    };

    init();

    return {
        getStatusById : getStatusById,
        getStatusByCode: getStatusByCode,
        getAllStatuses: getAllStatuses
    }

}]);

