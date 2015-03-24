'use strict';

Jash.factory('StateService', ['$rootScope', '$resource', 'ContextService', function ($rootScope, $resource, ContextService) {

    var states = [];
    var SPWeb, context, appContext, list;

    var getStateById = function (stateId) {
        var state = undefined;
        for (var stateIndex = 0; stateIndex < states.length; stateIndex++) {

            if (states[stateIndex].id == stateId) {
                state = states[stateIndex];
                break;
            }
        }
        return state;
    };

    var getAllStates = function () {

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

                   var state = {
                       id: item.get_id(),
                       name: item.get_item('Title')
                   };

                   states.push(state);
               }

               $rootScope.statesLoaded = true;
               $rootScope.$broadcast('initDataLoaded');

           },
            function (response, args) {
                console.log(args.get_message())
            }
        );

        return states;
    };

    var init = function () {
        SPWeb = ContextService.getSpWeb();
        context = new SP.ClientContext(SPWeb.appWebUrl);
        appContext = new SP.AppContextSite(context, SPWeb.hostUrl);
        list = appContext.get_web().get_lists().getByTitle('Estados');
    };

    init();

    return {
        getStateById: getStateById,
        getAllStates: getAllStates
    }

}]);
