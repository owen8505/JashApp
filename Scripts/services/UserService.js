Jash.factory('UserService', ["$http", "$q", "ContextService", "DEFAULT_VALUES", function ($http, $q, ContextService, DEFAULT_VALUES) {

    var users = [];
    var spWeb;

    var getAllUsers = function () {

        users = [];

       var url = spWeb.appWebUrl + "/_api/SP.AppContextSite(@target)" +
            "/web/sitegroups/getbyname('App Owners')/users?" +
            "@target='" + spWeb.hostUrl + "'";

        var executor = new SP.RequestExecutor(spWeb.appWebUrl);
        executor.executeAsync(
            {
                url: url,
                method: "GET",
                headers: { "Accept": "application/json; odata=verbose" },
                success: function (data) {
                    
                    // parse the results into an object that you can use within javascript
                    var results = eval(JSON.parse(data.body).d.results);
                    angular.forEach(results, function (item) {
                        if (item.Title != 'System Account') {
                            var user = {
                                id: item.Id,
                                title: item.Title
                            }
                            users.push(user);
                        }
                    });
                    

                },
                error: function (data) {

                    // an error occured, the details can be found in the data object.
                    console.log(data)
                }
            });

        return users;
    };

    var init = function () {
        spWeb = ContextService.getSpWeb();
    };

    init();

    return {
        getAllUsers: getAllUsers
    }

}]);