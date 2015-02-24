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
                        results = searchResults.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
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