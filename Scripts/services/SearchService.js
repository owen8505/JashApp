Jash.factory('SearchService', ["$http", "$q", "$rootScope", "ContextService", "DEFAULT_VALUES", function ($http, $q, $rootScope, ContextService, DEFAULT_VALUES) {

    var results = [];
    var spWeb;

    var search = function (searchParams) {
        results = [];

        var url = spWeb.appWebUrl + "/_api/search/query?" +
            "querytext='" + searchParams + "'";

        var executor = new SP.RequestExecutor(spWeb.appWebUrl);
        executor.executeAsync(
            {
                url: url,
                method: "GET",
                headers: { "Accept": "application/json; odata=verbose" },
                success: function (data) {
                    var searchResults = eval(JSON.parse(data.body).d);
                    
                    if (searchResults.query.PrimaryQueryResult) {
                        resultsArray = searchResults.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
                        for (var resultIndex in resultsArray) {
                            var resultItem = resultsArray[resultIndex].Cells.results;
                            var result = {
                                title: resultItem[3].Value,
                                url: resultItem[6].Value
                            }
                            results.push(result);                            
                        }
                        
                    }

                   $rootScope.$broadcast('itemsFound');
                },
                error: function (data) {

                    // an error occured, the details can be found in the data object.
                    console.log(data)
                }
            });
    };

    var getSearchResults = function () {
        return results;
    };

    var init = function () {
        spWeb = ContextService.getSpWeb();
    };

    init();

    return {
        search: search,
        getSearchResults: getSearchResults
    }

}]);