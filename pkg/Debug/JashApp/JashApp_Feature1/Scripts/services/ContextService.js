Jash.factory('ContextService', ['$cookieStore', '$window', '$resource', '$state', function ($cookieStore, $window, $resource, $state) {

    var spWeb = {
        appWebUrl: '',
        hostUrl: '',        
        clientTag: '',
        productNumber: ''        
        
    };

    var queryString = '';

    var loadAppContext = function () {
        spWeb.appWebUrl = $cookieStore.get('SPAppWebUrl');
        spWeb.hostUrl = $cookieStore.get('SPHostUrl');        
        spWeb.clientTag = $cookieStore.get('SPClientTag');
        spWeb.productNumber = $cookieStore.get('SPProductNumber');                
    };

    var createAppContext = function () {
        var appWebUrl = decodeURIComponent(queryString['SPAppWebUrl']);   
        var hostUrl = decodeURIComponent(queryString['SPHostUrl']);        
        var clientTag = decodeURIComponent(queryString['SPClientTag']);
        var productNumber = decodeURIComponent(queryString['SPProductNumber']);        

        $cookieStore.put('SPAppWebUrl', appWebUrl);
        $cookieStore.put('SPHostUrl', hostUrl);        
        $cookieStore.put('SPClientTag', clientTag);
        $cookieStore.put('SPProductNumber', productNumber);        

        $window.location.href = appWebUrl + '/app.html';
    };

    var getQueryString = function () {
        var assoc = {};
        var decode = function (s) {
            return decodeURIComponent(s.replace(/\+/g, ""));
        };
        var queryString = $window.location.search.substring(1);
        var keyValues = queryString.split('&');

        for (var i in keyValues) {
            var key = keyValues[i].split('=');
            if (key.length > 1) {
                assoc[decodeURI(key[0])] = decodeURI(key[1]);                   
            }
        }

        return assoc;
    };

    var init = function () {
        
        queryString = getQueryString();        
        
        if (!queryString['SPHostUrl']) {
            loadAppContext();
        } else {
            createAppContext();
        }

        var executor = new SP.RequestExecutor(spWeb.appWebUrl);
        executor.executeAsync({
            url:
                spWeb.appWebUrl +
                "/_api/SP.AppContextSite(@target)/web/lists?@target='" +
                spWeb.hostUrl + "'",
            method: "GET",
            success: function (data) {
                console.log(data)
            },
            error: function (response) {
                console.log(response)
            }

            //_api/lists/getByTitle(\'Gestores\')/items
        });
    };   
 
    init();

    var getSpWeb = function () {
        return spWeb;
    };

    return {
        getSpWeb: getSpWeb
    }
}]);