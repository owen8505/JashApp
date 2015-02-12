Jash.factory('ContextService', ['$cookieStore', '$window', '$state', function ($cookieStore, $window, $state) {

    var spWeb = {
        appWebUrl: '',
        url: '',
        title: '',
        logoUrl: ''
    };

    var queryString = '';

    var loadAppContext = function () {
        spWeb.url = $cookieStore.get('SPAppWebUrl');
        spWeb.url = $cookieStore.get('SPHostUrl');
        spWeb.title = $cookieStore.get('SPHostTitle');
        spWeb.logoUrl = $cookieStore.get('SPHostLogoUrl');
    };

    var createAppContext = function () {
        var appWebUrl = decodeURIComponent(queryString['SPAppWebUrl']);
        var url = decodeURIComponent(queryString['SPHostUrl']);
        var title = decodeURIComponent(queryString['SPHostTitle']);
        var logoUrl = decodeURIComponent(queryString['SPHostLogoUrl']);

        console.log(appWebUrl)

        $cookieStore.put('SPAppWebUrl', appWebUrl);
        $cookieStore.put('SPHostUrl', url);
        $cookieStore.put('SPHostTitle', title);
        $cookieStore.put('SPHostLogoUrl', logoUrl);

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
    };   
 
    init();

    var getSpWeb = function () {
        return spWeb;
    };

    return {
        getSpWeb: getSpWeb
    }
}]);